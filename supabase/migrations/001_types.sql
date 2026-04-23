create extension if not exists pgcrypto;

create type app_locale as enum ('uz_cyrl', 'ru');
create type master_approval_status as enum ('pending', 'approved', 'revoked');

create type request_status as enum (
  'draft',
  'intake_in_progress',
  'ready_for_dispatch',
  'dispatched',
  'in_fulfillment',
  'closed_completed',
  'closed_canceled_user',
  'closed_canceled_admin',
  'closed_unfulfilled'
);

create type order_status as enum (
  'accepted',
  'in_progress',
  'reassignment_pending',
  'completed',
  'canceled_admin'
);

create type dispatch_status as enum (
  'pending_send',
  'open',
  'claimed',
  'expired',
  'failed_send',
  'canceled'
);

create type assignment_status as enum (
  'active',
  'canceled_by_master',
  'released_by_admin',
  'completed'
);

create type urgency_level as enum ('low', 'normal', 'high', 'emergency');
create type visit_time_mode as enum ('asap', 'scheduled');
create type intake_sender as enum ('user', 'ai', 'system');
create type audit_actor_role as enum ('requester', 'master', 'admin', 'system', 'bot');
create type webhook_source as enum ('telegram');
create type webhook_processing_status as enum ('received', 'processed', 'ignored', 'error');
