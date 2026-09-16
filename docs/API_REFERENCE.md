# API Reference

All routes below live under `app/api/`. Every route except `GET /api/onboarding`
and `POST /api/onboarding` sits behind `/api/documents(.*)`, which `proxy.ts`
already requires a Clerk session for. On top of that, every handler calls
`requireOnboardedUser()` (see [AUTH_AND_ONBOARDING.md](./AUTH_AND_ONBOARDING.md))
and scopes any document lookup to `userId: auth.user.id`.

Error responses are always `{ "error": string }` and are validated on the
client against `apiErrorSchema` (`lib/validations/api-responses.ts`).

## `POST /api/onboarding`

Creates or updates the Prisma `User` row for the current Clerk session and
stamps `onboardingCompletedAt`.

- **Auth:** Clerk session required (401 if missing). Does **not** require
  onboarding to already be complete — that's the point of this route.
- **Body:** `onboardingSchema` (`lib/validations/onboarding.ts`) — `name`,
  optional `role`, `primaryUseCase`, `teamSize`, optional `referralSource`.
- **400** if the body fails validation, or if the Clerk account has no
  verified email address.
- **200** `{ success: true, user: User }`

## `GET /api/onboarding`

Reads onboarding status for the current session.

- **Auth:** Clerk session required (401 if missing).
- **200** `{ onboarded: boolean, user: User | null }`

## `GET /api/documents`

Lists the signed-in user's documents, newest first.

- **Auth:** `requireOnboardedUser()` (401 signed out, 403 not onboarded).
- **200** `{ documents: DocumentSummary[] }` — validated client-side against
  `documentListResponseSchema`.

## `POST /api/documents/upload`

Uploads a file to Azure Blob Storage and creates a `Document` row owned by
the current user.

- **Auth:** `requireOnboardedUser()`.
- **Body:** `multipart/form-data` with a `file` field. Validated against
  `documentFileMetadataSchema` (`lib/validations/document.ts`) — PDF, PNG,
  or JPEG, ≤ 20MB.
- **400** invalid/missing file. **500** on upload/DB failure.
- **201** `{ success: true, document: { id, name, ... } }` — validated
  client-side against `uploadResponseSchema`.

## `POST /api/documents/:id/analyze`

Runs (or re-runs) the full analysis pipeline for a document: Azure Document
Intelligence → chunking → embeddings/indexing → AI summary. See
[ARCHITECTURE.md](./ARCHITECTURE.md#document-lifecycle) for the pipeline
steps.

- **Auth:** `requireOnboardedUser()`; the document must belong to the
  caller or this 404s.
- **404** document not found (or owned by someone else).
- **500** sets `status: FAILED` and returns the error message if any step
  throws.
- **200** `{ success: true, document, chunks, search, analysis }` —
  validated client-side against `analyzeResponseSchema`.

## `GET /api/documents/:id/chunks`

Lists the indexed text chunks for a document.

- **Auth:** `requireOnboardedUser()`; ownership-checked, 404 otherwise.
- **200** `{ chunks: DocumentChunkSummary[] }` — validated against
  `documentChunksResponseSchema`.

## `POST /api/documents/:id/chat`

Retrieval-augmented Q&A over one document.

- **Auth:** `requireOnboardedUser()`; ownership-checked, 404 otherwise.
- **Body:** `chatRequestSchema` (`lib/validations/chat.ts`) — `{ question: string }`,
  1–2000 characters.
- **409** if the document hasn't finished analysis (`status !== "ANALYZED"`).
- **200** `{ answer, citations, retrievedChunks }` — validated against
  `chatResponseSchema`.

## `POST /api/documents/:id/search`

Raw vector search over a document's chunks (used internally / for
debugging chat retrieval — the chat route already calls the equivalent
`retrieveChunks` directly).

- **Auth:** `requireOnboardedUser()`; ownership-checked, 404 otherwise.
- **Body:** `searchRequestSchema` (alias of `chatRequestSchema`).
- **200** `{ results }`
