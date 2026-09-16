# Architecture

## Stack

- **Next.js 16** (App Router), React 19
- **Clerk** for authentication
- **Prisma 7** + Postgres for application data
- **Azure Blob Storage** for the original uploaded files
- **Azure Document Intelligence** for OCR / text & table extraction
- **Azure OpenAI** for embeddings, the AI analysis (summary/risks/etc.), and
  chat answers
- **Azure AI Search** as the vector index used for retrieval-augmented chat
- **Tanstack Query** for client-side data fetching/caching
- **Zod** for runtime validation of file uploads, API request bodies, and
  API responses

## Data model

```
User
 └─ Document (0..*)          — one row per uploaded file, owned by a User
     ├─ DocumentPage (0..*)  — raw per-page OCR text
     ├─ DocumentChunk (0..*) — page text split into embeddable chunks
     └─ DocumentAnalysis (0..1) — AI-generated summary/risks/findings
```

- `User.clerkId` is the link between a Clerk identity and app data. A `User`
  row is only created once someone finishes the `/onboard` questionnaire —
  see [AUTH_AND_ONBOARDING.md](./AUTH_AND_ONBOARDING.md).
- `Document.userId` scopes every document to its owner. All `/api/documents/*`
  routes filter by the signed-in user's id — nobody can read, chat with, or
  re-analyze another user's documents by guessing an id.

## Document lifecycle

```
UPLOADED → PROCESSING → ANALYZED
                      ↘ FAILED (retryable)
```

1. **Upload** (`POST /api/documents/upload`) — the file is validated (type,
   size), streamed to Azure Blob Storage, and a `Document` row is created
   with status `UPLOADED`.
2. **Analyze** (`POST /api/documents/:id/analyze`) — kicked off automatically
   right after upload (and re-triggerable via "Retry analysis"):
   - `status` → `PROCESSING`
   - Azure Document Intelligence extracts pages/lines/tables from a
     short-lived SAS URL to the blob
   - The extracted text is chunked and the chunks are embedded and written
     to Azure AI Search (`lib/ai/store-chunks.ts`, `lib/ai/index-chunks.ts`)
   - The full text is sent to Azure OpenAI for a structured analysis
     (summary, risk score, key findings, risks, entities, dates, numbers,
     action items) — validated against `documentAnalysisResultSchema`
     (see [FRONTEND_DATA_LAYER.md](./FRONTEND_DATA_LAYER.md#zod-validation))
     before being persisted
   - `status` → `ANALYZED` (or `FAILED` if any step throws)
3. **Chat** (`POST /api/documents/:id/chat`) — only allowed once a document
   is `ANALYZED`. Retrieves the most relevant chunks for the question from
   Azure AI Search, then asks Azure OpenAI to answer using only that
   context, returning the answer plus page-level citations.

## Request lifecycle for a page load

- **Server components** (`app/dashboard/documents/[id]/page.tsx`) read
  directly from Prisma — no client round-trip needed for the initial render.
- **Client components** (the dashboard's document list, chat, upload flow)
  go through Tanstack Query hooks in `lib/queries/`, which call `fetch`
  against `/api/*` routes. This keeps a single cache of "the current user's
  documents" that upload/analyze/retry mutations invalidate, so the list
  and status badges update without a manual refresh.
- Because the document detail page is server-rendered, actions taken from
  client components on that page (retry analysis) call `router.refresh()`
  after their mutation settles, in addition to invalidating the Tanstack
  Query cache used elsewhere.
