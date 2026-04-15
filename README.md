# CourseReview

Anonymous course reviews for the MSc Computer Science programme at Universiteit Leiden. Next.js + Supabase + Netlify.

## Requirements

- Node 20+
- Docker (for local Supabase)
- Python 3.10+ (only for the `run_dev.py` helper)

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
```

## Layout

- `src/app/**` — routes (App Router, route groups for `(public)` and `(auth)`, gated `admin/`)
- `src/components/**` — shared components; `ui/` holds shadcn primitives
- `src/lib/supabase/**` — browser, server, admin, and middleware Supabase clients
- `src/lib/icons/**` — curated icon registry + wrapper
- `src/server-actions/**` — mutations (reviews, courses)
- `supabase/migrations/**` — SQL migrations
- `supabase/seed.sql` — seed data (specializations, courses, admin whitelist)

## Agent guidelines

- Claude: see [`CLAUDE.md`](./CLAUDE.md)
- Codex: see [`AGENTS.md`](./AGENTS.md)
- Gemini: see [`GEMINI.md`](./GEMINI.md)

Full product spec and build plan: [`prompts/implementation.md`](./prompts/implementation.md).
