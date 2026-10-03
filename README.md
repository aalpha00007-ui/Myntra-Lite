# Myntra-Lite

A learning project: a fashion shopping app built to test **Fit Twin**, a wishlist feature that suggests your size from reviews by buyers with a build like yours. Built for a product-management case study on wishlist-to-purchase conversion.

**Not affiliated with Myntra.** Brands, prices and reviews are demo data. Product photos come from [Unsplash](https://unsplash.com) under the Unsplash License.

## What's inside
- Home, categories, product listings with filters, product pages, wishlist, bag → address → demo payment, orders, profile.
- **Fit Twin**: every product shows a suggested size for you, worked out on each request from reviews (reviewer height, build, usual size, size kept, fit). Set yours under Profile → Size Details.
- **Test results** (`/results`): wishlist → purchase conversion and how often testers bought in the Fit Twin size, computed live.
- Demo login: no SMS, the OTP is always `1234`. Demo payments: no money moves and no payment details are asked for.

## Principle: store facts, compute answers
No `suggested_size`, `average_rating`, `order_total` or conversion columns. Sizes, ratings, totals and results are computed from the stored facts every time.

## Stack
Next.js 15 (App Router) + TypeScript, Neon Postgres (`@neondatabase/serverless`, raw SQL), Vercel.

## Deploy
Every push to `main` runs `.github/workflows/deploy.yml`: build → database setup → API tests → end-to-end Fit Twin order test (test account `9000000000`) → deploy to Vercel → a "break it" check on the live site.

Repository secrets needed: `DATABASE_URL` (Neon connection string only) and `VERCEL_TOKEN`.

## Run locally
```bash
npm install
echo 'DATABASE_URL=postgresql://...' > .env.local
npm run db:setup   # safe to re-run; npm run db:reset wipes everything
npm run dev
```
