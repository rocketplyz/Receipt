-- Phase 0: households + membership, with auto-creation of a personal
-- household for every new auth user.

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type household_role as enum ('owner', 'member');

create table household_members (
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role household_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index household_members_user_id_idx on household_members (user_id);

alter table households enable row level security;
alter table household_members enable row level security;

-- A user can see a household only if they belong to it.
create policy "households: members can select"
  on households for select
  using (
    exists (
      select 1
      from household_members hm
      where hm.household_id = households.id
        and hm.user_id = auth.uid()
    )
  );

-- Households are created only by the server-side trigger below (security
-- definer), never directly by a client, so no insert/update/delete policy
-- is granted to regular users here.

-- A user can see membership rows only for households they belong to.
create policy "household_members: members can select"
  on household_members for select
  using (
    exists (
      select 1
      from household_members hm
      where hm.household_id = household_members.household_id
        and hm.user_id = auth.uid()
    )
  );

-- Membership rows are written only by the trigger (Phase 0) and, later,
-- by the invite flow (Phase 5) via an Edge Function using the service
-- role. No direct insert/update/delete policy for regular users yet.

-- Auto-create a personal household + owner membership for every new
-- auth.users row. Runs as security definer so it can bypass the RLS
-- policies above (the inserting "user" has no session yet).
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  insert into households (name)
  values (coalesce(new.email, 'My') || '''s Household')
  returning id into new_household_id;

  insert into household_members (household_id, user_id, role)
  values (new_household_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
