import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Anything under here requires a signed-in Clerk session. Onboarding
// *completion* is intentionally not checked here — that needs Prisma, and
// we want this to stay lightweight and Edge-friendly. Completion is
// enforced in app/dashboard/layout.tsx (pages) and
// lib/auth/current-user.ts#requireOnboardedUser (API routes).
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboard(.*)',
  '/api/documents(.*)',
  '/api/onboarding(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
