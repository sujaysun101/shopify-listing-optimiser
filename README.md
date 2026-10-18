# Copycart

Copycart is a workspace for small Shopify stores. It scores each product page, drafts a rewrite you can accept field by field, and exports the catalog back to Shopify.

The signed-in app is the product. The marketing page is a short introduction.

## Features

- Clerk sign-in and sign-up, with keyless mode in development when API keys are absent
- A store workspace with a seeded catalog for Hearth & Wick, a small candle and home-goods shop
- CSV import in Shopify’s product export format, and an optional Shopify Admin API connection
- Admin API tokens are encrypted at rest and are only stored when `ENCRYPTION_KEY` is set
- Per-product score with five explained checks: title length, keywords, benefits, alt text, and meta description
- AI rewrite with a side-by-side diff, tone presets, and accept or reject per field
- Bulk optimize queue with progress
- A/B title variants, including marking a winner onto the product
- CSV export, plus push back through the Admin API when a store is connected
- Dashboard charts for score distribution and catalog average over time

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, shadcn-style UI, Lucide, Framer Motion, Clerk, Drizzle ORM, Postgres, Recharts, and the Anthropic SDK.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `DATABASE_URL`, the app uses an in-memory store and labels it **Demo data**. The Hearth & Wick catalog is loaded for the demo session. With Postgres:

```bash
npm run db:migrate
npm run db:seed
```

`db:seed` inserts the demo catalog for the user id `user_demo`.

## Environment variables

| Name | Role |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon or Supabase). Omit it to use demo data in memory. |
| `ANTHROPIC_API_KEY` | Server-side Claude calls. Omit it and rewrites are labeled samples. |
| `AI_MODEL` | Claude model. Defaults to `claude-sonnet-4-6`. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key. |
| `CLERK_SECRET_KEY` | Clerk secret key. |
| `ENCRYPTION_KEY` | At least 16 characters. Required before a Shopify access token can be saved. |
| `UPSTASH_REDIS_REST_URL` | Optional shared rate limit. Falls back to an in-memory token bucket. |
| `UPSTASH_REDIS_REST_TOKEN` | Paired with the Upstash URL. |
| `NEXT_PUBLIC_APP_URL` | Public origin for metadata. |
| `DEMO_SCREENSHOT` | Set to `1` only while capturing portfolio screenshots. Bypasses auth. |

In development, leaving the Clerk keys empty starts Clerk keyless mode. Production without keys opens the demo catalog instead of a sign-in wall.

## What is live vs sample

- Scores, CSV import, CSV export, the queue, title variants, and charts are computed in the app from stored products.
- Rewrites call Claude only when `ANTHROPIC_API_KEY` is set. Otherwise the same screen returns a labeled sample rewrite.
- Shopify import and push call the Admin API only after a domain and access token are saved. That save is refused until `ENCRYPTION_KEY` is set.
- The weekly history on a fresh demo catalog is seeded store data. Today’s point is recalculated from the current products.
- Rate limits are 20 AI calls per user per hour.

## Screenshots

With the production server running as `DEMO_SCREENSHOT=1 npm start`:

```bash
npx playwright install chromium
node scripts/screenshot.mjs
```
