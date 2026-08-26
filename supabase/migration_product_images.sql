-- ============================================================
-- Migration: Product image uploads
-- First create a bucket named "product-images" (Public) via
-- Supabase Dashboard -> Storage -> New bucket, THEN run this.
-- ============================================================

alter table products add column if not exists image_url text;

-- Anyone can view product images
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Only admins can upload/replace/delete product images
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);

create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
);
