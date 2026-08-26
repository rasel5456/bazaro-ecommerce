# amazon — Setup & Deployment Guide

A real, deployable e-commerce site (React + Vite + Supabase). No `window.storage` —
everything is backed by an actual PostgreSQL database via Supabase.

## 1. Create your Supabase project

1. Go to https://supabase.com → **New project** (free tier is enough).
2. Wait ~2 minutes for it to finish provisioning.
3. In the left sidebar, go to **SQL Editor → New query**.
4. Open `supabase/schema.sql` from this project, copy everything, paste it in, and click **Run**.
   This creates the `products`, `cart_items`, and `orders` tables, sets up security rules,
   and seeds 12 starter products.
5. Go to **Project Settings → API**. Copy:
   - **Project URL**
   - **anon public** key

## 2. Configure the project locally

```bash
cd amazon-supabase
cp .env.example .env
```

Open `.env` and paste in your values:
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Then install and run:
```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173). Try creating an account,
adding a product, adding to cart, and placing an order — check the Supabase
**Table Editor** to see the rows appear live.

## 3. (Optional) Turn off email confirmation for faster testing

In Supabase: **Authentication → Providers → Email** → toggle
**"Confirm email"** off while you're testing, so new sign-ups can sign in immediately.
Turn it back on before a real public launch.

## 4. Deploy — Vercel (recommended)

1. Push this project to a GitHub repo.
2. Go to https://vercel.com → **New Project** → import the repo.
3. Framework preset: **Vite**.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. You'll get a live URL like `amazon.vercel.app`.

## 4b. Deploy — Netlify (alternative)

1. Push to GitHub.
2. Netlify → **Add new site → Import an existing project**.
3. Build command: `npm run build` — Publish directory: `dist`.
4. Add the same two environment variables under **Site settings → Environment variables**.
5. Deploy.

## Project structure

```
amazon-supabase/
├── supabase/schema.sql   ← run this in Supabase SQL Editor
├── src/
│   ├── supabaseClient.js ← connects to your Supabase project
│   ├── App.jsx            ← all pages/logic (home, cart, checkout, auth, sell)
│   ├── styles.css
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

## How data flows

- **products** — public read for everyone; insert only for signed-in users (via "Sell on amazon").
- **cart_items** — private per user (Row Level Security enforces `auth.uid() = user_id`).
- **orders** — private per user; created on checkout.
- **Auth** — real email/password accounts via Supabase Auth (not a fake demo login).

## Note on branding

The name/logo ("amazon") and colors are original — not Amazon's actual logo or trademark —
even though the layout and UX flow are closely modeled on Amazon's site for this project.
