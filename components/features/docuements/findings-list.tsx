import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KeyFinding, Risk } from "@/types/analysis";
import { RISK_TONE_CLASSES, sortBySeverity } from "@/lib/analysis-view";

type UnifiedItem = {
  kind: "finding" | "risk";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  pages: number[];
};

const SEVERITY_TONE: Record<"low" | "medium" | "high", "low" | "medium" | "high"> = {
  low: "low",
  medium: "medium",
  high: "high",
};

function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const toneClasses = RISK_TONE_CLASSES[SEVERITY_TONE[severity]];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        toneClasses.bg,
        toneClasses.text
      )}
    >
      {severity} risk
    </span>
  );
}

export function FindingsList({
  keyFindings,
  risks,
  onSelectPage,
}: {
  keyFindings: KeyFinding[];
  risks: Risk[];
  onSelectPage?: (page: number) => void;
}) {
  const unified: UnifiedItem[] = sortBySeverity([
    ...risks.map((r) => ({
      kind: "risk" as const,
      title: r.title,
      description: r.description,
      severity: r.severity,
      pages: r.pages,
    })),
    ...keyFindings.map((f) => ({
      kind: "finding" as const,
      title: f.title,
      description: f.description,
      severity: f.importance,
      pages: f.pages,
    })),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Findings</CardTitle>
        <p className="text-xs text-muted-foreground">
          Findings and flagged risks, ordered by severity
        </p>
      </CardHeader>
      <CardContent>
        {unified.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No findings were flagged for this document.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {unified.map((item, index) => (
              <li key={index}>
                <details className="group py-3 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={item.severity} />
                        <p className="truncate text-sm font-medium">
                          {item.title}
                        </p>
                      </div>
                      {item.pages.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectPage?.(item.pages[0]);
                          }}
                          disabled={!onSelectPage}
                          className={cn(
                            "mt-1 text-xs text-muted-foreground",
                            onSelectPage && "underline-offset-2 hover:text-primary hover:underline"
                          )}
                        >
                          {item.pages.length === 1
                            ? `Page ${item.pages[0]}`
                            : `Pages ${item.pages.join(", ")}`}
                        </button>
                      )}
                    </div>
                    <ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
