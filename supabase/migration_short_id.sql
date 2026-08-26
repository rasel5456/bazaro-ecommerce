alter table products add column if not exists short_id text unique;

-- Backfill a short 7-character code for any existing products that don't have one
update products
set short_id = substr(md5(random()::text || id::text), 1, 7)
where short_id is null;
