-- Phase 1: purchases, scoped to households, with full-text search.

create type purchase_category as enum ('electronics', 'appliance', 'furniture', 'other');
create type purchase_source as enum ('manual', 'photo', 'email');

create table purchases (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  created_by uuid not null references auth.users (id),
  item_name text not null,
  merchant text,
  purchase_date date not null,
  price_cents integer,
  currency text not null default 'USD',
  category purchase_category not null default 'other',
  model_number text,
  serial_number text,
  notes text,
  return_deadline date,
  warranty_expires date,
  source purchase_source not null default 'manual',
  extraction_confidence numeric(3, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(item_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(merchant, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'C')
  ) stored
);

create index purchases_household_id_idx on purchases (household_id);
create index purchases_return_deadline_idx on purchases (return_deadline);
create index purchases_warranty_expires_idx on purchases (warranty_expires);
create index purchases_search_vector_idx on purchases using gin (search_vector);

alter table purchases enable row level security;

create policy "purchases: members can select"
  on purchases for select
  using (
    exists (
      select 1 from household_members hm
      where hm.household_id = purchases.household_id
        and hm.user_id = auth.uid()
    )
  );

create policy "purchases: members can insert"
  on purchases for insert
  with check (
    exists (
      select 1 from household_members hm
      where hm.household_id = purchases.household_id
        and hm.user_id = auth.uid()
    )
  );

create policy "purchases: members can update"
  on purchases for update
  using (
    exists (
      select 1 from household_members hm
      where hm.household_id = purchases.household_id
        and hm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from household_members hm
      where hm.household_id = purchases.household_id
        and hm.user_id = auth.uid()
    )
  );

create policy "purchases: members can delete"
  on purchases for delete
  using (
    exists (
      select 1 from household_members hm
      where hm.household_id = purchases.household_id
        and hm.user_id = auth.uid()
    )
  );

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger purchases_set_updated_at
  before update on purchases
  for each row execute function set_updated_at();
