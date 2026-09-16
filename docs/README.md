# Document Analyzer — Docs

AI-assisted document review: upload a PDF or image, extract its text and
tables with Azure Document Intelligence, index it for search, and get an
AI-generated summary, risk assessment, and Q&A chat over the content.

This folder documents how the app fits together. Start here, then go deeper
with whichever page matches what you're touching:

| Doc | Covers |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level system design, request lifecycle, data model |
| [AUTH_AND_ONBOARDING.md](./AUTH_AND_ONBOARDING.md) | Clerk auth, the `/onboard` questionnaire, route protection |
| [API_REFERENCE.md](./API_REFERENCE.md) | Every `/api/*` route: method, auth, body, response |
| [FRONTEND_DATA_LAYER.md](./FRONTEND_DATA_LAYER.md) | Tanstack Query conventions and Zod validation patterns |

## Quick start

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment variables** — copy `.env.example` to `.env` and
   fill in:
   - `DATABASE_URL` — a Postgres connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from the
     [Clerk dashboard](https://dashboard.clerk.com)
   - The `AZURE_*` variables — Storage, Document Intelligence, OpenAI, and
     AI Search credentials

3. **Run database migrations**

   ```bash
   pnpm prisma migrate deploy   # or `migrate dev` locally
   ```

4. **Create the Azure AI Search index** (one-time, per environment)

   ```bash
   pnpm tsx scripts/create-search-index.ts
   ```

5. **Start the dev server**

   ```bash
   pnpm dev
   ```

6. Sign up at `http://localhost:3000`. New users are sent to `/onboard`
   before they can reach `/dashboard` — see
   [AUTH_AND_ONBOARDING.md](./AUTH_AND_ONBOARDING.md).

## Project layout

```
app/
  api/documents/...        API routes (upload, analyze, chat, search, chunks)
  api/onboarding/route.ts  Saves the onboarding questionnaire to Prisma
  onboard/                 Post-sign-up questionnaire (server page + client form)
  dashboard/               Authenticated app (guarded by app/dashboard/layout.tsx)
  providers.tsx            Tanstack Query provider
components/
  features/docuements/     Document list, upload, chat, analysis UI
  ui/                      Design-system primitives (button, card, dialog, input)
lib/
  auth/current-user.ts     Server-side "who is this Clerk session, in Prisma" helper
  queries/                 Tanstack Query hooks (client-side data layer)
  validations/             Zod schemas — request bodies, files, API responses
  azure/                   Azure Storage / Document Intelligence / OpenAI / Search clients
  ai/                      RAG pipeline: chunking, embeddings, retrieval, generation
prisma/
  schema.prisma            Data model (User, Document, DocumentChunk, DocumentAnalysis, ...)
```
