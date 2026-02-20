# Crypto Analytics Dashboard

Production-ready crypto trading terminal UI built with Next.js App Router, TypeScript, Tailwind CSS, Supabase, CoinGecko, and Recharts.

## Stack

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS (dark mode via config)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- CoinGecko API
- Recharts
- Deploy target: Vercel

## Folder Structure

```text
.
├─ middleware.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ .env.example
└─ src
	├─ app
	│  ├─ (app)
	│  │  ├─ layout.tsx
	│  │  └─ dashboard/page.tsx
	│  ├─ (auth)
	│  │  ├─ layout.tsx
	│  │  ├─ login/page.tsx
	│  │  └─ signup/page.tsx
	│  ├─ api/market
	│  │  ├─ prices/route.ts
	│  │  ├─ markets/route.ts
	│  │  └─ history/route.ts
	│  ├─ api/portfolio
	│  │  ├─ holdings/route.ts
	│  │  ├─ holdings/[holdingId]/route.ts
	│  │  └─ summary/route.ts
	│  ├─ globals.css
	│  ├─ layout.tsx
	│  └─ page.tsx
	├─ components
	│  ├─ auth
	│  │  ├─ auth-form.tsx
	│  │  └─ logout-button.tsx
	│  ├─ dashboard
	│  │  ├─ market-chart.tsx
	│  │  └─ market-table.tsx
	│  ├─ layout
	│  │  ├─ app-shell.tsx
	│  │  ├─ navbar.tsx
	│  │  └─ sidebar.tsx
	│  └─ ui/glass-card.tsx
	├─ lib
	│  ├─ portfolio
	│  │  ├─ engine.ts
	│  │  ├─ errors.ts
	│  │  ├─ http.ts
	│  │  ├─ portfolio-api.client.ts
	│  │  ├─ repository.ts
	│  │  └─ validation.ts
	│  ├─ market
	│  │  ├─ coingecko-client.ts
	│  │  ├─ errors.ts
	│  │  ├─ http.ts
	│  │  ├─ market-api.client.ts
	│  │  └─ market-data.service.ts
	│  ├─ auth
	│  │  ├─ actions.ts
	│  │  └─ service.ts
	│  ├─ supabase
	│  │  ├─ client.ts
	│  │  ├─ middleware.ts
	│  │  └─ server.ts
	│  ├─ coingecko.ts
	│  ├─ env.ts
	│  ├─ format.ts
	│  └─ utils.ts
	├─ styles/tokens.ts
	└─ types
		├─ auth.ts
		├─ market-data.ts
		├─ portfolio.ts
		└─ market.ts
├─ supabase
│  └─ migrations
│     └─ 20260220_portfolio_holdings.sql
```

## Why Each Core File Exists

- `src/app/layout.tsx`: Global metadata/fonts and baseline dark theme setup.
- `src/app/(app)/layout.tsx`: Wraps authenticated app routes with trading-terminal shell.
- `src/app/(auth)/layout.tsx`: Isolated auth surface without sidebar/navbar clutter.
- `src/app/page.tsx`: Session-aware entry redirect (`/dashboard` or `/login`).
- `src/lib/auth/service.ts`: Supabase auth service layer (signup/login/logout/get user).
- `src/lib/auth/actions.ts`: Server Actions for email/password auth with validation + errors.
- `src/components/auth/auth-form.tsx`: Reusable dark form with loading/error/success states.
- `src/lib/supabase/*`: Browser/server/middleware clients for secure session handling.
- `middleware.ts`: Route protection and auth-route redirects.
- `src/app/(app)/dashboard/page.tsx`: Protected dashboard view consuming live data.
- `src/lib/market/coingecko-client.ts`: Centralized CoinGecko API client with retry and rate-limit backoff.
- `src/lib/market/market-data.service.ts`: Scalable market data service with endpoint-level caching.
- `src/lib/market/errors.ts`: Typed service-level errors used by API routes.
- `src/app/api/market/*`: Next.js API endpoints for prices, market caps, and historical series.
- `supabase/migrations/20260220_portfolio_holdings.sql`: Portfolio schema, indexes, triggers, and RLS policies.
- `src/lib/portfolio/repository.ts`: Typed Supabase query layer for holdings CRUD.
- `src/lib/portfolio/engine.ts`: Profit/Loss and portfolio summary calculation logic.
- `src/lib/portfolio/validation.ts`: Strict payload validation for create/update operations.
- `src/app/api/portfolio/*`: Authenticated holdings CRUD and portfolio summary endpoints.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:

- `COINGECKO_API_KEY` (recommended for higher API quota)

## Supabase Setup

1. Create a Supabase project.
2. In Supabase dashboard, enable Email provider under Authentication.
3. Copy Project URL and anon key into `.env.local`.
4. (Optional) Configure email confirmation policy in Supabase Auth settings.

