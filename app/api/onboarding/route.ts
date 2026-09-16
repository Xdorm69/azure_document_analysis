import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  return NextResponse.json({
    onboarded: Boolean(user?.onboardingCompletedAt),
    user,
  });
}

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid form data" },
      { status: 400 }
    );
  }

  const clerkProfile = await currentUser();
  const email = clerkProfile?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return NextResponse.json(
      { error: "No verified email found on your account" },
      { status: 400 }
    );
  }

  const { name, role, primaryUseCase, teamSize, referralSource } = parsed.data;

  const user = await prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      name,
      role: role || null,
      primaryUseCase,
      teamSize,
      referralSource: referralSource || null,
      onboardingCompletedAt: new Date(),
    },
    update: {
      email,
      name,
      role: role || null,
      primaryUseCase,
      teamSize,
      referralSource: referralSource || null,
      onboardingCompletedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, user }, { status: 200 });
}
