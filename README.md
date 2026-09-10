# CreatorAnalytics

A unified funnel analytics dashboard for creator-coaches and digital product sellers. Connects Stripe, Kit (ConvertKit), ManyChat, and Calendly into a single funnel view.

## Tech stack

- **Next.js 14** (App Router, TypeScript strict mode)
- **Tailwind CSS** + custom design tokens
- **shadcn/ui** as component primitive layer
- **Recharts** for charts
- **Prisma** + **PostgreSQL** (Vercel Postgres or Neon)
- **NextAuth v4** with Credentials provider (email + password)

## Local setup

### 1. Clone and install

```bash
git clone <repo>
cd creatoranalytics
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `STRIPE_CLIENT_ID` | Stripe Dashboard → Connect settings |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI `stripe listen` output |
| `CALENDLY_CLIENT_ID` | developer.calendly.com → OAuth apps |
| `CALENDLY_CLIENT_SECRET` | Same OAuth app |
| `ENCRYPTION_KEY` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

Kit and ManyChat API keys are entered per-user through the Integrations UI — no global env variable needed.

### 3. Run database migrations

```bash
npm run db:migrate     # create tables
npm run db:seed        # seed default funnel definitions
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up for an account, then connect integrations from the Integrations page.

## Project structure

```
src/
  app/
    (auth)/             # Login + signup pages
    (dashboard)/        # Protected dashboard pages (sidebar layout)
    api/                # API routes
  components/
    ui/                 # shadcn primitives (Button, Card, Badge, etc.)
    layout/             # Sidebar, TopBar
    dashboard/          # HeroCard, FunnelChart, RevenueChart, ConnectedSources
    shared/             # StatCard, ChartCard, EmptyState, LoadingState
    providers/          # NextAuth SessionProvider wrapper
  integrations/         # Stripe, Kit, ManyChat, Calendly sync functions
  lib/                  # Prisma client, auth config, utils, mock data
  types/                # Shared TypeScript types
prisma/
  schema.prisma         # Data model
  seed.ts               # Seeds default funnel definitions
```

## Funnel types

The funnel visualization is data-driven via the `FunnelDefinition` table. Two defaults are seeded:

- **Freebie funnel**: Comment → DM → Freebie claimed → Email subscribed → Purchased
- **Call funnel**: Comment → DM → Video viewed → Call booked → Call completed → Purchased

Adding a third funnel type = `INSERT INTO funnel_definitions` — no code changes needed.

## Adding a new integration

1. Add the provider to `prisma/schema.prisma` enums (`Provider`, `EventSource`)
2. Run `npm run db:migrate`
3. Create `src/integrations/<provider>.ts` following the existing pattern
4. Add a `case` branch in `src/integrations/sync.ts`
5. Add the UI card in `src/app/(dashboard)/integrations/page.tsx`

## Deployment (Vercel)

1. Push to GitHub — main branch auto-deploys
2. Set all env variables in Vercel Project Settings → Environment Variables
3. Use Vercel Postgres or Neon for the database
4. Run `npm run db:migrate` against the production DB once (Vercel CLI or Neon console)
