create table if not exists admin_dispatch_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references service_requests(id) on delete cascade,
  requester_id uuid not null references users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by_login text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admin_dispatch_reviews
  add column if not exists requester_id uuid references users(id) on delete restrict,
  add column if not exists status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  add column if not exists reviewed_by_login text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists uq_admin_dispatch_reviews_pending
  on admin_dispatch_reviews(request_id)
  where status = 'pending';

create index if not exists idx_admin_dispatch_reviews_status_created
  on admin_dispatch_reviews(status, created_at desc);

create index if not exists idx_admin_dispatch_reviews_reviewed
  on admin_dispatch_reviews(reviewed_at desc)
  where status <> 'pending';

alter table orders
  add column if not exists final_price_amount int check (final_price_amount is null or final_price_amount >= 0),
  add column if not exists commission_percent numeric(5,2) not null default 5.00 check (commission_percent >= 0 and commission_percent <= 100),
  add column if not exists commission_amount int check (commission_amount is null or commission_amount >= 0),
  add column if not exists commission_status text not null default 'not_set' check (commission_status in ('not_set', 'unpaid', 'paid', 'waived')),
  add column if not exists commission_paid_at timestamptz,
  add column if not exists admin_note text,
  add column if not exists completed_by_admin_at timestamptz;

create or replace function sync_order_commission()
returns trigger
language plpgsql
as $$
begin
  if new.final_price_amount is null then
    new.commission_amount = null;
    if new.commission_status in ('unpaid', 'paid') then
      new.commission_status = 'not_set';
    end if;
  else
    new.commission_amount = ceil((new.final_price_amount::numeric * new.commission_percent) / 100)::int;
    if new.commission_status = 'not_set' then
      new.commission_status = 'unpaid';
    end if;
  end if;

  if new.commission_status = 'paid' and new.commission_paid_at is null then
    new.commission_paid_at = now();
  end if;

  if new.commission_status <> 'paid' then
    new.commission_paid_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_orders_sync_commission on orders;
create trigger trg_orders_sync_commission
before insert or update of final_price_amount, commission_percent, commission_status on orders
for each row execute function sync_order_commission();

drop trigger if exists trg_admin_dispatch_reviews_updated_at on admin_dispatch_reviews;
create trigger trg_admin_dispatch_reviews_updated_at before update on admin_dispatch_reviews
for each row execute function set_updated_at();

create index if not exists idx_orders_commission_status
  on orders(commission_status, created_at desc);

create index if not exists idx_orders_completed_at
  on orders(completed_at desc)
  where completed_at is not null;
