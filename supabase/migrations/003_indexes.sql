create index idx_users_telegram_user_id on users(telegram_user_id);
create index idx_master_profiles_approved_active on master_profiles(approval_status, is_active);
create index idx_admin_profiles_active on admin_profiles(is_active);

create index idx_service_requests_requester_created on service_requests(requester_id, created_at desc);
create index idx_service_requests_status_created on service_requests(status, created_at desc);
create index idx_service_requests_domain_status on service_requests(domain_id, status);

create index idx_request_intake_messages_request_id_id on request_intake_messages(request_id, id);

create unique index uq_dispatch_open_per_request
  on dispatch_records(request_id)
  where status in ('pending_send', 'open');

create index idx_dispatch_status_expires on dispatch_records(status, expires_at);
create index idx_dispatch_request_attempt on dispatch_records(request_id, attempt_no desc);

create index idx_orders_status_created on orders(status, created_at desc);
create index idx_orders_request_id on orders(request_id);

create unique index uq_order_assignments_current
  on order_assignments(order_id)
  where is_current = true;

create index idx_order_assignments_master_current
  on order_assignments(master_id, is_current);

create index idx_status_history_entity on status_history(entity_type, entity_id, created_at desc);
create index idx_audit_logs_created on audit_logs(created_at desc);
create index idx_webhook_events_processing on webhook_events(processing_status, created_at);
create index idx_idempotency_scope_key on idempotency_keys(scope, key);
