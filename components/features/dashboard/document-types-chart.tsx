"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentStatsQuery } from "@/lib/queries/documents";

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/tiff": "TIFF",
};

function labelFor(mimeType: string) {
  return MIME_LABELS[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? mimeType;
}

export function DocumentTypesChart() {
  const { data, isLoading } = useDocumentStatsQuery();

  const chartData = data?.documentTypes
    .map((t) => ({ type: labelFor(t.mimeType), count: t.count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Types</CardTitle>
        <p className="text-xs text-muted-foreground">By file format</p>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="h-[220px] w-full animate-pulse rounded-lg bg-muted" />
        ) : !chartData || chartData.length === 0 ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium">No documents yet</p>
            <p className="text-xs text-muted-foreground">
              Upload documents to see the format breakdown.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fontSize: 12, fill: "var(--color-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" name="Documents" fill="var(--color-chart-3)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
