-- ============================================================
-- Migration: Admin panel (profiles, settings, admin-only product/order control)
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- Run this AFTER migration_guest_paypal.sql
-- ============================================================

-- ---------- PROFILES (one row per signed-up user, tracks is_admin) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill a profile row for any account created before this migration
insert into profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ---------- ADMIN SETTINGS (single row: PayPal client id, store name) ----------
create table if not exists admin_settings (
  id int primary key default 1,
  paypal_client_id text default 'sb',   -- 'sb' = PayPal's public sandbox test client id
  store_name text default 'bazaro',
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into admin_settings (id) values (1) on conflict (id) do nothing;

alter table admin_settings enable row level security;

drop policy if exists "Anyone can read settings" on admin_settings;
create policy "Anyone can read settings"
  on admin_settings for select
  using (true);

drop policy if exists "Admins can update settings" on admin_settings;
create policy "Admins can update settings"
  on admin_settings for update
  to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- ---------- PRODUCTS: only admins can add/edit/delete now ----------
drop policy if exists "Authenticated users can insert products" on products;

create policy "Admins can insert products"
  on products for insert
  to authenticated
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create policy "Admins can update products"
  on products for update
  to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create policy "Admins can delete products"
  on products for delete
  to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- ---------- ORDERS: admins can view + update all orders ----------
alter table orders add column if not exists status text default 'pending';

create policy "Admins can view all orders"
  on orders for select
  to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

create policy "Admins can update orders"
  on orders for update
  to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- ============================================================
-- LAST STEP (do this manually, after you sign up on the site):
--
--   update profiles set is_admin = true where email = 'YOUR-EMAIL@example.com';
--
-- Replace with the email you signed up with. This makes YOU the admin.
-- ============================================================
