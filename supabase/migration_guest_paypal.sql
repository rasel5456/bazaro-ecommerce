-- ============================================================
-- Migration: Guest checkout + PayPal payment support
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- (Safe to run even if you already ran schema.sql earlier)
-- ============================================================

-- Allow orders without a logged-in user (guest checkout)
alter table orders alter column user_id drop not null;

-- New fields for payment + guest contact
alter table orders add column if not exists email text;
alter table orders add column if not exists payment_method text default 'cod';
alter table orders add column if not exists payment_status text default 'pending';
alter table orders add column if not exists paypal_order_id text;

-- Replace the old "insert" policy with two: one for logged-in users, one for guests
drop policy if exists "Users can create their own orders" on orders;

create policy "Authenticated users can create their own orders"
  on orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Guests can create orders"
  on orders for insert
  to anon
  with check (user_id is null);
