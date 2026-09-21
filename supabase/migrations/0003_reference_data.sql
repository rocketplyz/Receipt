-- Phase 1: reference tables used to default a purchase's deadlines.
-- Readable by any authenticated user; writable only via migrations/admin
-- for now (no user-facing "add a merchant policy" UI yet).

create table merchant_policies (
  merchant_key text primary key,
  default_return_days integer not null
);

create table category_defaults (
  category purchase_category primary key,
  default_warranty_months integer not null
);

alter table merchant_policies enable row level security;
alter table category_defaults enable row level security;

create policy "merchant_policies: authenticated can select"
  on merchant_policies for select
  to authenticated
  using (true);

create policy "category_defaults: authenticated can select"
  on category_defaults for select
  to authenticated
  using (true);

insert into category_defaults (category, default_warranty_months) values
  ('electronics', 12),
  ('appliance', 24),
  ('furniture', 12),
  ('other', 12);

-- merchant_key is a lowercase, trimmed match against purchases.merchant,
-- done client-side before querying (see src/features/purchases/deadlines.ts).
insert into merchant_policies (merchant_key, default_return_days) values
  ('amazon', 30),
  ('best buy', 15),
  ('target', 90),
  ('walmart', 90),
  ('costco', 90),
  ('apple', 14),
  ('home depot', 90),
  ('lowes', 90),
  ('ikea', 365);
