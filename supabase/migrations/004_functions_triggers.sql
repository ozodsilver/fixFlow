create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at before update on users
for each row execute function set_updated_at();

create trigger trg_master_profiles_updated_at before update on master_profiles
for each row execute function set_updated_at();

create trigger trg_admin_profiles_updated_at before update on admin_profiles
for each row execute function set_updated_at();

create trigger trg_service_domains_updated_at before update on service_domains
for each row execute function set_updated_at();

create trigger trg_issue_tags_updated_at before update on issue_tags
for each row execute function set_updated_at();

create trigger trg_service_requests_updated_at before update on service_requests
for each row execute function set_updated_at();

create trigger trg_dispatch_records_updated_at before update on dispatch_records
for each row execute function set_updated_at();

create trigger trg_orders_updated_at before update on orders
for each row execute function set_updated_at();

create trigger trg_order_assignments_updated_at before update on order_assignments
for each row execute function set_updated_at();

-- Minimal guard: request cannot leave terminal states.
create or replace function guard_request_terminal_transition()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('closed_completed', 'closed_canceled_user', 'closed_canceled_admin', 'closed_unfulfilled')
     and new.status <> old.status then
    raise exception 'invalid request transition from terminal state %', old.status;
  end if;
  return new;
end;
$$;

create trigger trg_guard_request_terminal_transition
before update of status on service_requests
for each row execute function guard_request_terminal_transition();

-- Minimal guard: order cannot leave terminal states.
create or replace function guard_order_terminal_transition()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('completed', 'canceled_admin') and new.status <> old.status then
    raise exception 'invalid order transition from terminal state %', old.status;
  end if;
  return new;
end;
$$;

create trigger trg_guard_order_terminal_transition
before update of status on orders
for each row execute function guard_order_terminal_transition();
