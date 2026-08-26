-- Add a per-product PayPal receiving email.
-- If left blank, payment for that product falls back to the site's
-- default PayPal account (the one connected via the app's Client ID).
alter table products add column if not exists paypal_email text;
