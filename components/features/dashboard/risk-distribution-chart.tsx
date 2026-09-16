"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentStatsQuery } from "@/lib/queries/documents";

const RISK_COLORS: Record<string, string> = {
  Low: "var(--color-chart-2)",
  Medium: "var(--color-chart-4)",
  High: "var(--color-chart-5)",
  Critical: "var(--color-destructive)",
};

export function RiskDistributionChart() {
  const { data, isLoading } = useDocumentStatsQuery();

  const chartData = data
    ? [
        { name: "Low", value: data.riskDistribution.low },
        { name: "Medium", value: data.riskDistribution.medium },
        { name: "High", value: data.riskDistribution.high },
        { name: "Critical", value: data.riskDistribution.critical },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
        <p className="text-xs text-muted-foreground">
          Across all analyzed documents
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-[220px] w-full animate-pulse rounded-lg bg-muted" />
        ) : !data || !data.hasRiskData ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium">No risk data yet</p>
            <p className="text-xs text-muted-foreground">
              Risk levels will appear here once documents are analyzed.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <ul className="shrink-0 space-y-2 text-sm">
              {chartData.map((entry) => (
                <li key={entry.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: RISK_COLORS[entry.name] }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="font-medium tabular-nums">
                    {entry.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
