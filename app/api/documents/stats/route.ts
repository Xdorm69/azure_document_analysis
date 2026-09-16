import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/auth/current-user";

/**
 * Aggregate dashboard metrics for the signed-in user's documents.
 *
 * Everything here is derived from real rows (`Document` / `DocumentAnalysis`)
 * — no placeholder numbers. Metrics that would require data the schema
 * doesn't capture yet (e.g. a semantic document "type" beyond mime type,
 * or a per-category risk breakdown) are intentionally left out rather than
 * invented; the dashboard renders an empty state for those instead.
 */
export async function GET() {
  const auth = await requireOnboardedUser();
  if (!auth.ok) return auth.response;

  const userId = auth.user.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [documents, analyses] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      select: { id: true, mimeType: true, status: true, createdAt: true },
    }),
    prisma.documentAnalysis.findMany({
      where: { document: { userId } },
      select: { riskScore: true },
    }),
  ]);

  const totalDocuments = documents.length;
  const analyzedCount = documents.filter((d) => d.status === "ANALYZED").length;
  const processedThisMonth = documents.filter(
    (d) => d.createdAt >= startOfMonth
  ).length;

  const riskScores = analyses
    .map((a) => a.riskScore)
    .filter((score): score is number => typeof score === "number");

  const avgRiskScore =
    riskScores.length > 0
      ? Math.round(
          riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length
        )
      : null;

  const highRiskCount = riskScores.filter((score) => score >= 67).length;

  const riskDistribution = {
    low: riskScores.filter((s) => s < 34).length,
    medium: riskScores.filter((s) => s >= 34 && s < 67).length,
    high: riskScores.filter((s) => s >= 67 && s < 85).length,
    critical: riskScores.filter((s) => s >= 85).length,
  };

  // Document activity: uploads per day for the last 30 days.
  const activityByDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const day = new Date(thirtyDaysAgo);
    day.setDate(day.getDate() + i);
    activityByDay.set(day.toISOString().slice(0, 10), 0);
  }
  for (const doc of documents) {
    if (doc.createdAt >= thirtyDaysAgo) {
      const key = doc.createdAt.toISOString().slice(0, 10);
      if (activityByDay.has(key)) {
        activityByDay.set(key, (activityByDay.get(key) ?? 0) + 1);
      }
    }
  }
  const activity = Array.from(activityByDay.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Document types, grouped by mime type (the only "type" the schema
  // currently records — not a semantic classification).
  const typeCounts = new Map<string, number>();
  for (const doc of documents) {
    typeCounts.set(doc.mimeType, (typeCounts.get(doc.mimeType) ?? 0) + 1);
  }
  const documentTypes = Array.from(typeCounts.entries()).map(
    ([mimeType, count]) => ({ mimeType, count })
  );

  return NextResponse.json({
    totalDocuments,
    analyzedCount,
    highRiskCount,
    avgRiskScore,
    processedThisMonth,
    riskDistribution,
    activity,
    documentTypes,
    hasRiskData: riskScores.length > 0,
  });
}
