"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentStatsQuery } from "@/lib/queries/documents";

export function ActivityChart() {
  const { data, isLoading } = useDocumentStatsQuery();

  const total = data?.activity.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Activity</CardTitle>
        <p className="text-xs text-muted-foreground">
          Uploads over the last 30 days
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-[220px] w-full animate-pulse rounded-lg bg-muted" />
        ) : !data || total === 0 ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs text-muted-foreground">
              Upload and analyze documents to see activity trends here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.activity} margin={{ left: -20, right: 8 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <Tooltip
                labelFormatter={(value: string) =>
                  new Date(value).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Documents"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#activityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
