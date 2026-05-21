# CourseReview

Anonymous course reviews for the MSc Computer Science programme at Universiteit Leiden. Next.js + Supabase + Netlify.

## Requirements

- Node 20+
- Docker (for local Supabase)
- Python 3.10+ (`run_dev.py` and the Studiegids scraper)

## First run

```bash
npm install
cp .env.example .env.local      # fill in after `npx supabase start` prints the local keys
python run_dev.py               # boots Supabase + Next.js together
```

Once Supabase is up:

- Studio UI: http://localhost:54323
- Inbucket (catches OTP mails): http://localhost:54324
- App: http://localhost:3000

## Everyday commands

```bash
npm run dev                     # Next.js only
npm run lint                    # ESLint
npm run typecheck               # tsc --noEmit
npm run db:reset                # wipe local DB and re-apply migrations + seed
npm run db:types                # regenerate src/lib/database.types.ts
python run_dev.py --reset       # run_dev.py with db reset first
python run_dev.py --stop        # stop the Supabase Docker stack
python3 scripts/scrape_studiegids.py --refresh  # update seed data from Studiegids
```

## Supabase setup

Hosted project ref: `wkniscqdzpjmhnwjijmw`.

1. Install and log in to the Supabase CLI:

```bash
npx supabase login
```

2. Link this repo to the hosted project:

```bash
npx supabase link --project-ref wkniscqdzpjmhnwjijmw
```

3. Keep schema work local first:

```bash
npx supabase start
npm run db:reset
npm run db:types
```

4. Push migrations to the hosted project only after local reset works:

```bash
npm run db:push
```

5. Seed hosted data from `supabase/seed.sql` when you are ready. Use the pooled or direct
   connection string from Supabase Dashboard > Project Settings > Database:

```bash
psql "postgresql://..." -f supabase/seed.sql
```

Set production env vars from Supabase dashboard API settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wkniscqdzpjmhnwjijmw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

In Supabase Auth, configure URL settings:

- Site URL: your production domain.
- Redirect URLs: `http://localhost:3000/**` and `https://your-domain.example/**`.
- Email provider: configure SMTP with Resend after your domain is verified.
- Auth method: Email OTP only.

## Layout

- `src/app/**` — routes (App Router, public pages and gated `admin/(protected)` pages)
- `src/components/**` — shared components; `ui/` holds shadcn primitives
- `src/lib/supabase/**` — browser, server, admin, and middleware Supabase clients
- `src/lib/icons/**` — curated icon registry + wrapper
- `src/server-actions/**` — mutations (reviews, courses)
- `supabase/migrations/**` — SQL migrations
- `supabase/seed.sql` — generated seed data (specializations, courses, admin whitelist)
- `scripts/scrape_studiegids.py` — scraper for all MSc Computer Science specializations and course pages

## Agent guidelines

- Claude: see [`CLAUDE.md`](./CLAUDE.md)
- Codex: see [`AGENTS.md`](./AGENTS.md)
