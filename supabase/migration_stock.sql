-- Add stock tracking
alter table products add column if not exists stock integer default 100;

-- Set a starting stock for any existing products that don't have one
update products set stock = 100 where stock is null;

-- Atomic function: reduce stock and increase "sold" count together,
-- called once per line item right after an order is successfully placed.
-- security definer lets this run even for guest checkouts (which use the anon role).
create or replace function public.record_sale(p_product_id uuid, p_qty int)
returns void as $$
begin
  update products
  set stock = greatest(stock - p_qty, 0),
      sold = sold + p_qty
  where id = p_product_id;
end;
$$ language plpgsql security definer;

grant execute on function public.record_sale(uuid, int) to anon, authenticated;
