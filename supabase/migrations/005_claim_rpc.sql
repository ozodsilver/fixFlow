create or replace function rpc_claim_dispatch(
  p_dispatch_id uuid,
  p_master_user_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_ip inet default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_scope constant text := 'master.claim_dispatch';
  v_now timestamptz := now();

  v_dispatch dispatch_records%rowtype;
  v_request service_requests%rowtype;
  v_order orders%rowtype;
  v_current_assignment order_assignments%rowtype;

  v_resp jsonb;
  v_code int;
  v_idem idempotency_keys%rowtype;
  v_exists boolean;
  v_from_order_status order_status;
begin
  if p_dispatch_id is null or p_master_user_id is null or coalesce(trim(p_idempotency_key), '') = '' then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'validation.failed', 'message', 'Missing required claim params')
    );
  end if;

  begin
    insert into idempotency_keys(scope, key, request_hash, created_by_user_id, created_at, expires_at)
    values (v_scope, p_idempotency_key, p_request_hash, p_master_user_id, v_now, v_now + interval '24 hour')
    returning * into v_idem;
  exception
    when unique_violation then
      select * into v_idem
      from idempotency_keys
      where scope = v_scope and key = p_idempotency_key
      for update;

      if v_idem.request_hash <> p_request_hash then
        return jsonb_build_object(
          'ok', false,
          'error', jsonb_build_object('code', 'validation.failed', 'message', 'Idempotency key reused with different payload')
        );
      end if;

      if v_idem.response_body is not null then
        return v_idem.response_body || jsonb_build_object('replayed', true);
      end if;
  end;

  select exists (
    select 1
    from master_profiles mp
    where mp.user_id = p_master_user_id
      and mp.approval_status = 'approved'
      and mp.is_active = true
  ) into v_exists;

  if not v_exists then
    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'master.not_approved', 'message', 'Master is not approved')
    );
    v_code := 403;
    update idempotency_keys
    set response_code = v_code, response_body = v_resp
    where id = v_idem.id;
    return v_resp;
  end if;

  select * into v_dispatch
  from dispatch_records
  where id = p_dispatch_id
  for update;

  if not found then
    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'request.not_found', 'message', 'Dispatch not found')
    );
    v_code := 404;
    update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
    return v_resp;
  end if;

  if v_dispatch.status = 'claimed' then
    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'dispatch.already_claimed', 'message', 'Dispatch already claimed')
    );
    v_code := 409;
    update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
    return v_resp;
  end if;

  if v_dispatch.expires_at is not null and v_dispatch.expires_at <= v_now then
    update dispatch_records
    set status = 'expired', expires_at = v_dispatch.expires_at
    where id = v_dispatch.id and status = 'open';

    insert into status_history(entity_type, entity_id, from_status, to_status, actor_role, reason)
    values ('dispatch', v_dispatch.id, v_dispatch.status::text, 'expired', 'system', 'expired_at_claim_attempt');

    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'dispatch.expired', 'message', 'Dispatch expired')
    );
    v_code := 409;
    update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
    return v_resp;
  end if;

  if v_dispatch.status <> 'open' then
    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'dispatch.claim_conflict', 'message', 'Dispatch is not open for claim')
    );
    v_code := 409;
    update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
    return v_resp;
  end if;

  select * into v_request
  from service_requests
  where id = v_dispatch.request_id
  for update;

  if not found then
    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'request.not_found', 'message', 'Request not found')
    );
    v_code := 404;
    update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
    return v_resp;
  end if;

  if v_request.status <> 'dispatched' then
    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'dispatch.claim_conflict', 'message', 'Request is not in dispatched state')
    );
    v_code := 409;
    update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
    return v_resp;
  end if;

  select * into v_order
  from orders
  where request_id = v_request.id
  for update;

  if not found then
    insert into orders(request_id, status)
    values (v_request.id, 'accepted')
    returning * into v_order;
  else
    v_from_order_status := v_order.status;
    if v_order.status = 'reassignment_pending' then
      update orders
      set status = 'accepted', canceled_at = null
      where id = v_order.id
      returning * into v_order;

      insert into status_history(entity_type, entity_id, from_status, to_status, actor_user_id, actor_role, reason)
      values ('order', v_order.id, v_from_order_status::text, 'accepted', p_master_user_id, 'master', 'reassignment_claimed');
    else
      v_resp := jsonb_build_object(
        'ok', false,
        'error', jsonb_build_object('code', 'dispatch.already_claimed', 'message', 'Order already has active fulfillment')
      );
      v_code := 409;
      update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
      return v_resp;
    end if;
  end if;

  select * into v_current_assignment
  from order_assignments
  where order_id = v_order.id and is_current = true
  for update;

  if found then
    v_resp := jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'dispatch.already_claimed', 'message', 'Current assignment already exists')
    );
    v_code := 409;
    update idempotency_keys set response_code = v_code, response_body = v_resp where id = v_idem.id;
    return v_resp;
  end if;

  insert into order_assignments(order_id, master_id, status, is_current, assigned_at)
  values (v_order.id, p_master_user_id, 'active', true, v_now)
  returning * into v_current_assignment;

  update dispatch_records
  set status = 'claimed',
      claimed_by_master_id = p_master_user_id,
      claimed_at = v_now
  where id = v_dispatch.id;

  update service_requests
  set status = 'in_fulfillment'
  where id = v_request.id;

  insert into status_history(entity_type, entity_id, from_status, to_status, actor_user_id, actor_role, reason)
  values
    ('dispatch', v_dispatch.id, v_dispatch.status::text, 'claimed', p_master_user_id, 'master', 'claim_confirmed'),
    ('request', v_request.id, v_request.status::text, 'in_fulfillment', p_master_user_id, 'master', 'claim_confirmed'),
    ('assignment', v_current_assignment.id, null, 'active', p_master_user_id, 'master', 'assignment_created');

  insert into audit_logs(actor_user_id, action, entity_type, entity_id, meta, ip, user_agent)
  values (
    p_master_user_id,
    'dispatch.claim_confirmed',
    'dispatch',
    v_dispatch.id,
    jsonb_build_object('request_id', v_request.id, 'order_id', v_order.id, 'assignment_id', v_current_assignment.id),
    p_ip,
    p_user_agent
  );

  v_resp := jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'request_id', v_request.id,
      'order_id', v_order.id,
      'assignment_id', v_current_assignment.id,
      'dispatch_id', v_dispatch.id
    )
  );
  v_code := 200;

  update idempotency_keys
  set response_code = v_code,
      response_body = v_resp
  where id = v_idem.id;

  return v_resp;
end;
$$;
