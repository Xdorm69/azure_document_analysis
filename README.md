# Document Analyzer

AI-assisted document review built on Next.js: upload a PDF or image, extract
its text and tables with Azure Document Intelligence, index it for search,
and get an AI-generated summary, risk assessment, and Q&A chat over the
content. Auth is handled by Clerk, with a short post-sign-up questionnaire
before anyone reaches the dashboard.

**Full documentation lives in [`docs/`](./docs/README.md)** — start there.
Quick links:

| Doc | Covers |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, request lifecycle, data model |
| [docs/AUTH_AND_ONBOARDING.md](./docs/AUTH_AND_ONBOARDING.md) | Clerk auth, `/onboard`, route protection |
| [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) | Every `/api/*` route |
| [docs/FRONTEND_DATA_LAYER.md](./docs/FRONTEND_DATA_LAYER.md) | Tanstack Query + Zod conventions |

## Quick start

```bash
pnpm install
cp .env.example .env   # then fill in DATABASE_URL, Clerk keys, Azure keys
pnpm prisma generate
pnpm prisma migrate deploy   # or `migrate dev` locally
pnpm tsx scripts/create-search-index.ts   # one-time, per environment
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and you'll be
sent to `/onboard` before you can reach `/dashboard`.

## Stack

Next.js 16 (App Router) · React 19 · Clerk · Prisma 7 + Postgres ·
Azure Blob Storage / Document Intelligence / OpenAI / AI Search ·
Tanstack Query · Zod

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for how these fit
together.
