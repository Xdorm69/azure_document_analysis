"use client";

import {
  FileStackIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  GaugeIcon,
  CalendarClockIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { useDocumentStatsQuery } from "@/lib/queries/documents";

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-row items-start justify-between gap-3">
        <div className="w-full space-y-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-7 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}

export function StatCardsGrid() {
  const { data, isLoading, error } = useDocumentStatsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Couldn&apos;t load your metrics right now. Try refreshing the page.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Documents"
        value={data.totalDocuments}
        icon={FileStackIcon}
        hint={
          data.totalDocuments === 0 ? "Upload your first document" : undefined
        }
      />
      <StatCard
        label="Documents Analyzed"
        value={data.analyzedCount}
        icon={ShieldCheckIcon}
        hint={
          data.totalDocuments > 0
            ? `${Math.round((data.analyzedCount / data.totalDocuments) * 100)}% of total`
            : undefined
        }
      />
      <StatCard
        label="High Risk Documents"
        value={data.hasRiskData ? data.highRiskCount : "—"}
        icon={ShieldAlertIcon}
        hint={data.hasRiskData ? "Risk score ≥ 67" : "No analysis yet"}
      />
      <StatCard
        label="Average Risk Score"
        value={data.hasRiskData ? `${data.avgRiskScore}` : "—"}
        icon={GaugeIcon}
        hint={data.hasRiskData ? "out of 100" : "No analysis yet"}
      />
      <StatCard
        label="Processed This Month"
        value={data.processedThisMonth}
        icon={CalendarClockIcon}
      />
    </div>
  );
}
