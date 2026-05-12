# Moore Trading Co.

E-commerce storefront for [mooretradingco.com](https://mooretradingco.com): small-batch seasonings, sauces, finishing salts, and prepared foods.

## Stack

- **Next.js 15** (App Router, TypeScript, Server Actions, Turbopack)
- **Tailwind CSS v4** + shadcn/ui-style Radix primitives
- **Neon Postgres** + **Drizzle ORM** (edge-compatible HTTP driver)
- **Auth.js v5** (NextAuth) with Drizzle adapter; credentials + email verification
- **Square** Web Payments SDK + Node SDK for checkout; Square Orders API for tax & order totals
- **Resend** (transactional email) + **React Email** templates
- **USPS** Domestic Prices API for shipping rates (flat-rate fallback)
- **Vercel Blob** for product image storage
- **Cloudflare Web Analytics** beacon

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in DATABASE_URL (Neon), AUTH_SECRET, Square keys, etc.

# 3. Generate and apply DB schema
npm run db:generate
npm run db:push       # or: npm run db:migrate

# 4. Seed initial catalog (optional)
npm run db:seed

# 5. Start the dev server
npm run dev
```

Visit `http://localhost:3000`.

### First admin user

Set `ADMIN_EMAIL` in `.env.local` to your email **before** registering. The first account created with that email automatically gets the `admin` role.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only, no emit |
| `npm run db:generate` | Generate Drizzle migrations from schema |
| `npm run db:push` | Push the current schema directly (dev) |
| `npm run db:migrate` | Apply generated migrations |
| `npm run db:studio` | Drizzle Studio (DB GUI) |
| `npm run db:seed` | Seed categories, products, settings |

## Deployment

1. Push this repo to GitHub.
2. Import the repo in Vercel; attach the existing Neon database via the Vercel Storage integration (sets `DATABASE_URL`).
3. Add the remaining env vars from `.env.example` to Vercel (Settings → Environment Variables). Provide both sandbox and production values for Square as needed.
4. In Cloudflare DNS:
   - `mooretradingco.com` (apex) → ALIAS/CNAME to `cname.vercel-dns.com`
   - `www.mooretradingco.com` → CNAME to `cname.vercel-dns.com`
   Disable the Cloudflare proxy ("DNS only") on these records and configure the domain in Vercel.
5. Generate a Cloudflare Web Analytics token in the Cloudflare dashboard and add `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`.

## Project layout

```
src/
  app/
    (auth)/          login, register, forgot/reset password, verify email
    (public)/        marketing + storefront, account section
      account/       profile, orders, addresses (auth-gated by middleware)
      shop/          shop listing + product detail page
      cart/          cart page
      checkout/      checkout flow + success page
    @modal/          intercepting route: product modal on /shop
    admin/           owner-only product/order/settings CRUD
    api/auth/        Auth.js handlers
  components/        UI primitives + site header/footer
  db/                Drizzle schema, migrate, seed
  lib/               square, shipping, tax, email helpers
  server/            data access (cart, products) + server actions
  middleware.ts      route protection for /account and /admin
  auth.ts            Auth.js configuration
```

## Sales tax

Tax is handled by Square's Orders API at checkout. You configure a per-state percentage in `/admin/settings → Sales tax rates by state`; on checkout we call `orders.calculate` and `orders.create` so Square does the math and the tax shows up in your Square reports.

- Add a row for every state where you have sales-tax nexus (typically just your home state to start).
- Leave a state out entirely to charge zero tax there.
- Square computes tax against line-item subtotals only; shipping is added as a `TOTAL_PHASE` service charge and isn't taxed.

## Square sandbox → production

1. Use `SQUARE_ENVIRONMENT=sandbox` and Square sandbox credentials during development. Test with [sandbox test cards](https://developer.squareup.com/docs/devtools/sandbox/payments).
2. Before going live, swap to a production access token, location ID, and application ID. Update `NEXT_PUBLIC_SQUARE_ENVIRONMENT=production` so the Web Payments SDK loads against production.
3. Place a real $1 test order to confirm end-to-end flow.
