import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

/**
 * Looks up the Prisma `User` row for the current Clerk session, if any.
 * Returns `null` when signed out *or* when the user hasn't finished
 * onboarding yet (no row has been created for them).
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  return prisma.user.findUnique({ where: { clerkId } });
}

type AuthResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/**
 * Guard for API route handlers: resolves the signed-in, onboarded user or
 * returns a ready-to-return `NextResponse` (401/403) explaining why not.
 *
 * ```ts
 * const result = await requireOnboardedUser();
 * if (!result.ok) return result.response;
 * const { user } = result;
 * ```
 */
export async function requireOnboardedUser(): Promise<AuthResult> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user || !user.onboardingCompletedAt) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Please finish onboarding before continuing" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}
