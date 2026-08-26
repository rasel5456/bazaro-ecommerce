-- ============================================================
-- amazon e-commerce schema for Supabase
-- Run this whole file in: Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------- PRODUCTS (shared catalog, readable by everyone) ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  rating numeric(2,1) default 4.0,
  sold int default 0,
  badge text,
  grad_from text default '#131921',
  grad_to text default '#3A6EA5',
  icon text default 'Package',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table products enable row level security;

-- Anyone (including logged-out visitors) can view products
create policy "Products are viewable by everyone"
  on products for select
  using (true);

-- Only logged-in users can add products ("Sell on amazon")
create policy "Authenticated users can insert products"
  on products for insert
  to authenticated
  with check (auth.uid() = created_by);

-- ---------- CART ITEMS (private to each user) ----------
create table if not exists cart_items (
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  qty int not null default 1,
  updated_at timestamptz default now(),
  primary key (user_id, product_id)
);

alter table cart_items enable row level security;

create policy "Users manage their own cart"
  on cart_items for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- ORDERS (private to each user) ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  items jsonb not null,       -- [{name, qty, price}, ...]
  total numeric(10,2) not null,
  full_name text not null,
  phone text not null,
  address text not null,
  created_at timestamptz default now()
);

alter table orders enable row level security;

create policy "Users see only their own orders"
  on orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on orders for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------- SEED PRODUCTS ----------
insert into products (name, category, price, old_price, rating, sold, badge, grad_from, grad_to, icon) values
('Wireless Earbuds Pro', 'Electronics', 19.99, 29.99, 4.4, 812, 'HOT', '#131921', '#3A6EA5', 'Headphones'),
('Smart Watch Series X', 'Electronics', 49.99, 69.99, 4.6, 421, 'NEW', '#0F5C5C', '#1C8C8C', 'Watch'),
('Bluetooth Speaker Mini', 'Electronics', 22.99, 29.99, 4.2, 366, null, '#8A6D3B', '#B33A2E', 'Speaker'),
('Men''s Casual Button-Down Shirt', 'Fashion', 14.99, 19.99, 4.2, 233, null, '#B33A2E', '#E0714E', 'Shirt'),
('Women''s Floral Maxi Dress', 'Fashion', 39.99, 54.99, 4.8, 156, 'BESTSELLER', '#7A3E9D', '#B36ACF', 'Sparkle'),
('Everyday Backpack', 'Fashion', 27.99, 36.99, 4.4, 401, null, '#3A6EA5', '#131921', 'Backpack'),
('Non-Stick Cookware Set (10-pc)', 'Home & Living', 34.99, 44.99, 4.3, 302, null, '#8A6D3B', '#C9A15A', 'Package'),
('Modern LED Table Lamp', 'Home & Living', 19.99, 27.99, 4.1, 98, null, '#131921', '#5B7FBF', 'Lamp'),
('Organic Vitamin C Face Serum', 'Beauty', 16.99, 22.99, 4.5, 540, 'HOT', '#C2452D', '#FF9900', 'Sparkle'),
('Matte Lipstick Trio', 'Beauty', 12.99, 17.99, 4.0, 210, null, '#7A3E9D', '#C2452D', 'Package'),
('RC Stunt Car', 'Toys', 24.99, 34.99, 4.3, 175, null, '#0F5C5C', '#FF9900', 'Car'),
('Building Blocks Set (500-pc)', 'Toys', 29.99, 39.99, 4.7, 289, 'NEW', '#131921', '#B33A2E', 'Blocks')
on conflict do nothing;
