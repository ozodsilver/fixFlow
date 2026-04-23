-- V1: server-side authorization is primary.
-- Keep direct table access closed for anon/authenticated roles.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Defense-in-depth: enable RLS on sensitive tables (no direct client policies in V1).
alter table users enable row level security;
alter table master_profiles enable row level security;
alter table admin_profiles enable row level security;
alter table service_requests enable row level security;
alter table request_intake_messages enable row level security;
alter table request_attachments enable row level security;
alter table dispatch_records enable row level security;
alter table orders enable row level security;
alter table order_assignments enable row level security;
alter table status_history enable row level security;
alter table audit_logs enable row level security;
