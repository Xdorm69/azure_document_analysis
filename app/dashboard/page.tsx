import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { StatCardsGrid } from "@/components/features/dashboard/stat-cards-grid";
import { ActivityChart } from "@/components/features/dashboard/activity-chart";
import { RiskDistributionChart } from "@/components/features/dashboard/risk-distribution-chart";
import { DocumentTypesChart } from "@/components/features/dashboard/document-types-chart";
import { DocumentsWorkspace } from "@/components/features/docuements/documents-workspace";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const user = clerkId
    ? await prisma.user.findUnique({
        where: { clerkId },
        select: { name: true },
      })
    : null;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <DashboardHeader userName={user?.name} />

      <StatCardsGrid />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <RiskDistributionChart />
        <div className="lg:col-span-2">
          <DocumentTypesChart />
        </div>
      </div>

      <div id="upload-zone">
        <DocumentsWorkspace />
      </div>
    </main>
  );
}
