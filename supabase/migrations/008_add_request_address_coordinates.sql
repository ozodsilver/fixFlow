alter table service_requests
  add column if not exists address_lat double precision,
  add column if not exists address_lng double precision;
