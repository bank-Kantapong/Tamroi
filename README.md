# TAMROI (ตามรอย) — Phase 1 MVP

**TAMROI (ตามรอย)** is a free-to-use curated trip discovery web application. Visitors browse ready-to-follow itineraries, inspect numbered stops on an interactive map, view stop details (arrival time, duration, cost, coordinates, notes), and open the complete itinerary or individual stops directly in Google Maps. Curators manage trips and stops through a protected Admin area.

> **Scope Notice:** This repository implements **Phase 1 (MVP) only** in accordance with `AGENTS.md`. Phase 2/3 features (public user registration, community trip submissions, social reviews/likes, cross-device favorites, AI recommendations, and paid APIs) are intentionally excluded.

---

## 1. Architecture & Free-First Stack

| Layer | Technology | Cost / Free-Tier Strategy |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) + TypeScript | Open-source; deployable on Vercel Hobby or Netlify Free Tier ($0) |
| **Styling & UI** | Tailwind CSS + Lucide Icons | Open-source, responsive mobile/desktop layout, semantic HTML |
| **Interactive Map** | Leaflet + OpenStreetMap tiles | Open-source (`leaflet`); configurable tile URL with mandatory OSM attribution |
| **Navigation Handoff** | Standard Google Maps URLs (`api=1`) | 100% free URL links; no paid Google Maps JS SDK or Directions API billing required |
| **Database** | Dual-adapter `TripRepository` (`Supabase` or `Local JSON`) | Works out-of-the-box locally ($0) and supports **Supabase PostgreSQL Free Tier** in cloud |
| **Admin Auth** | Signed `HttpOnly` HMAC-SHA256 session cookies | Server-verified credentials via environment variables; zero paid auth dependencies |
| **Validation & Tests** | Zod + Vitest | Server-side schema validation + automated unit & integration test suite |

---

## 2. Local Development Setup

### Prerequisites
- **Node.js** 20+ (tested on Node v24.21.0)
- **npm** 10+

### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Configure environment variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
By default (`TAMROI_DATA_BACKEND=auto`), if Supabase credentials are not set, TAMROI automatically uses a persistent local database at `./data/tamroi-db.json` initialized with clearly labeled sample trips.

### Step 3: Seed (or reset) sample data
```bash
npm run db:seed
```
This populates 4 sample itineraries:
1. `[Sample] Rattanakosin Riverside & Heritage Walk` (Published, Bangkok, 5 stops)
2. `[Sample] Chiang Mai Old City Moat & Temple Loop` (Published, Chiang Mai, 4 stops)
3. `[Sample] Phuket Old Town to South Cape Scenic Drive (11 Stops)` (Published, Phuket, 11 stops — demonstrates automatic multi-segment Google Maps route splitting)
4. `[Sample Draft] Ayutthaya Historical Park Cycling Trail` (Draft — hidden from public pages, visible in Admin)

### Step 4: Start the development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 3. Environment Variables Reference

