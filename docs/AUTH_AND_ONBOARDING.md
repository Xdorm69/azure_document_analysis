# Auth & Onboarding

Authentication is handled entirely by **Clerk**. The app layers one more
concept on top: a Prisma `User` row that only exists once someone has
completed a short onboarding questionnaire.

## Why a separate `User` table?

Clerk owns identity (email, password, sessions, social login, etc). The app
owns *product* data about a user — their role, primary use case, team size —
plus it's the row that `Document.userId` points to. Keeping our own `User`
table means:

- We can require a completed questionnaire before granting access to the
  dashboard, independent of whatever Clerk considers "signed in".
- Document ownership is a normal foreign key, not a lookup keyed on a
  third-party id sprinkled through every query.

`User.clerkId` is the unique link back to Clerk (`auth().userId`).

## The flow

```
Sign up (Clerk)
      │
      ▼
 /onboard  ──── already onboarded? ────▶  /dashboard
      │  no
      ▼
 fills out questionnaire
      │
      ▼
 POST /api/onboarding  (creates/updates the User row,
                         sets onboardingCompletedAt)
      │
      ▼
 /dashboard
```

- The header's sign-in button uses `forceRedirectUrl="/onboard"`, so a fresh
  sign-up lands on the questionnaire immediately.
- `app/onboard/page.tsx` (server component) checks Prisma directly: if a
  `User` row already has `onboardingCompletedAt` set, it redirects straight
  to `/dashboard` instead of showing the form again.
- `app/dashboard/layout.tsx` (server component) is the actual gate: any
  authenticated user without a completed `User` row is redirected to
  `/onboard`. This runs on every `/dashboard/*` page, so there's no route
  under `/dashboard` that can be reached without onboarding.

## Route protection

`proxy.ts` (this project's Next.js version renames `middleware.ts` to
`proxy.ts` — see `AGENTS.md`) uses `clerkMiddleware` with a route matcher to
require a signed-in session for:

- `/dashboard(.*)`
- `/onboard(.*)`
- `/api/documents(.*)`
- `/api/onboarding(.*)`

Middleware intentionally does **not** check onboarding status — that needs
Prisma, and we want middleware to stay lightweight and Edge-friendly.
Onboarding completion is enforced in:

- `app/dashboard/layout.tsx` for pages
- `lib/auth/current-user.ts#requireOnboardedUser` for API routes

## `requireOnboardedUser()`

Every `/api/documents/*` route starts with:

```ts
const auth = await requireOnboardedUser();
if (!auth.ok) return auth.response;
// auth.user is the Prisma `User` row for the current session
```

This returns a `401` if there's no Clerk session, or a `403` if the person
is signed in but hasn't finished `/onboard` yet (no `User` row, or
`onboardingCompletedAt` is null). Every document query in these routes also
filters `where: { userId: auth.user.id }`, so one user's document ids are
never readable, chat-able, or re-analyzable by another user.

## The questionnaire

Defined once, in `lib/validations/onboarding.ts`, and shared by both the
client form and the API route so they can never drift:

- **Name** (required)
- **Role** (optional free text)
- **Primary use case** — contracts / financial reports / compliance /
  something else
- **Team size** — solo up to 200+
- **Referral source** (optional)

`app/onboard/onboarding-form.tsx` validates with the same
`onboardingSchema.safeParse` before submitting, so invalid input never
reaches the network; `POST /api/onboarding` validates it again server-side
(never trust the client) and upserts the `User` row, stamping
`onboardingCompletedAt`.
