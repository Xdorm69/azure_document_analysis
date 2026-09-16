import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/app/onboard/onboarding-form";

export default async function OnboardPage() {
  const { userId: clerkId } = await auth();

  // The /onboard(.*) matcher in proxy.ts already requires a session, but
  // guard here too in case this page is ever reached some other way.
  if (!clerkId) {
    redirect("/");
  }

  const existingUser = await prisma.user.findUnique({ where: { clerkId } });

  if (existingUser?.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  const clerkProfile = await currentUser();
  const suggestedName = [clerkProfile?.firstName, clerkProfile?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="mx-auto flex max-w-xl flex-col px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome — let&apos;s set up your workspace
        </h1>
        <p className="mt-2 text-muted-foreground">
          A few quick questions so we can tailor Document Analyzer to how
          you&apos;ll use it. This takes about 30 seconds.
        </p>
      </div>

      <OnboardingForm defaultName={suggestedName} />
    </main>
  );
}