All variables are documented in `.env.example`:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `TAMROI_DATA_BACKEND` | Optional (`auto`) | `"auto"` (uses Supabase if configured, else local file DB), `"local"`, or `"supabase"`. |
| `TAMROI_LOCAL_DB_PATH` | Optional | Custom path for local JSON database (default: `./data/tamroi-db.json`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Required for `supabase` mode | Your Supabase project URL (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required for `supabase` mode | Supabase public anonymous key (enforces RLS read-only policy for published trips). |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for `supabase` mode | **Server-only** secret key used by protected admin mutations. Never exposed to the client. |
| `ADMIN_EMAIL` | Required in production | Administrator login email (default in local dev: `admin@tamroi.local`). |
| `ADMIN_PASSWORD` | Required in production | Administrator login password (default in local dev: `tamroi-dev-admin-2026`). |
| `ADMIN_SESSION_SECRET` | Required in production | Random 32+ character secret used to sign `HttpOnly` admin session cookies. |
| `NEXT_PUBLIC_MAP_TILE_URL` | Optional | OpenStreetMap-compatible raster tile template (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`). |
| `NEXT_PUBLIC_MAP_ATTRIBUTION` | Optional | HTML attribution string required by your tile provider. |

---

## 4. Database Setup (Supabase PostgreSQL Free Tier)

To use a hosted PostgreSQL database instead of the local file store:

1. Create a free project at [supabase.com](https://supabase.com) (no credit card required for the Free plan).
2. Open the **SQL Editor** in your Supabase dashboard and run the migration file:
   - `supabase/migrations/001_init_tamroi_phase1.sql`
3. This migration creates:
   - `public.trips` and `public.trip_stops` tables with coordinate range constraints (`latitude` `[-90, 90]`, `longitude` `[-180, 180]`), sequence uniqueness, and foreign key cascade delete.
   - Row Level Security (RLS) policies allowing `anon` public reads **only** where `status = 'published'`.
4. Copy your project's `Project URL`, `anon public` key, and `service_role` secret key into `.env.local` (or your hosting provider's environment variables).
5. Run `npm run db:seed` to seed the initial sample itineraries into Supabase.

---

## 5. Admin Provisioning & Security

- **No Public Registration:** Phase 1 has no public sign-up. Only the administrator configured via `ADMIN_EMAIL` and `ADMIN_PASSWORD` can sign in at `/admin/login`.
- **Production Safety:** In `NODE_ENV=production`, the app refuses to use fallback development credentials—you **must** set strong values for `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`.
- **Server-Side Enforcement:** Every admin page (`/admin`, `/admin/trips/new`, `/admin/trips/[tripId]/edit`) and every admin API route (`/api/admin/...`) verifies the HMAC-SHA256 signed `HttpOnly` cookie on the server before reading draft data or mutating records.
- **Draft Isolation:** Trips with `status = 'draft'` never appear on `/` or `/trips/[slug]` for public visitors. Authenticated admins can preview drafts using `/trips/[slug]?preview=1`.

---

## 6. Deployment Guide (Free Tier)

### Deploying to Vercel (Hobby Free) or Netlify (Starter Free)
1. Push this repository to GitHub/GitLab.
2. Import the repository into **Vercel** or **Netlify**.
3. Configure the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`).
   - *Note:* Serverless deployments have ephemeral filesystems, so you must configure Supabase (`TAMROI_DATA_BACKEND=supabase`) in production for persistent admin edits across serverless invocations.
4. Deploy with the standard build command `npm run build`.

---

## 7. Free-Tier Quotas, Usage Policies & Upgrade Triggers

Never assume any free tier is unlimited. Review these limits before scaling traffic:

1. **OpenStreetMap Standard Tile Server (`tile.openstreetmap.org`):**
   - **Policy:** Free for low-volume evaluation/MVP usage under the [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/), requiring visible attribution (`© OpenStreetMap contributors`) and no bulk/offline downloading.
   - **Upgrade Trigger:** Before launching to heavy public traffic, switch `NEXT_PUBLIC_MAP_TILE_URL` to a dedicated OSM tile provider with an explicit free tier (e.g., Stadia Maps Free Tier: 200,000 tiles/month, or MapTiler Free Tier: 100,000 requests/month).
2. **Supabase Free Tier:**
   - **Quotas:** 500 MB database storage, 5 GB egress bandwidth/month, max 2 free active projects.
   - **Inactivity Pause Behavior:** Free Supabase projects automatically **pause after 7 days of inactivity**. Wake the project from the Supabase dashboard or keep steady usage during active testing.
3. **Vercel Hobby / Netlify Free Tier:**
   - **Quotas:** 100 GB bandwidth/month, serverless function invocation limits, non-commercial personal use on Vercel Hobby.
4. **Google Maps URLs:**
   - Standard `https://www.google.com/maps/dir/?api=1&...` links are free and require no API key or billing account.
   - Waypoints are capped at 8 intermediate stops (10 stops total per URL) across mobile/desktop devices; TAMROI automatically splits routes with >10 stops into continuous sequential segments.

---

## 8. Commands & Quality Checks

```bash
npm run db:seed     # Seed or reset sample trips and stops
npm test            # Run Vitest unit & integration tests
npm run typecheck   # Run TypeScript compiler check (tsc --noEmit)
npm run lint        # Run ESLint across src/ and tests/
npm run build       # Build production Next.js bundle
```

