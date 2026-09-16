# Frontend data layer

Client components never call `fetch` directly against `/api/*` — they go
through the Tanstack Query hooks in `lib/queries/`, which in turn go through
`fetchJson` (`lib/api-client.ts`). Server components (the document detail
page, the onboarding/dashboard guards) read straight from Prisma instead,
since they don't need client-side caching.

## Why a `fetchJson` wrapper

```ts
fetchJson(url, schema, options?) → Promise<z.infer<typeof schema>>
```

- Serializes `options.body` as JSON automatically.
- On a non-2xx response, parses the body against `apiErrorSchema` and
  throws `ApiError` with the server's message (or a generic fallback),
  carrying the HTTP status.
- On success, **parses the response against the Zod schema you pass in**.
  If the server's shape ever drifts from what the client expects, this
  throws immediately with a clear message instead of `undefined` surfacing
  three components deep.

Every response schema lives in `lib/validations/api-responses.ts` — see
[API_REFERENCE.md](./API_REFERENCE.md) for which schema matches which
route.

## Query key conventions (`lib/queries/documents.ts`)

```ts
documentKeys.all              // ["documents"]
documentKeys.list()           // ["documents", "list"]
documentKeys.detail(id)       // ["documents", "detail", id]
documentKeys.chunks(id)       // ["documents", id, "chunks"]
```

Mutations invalidate the relevant key(s) in `onSuccess`/`onSettled` rather
than manually patching the cache, so the list and any open chunk view stay
in sync without extra bookkeeping.

## Polling

`useDocumentsQuery` polls every 5s via `refetchInterval` **only** while at
least one document is `UPLOADED` or `PROCESSING`; it stops automatically
once everything is `ANALYZED`/`FAILED`. This replaces the old
`setInterval` + manual `refresh()` pattern.

The document *detail* page is server-rendered, so it uses a different
mechanism for the same problem: `components/features/docuements/auto-refresh.tsx`
calls `router.refresh()` on an interval while the document is still
processing. This isn't a Tanstack Query concern (no client fetch is
involved) — it's a Next.js server-component refresh.

## Available hooks

| Hook | Type | Purpose |
|---|---|---|
| `useDocumentsQuery()` | query | List the current user's documents; auto-polls while any are active. |
| `useDocumentChunksQuery(id)` | query | Chunks for one document. |
| `useUploadDocumentMutation()` | mutation | Upload a file; invalidates the list on success. |
| `useAnalyzeDocumentMutation()` | mutation | (Re-)run analysis; invalidates the list and that document's chunks. |
| `useDocumentChatMutation(id)` | mutation | Ask a question about one document. |
| `useSubmitOnboardingMutation()` | mutation | (`lib/queries/onboarding.ts`) Submit the `/onboard` form. |

## Zod validation, end to end

Request and response shapes are defined **once** and shared:

- `lib/validations/document.ts` — file metadata (type/size), used by both
  the upload API route and `UploadZone`'s client-side pre-check.
- `lib/validations/chat.ts` — chat/search question body, used by the API
  routes and `useDocumentChatMutation`.
- `lib/validations/onboarding.ts` — the questionnaire, used by the
  `/onboard` form and `POST /api/onboarding`.
- `lib/validations/api-responses.ts` — every JSON shape returned by
  `/api/*`, used by `fetchJson` on the client.

Because the same schema backs both sides, a client-side `safeParse` catches
bad input before it hits the network, and the server-side `parse`/`safeParse`
is what actually protects the API (client-side validation is a UX nicety,
never the security boundary).