## Auth Flow

- **Signup (`/signup`)**: Uses `signupWithEmailAction` with email/password validation.
- **Login (`/login`)**: Uses `loginWithEmailAction` and redirects to `/dashboard`.
- **Session handling**: SSR/middleware clients keep auth cookies synced.
- **Logout**: `logoutAction` in `logout-button.tsx` clears session and routes to `/login`.

## Secure Routes

- Middleware guards `/dashboard` and redirects unauthenticated users to `/login`.
- Middleware redirects authenticated users away from `/login` and `/signup` to `/dashboard`.
- Dashboard page also performs server-side user check as defense-in-depth.

## Run Locally

```bash
npm install
npm run dev
```

## Extend the Dashboard

- Add new terminal cards as reusable components under `src/components/dashboard`.
- Keep all API integrations in `src/lib/*` and map responses into typed models in `src/types/*`.
- Add new protected routes under `src/app/(app)` to inherit auth shell.
- Add public/auth routes under `src/app/(auth)` for unauthenticated flows.
- Add DB-backed features by extending `src/lib/auth/service.ts` or adding service modules in `src/lib`.
- Add reusable form variants by composing `src/components/auth/auth-form.tsx`.
- Keep design consistency by reusing `GlassCard`, Tailwind tokens, and `src/styles/tokens.ts`.

## CoinGecko Service + API Routes

### Route Contracts

- `GET /api/market/prices?ids=bitcoin,ethereum&vsCurrency=usd`
	- Returns live prices, market caps, and 24h change.
- `GET /api/market/markets?vsCurrency=usd&page=1&perPage=20`
	- Returns paginated market-cap ranked assets.
- `GET /api/market/history?ids=bitcoin,ethereum&days=7&vsCurrency=usd`
	- Returns 7d or 30d historical price + market cap time series.

### Error Handling Strategy

- Validation failures return `400` with a typed error payload.
- Upstream rate limits trigger retry with exponential backoff + jitter.
- Exhausted retries return `429` with `RATE_LIMITED` code.
- Other upstream failures preserve status and return structured error data.

### Caching + Scalability

- Centralized service cache with endpoint-specific TTLs (hot request dedupe).
- Next.js fetch revalidation for platform-level request caching.
- API responses include `Cache-Control` with stale-while-revalidate.
- Provider-specific concerns are isolated in `coingecko-client.ts` for future multi-provider expansion.

### Usage Example (Client)

- `fetchLivePrices(["bitcoin", "ethereum"])`
- `fetchTopMarkets()`
- `fetchHistory(["bitcoin"], 30)`

All helpers are in `src/lib/market/market-api.client.ts`.

## Portfolio Management System

### SQL Schema + Security Rules

- Migration: `supabase/migrations/20260220_portfolio_holdings.sql`
- Table: `public.portfolio_holdings`
	- Tracks user ownership, coin identity, quantity, buy price, buy date, notes.
- Trigger: auto-updates `updated_at` on row updates.
- RLS policies:
	- Select own rows only.
	- Insert requires `user_id = auth.uid()`.
	- Update/Delete restricted to owner rows.

### Query/Repository Layer

- `src/lib/portfolio/repository.ts`
	- `listHoldings()`
	- `createHolding()`
	- `updateHolding()`
	- `deleteHolding()`
- All methods require authenticated Supabase user context server-side.

### Portfolio API Routes

- `GET /api/portfolio/holdings`
- `POST /api/portfolio/holdings`
- `PATCH /api/portfolio/holdings/[holdingId]`
- `DELETE /api/portfolio/holdings/[holdingId]`
- `GET /api/portfolio/summary`

### Profit/Loss Engine

- `src/lib/portfolio/engine.ts`
- For each holding:
	- `costBasis = quantity * buyPrice`
	- `currentValue = quantity * livePrice`
	- `profitLoss = currentValue - costBasis`
	- `profitLossPct = profitLoss / costBasis * 100`
- Summary totals include portfolio-wide cost basis, current value, P/L amount, P/L percent, position counts.

### Validation + Error Handling

- `src/lib/portfolio/validation.ts`
	- Validates coin id/symbol format, positive numeric values, date parsing, notes length.
- `src/lib/portfolio/errors.ts` + `src/lib/portfolio/http.ts`
	- Typed error classes and normalized API error responses.

### Usage Example (Client)

- `fetchHoldings()`
- `createHolding({...})`
- `updateHolding(holdingId, {...})`
- `deleteHolding(holdingId)`
- `fetchPortfolioSummary()`

All helpers are in `src/lib/portfolio/portfolio-api.client.ts`.

## Deploy to Vercel

- Push repository to GitHub.
- Import project in Vercel.
- Add all required environment variables in Vercel Project Settings.
- Build command: `npm run build`
- Output: Next.js default
