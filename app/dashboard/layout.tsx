import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

import { prisma } from "@/lib/prisma";
import { DocumentStatusWatcher } from "@/components/features/docuements/document-status-watcher";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId: clerkId } = await auth();

  // proxy.ts already requires a session for /dashboard(.*), this is a
  // defensive second check plus where we enforce onboarding completion.
  if (!clerkId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user?.onboardingCompletedAt) {
    redirect("/onboard");
  }

  return (
    <>
      <DocumentStatusWatcher />
      {children}
    </>
  );
}
