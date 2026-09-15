import { SparklesIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalysisData = {
  summary: string | null;
  keyFindings: unknown;
  risks: unknown;
  entities: unknown;
  actionItems: unknown;
} | null;

function renderListField(value: unknown) {
  if (!value) return null;

  const items = Array.isArray(value) ? value : [value];
  if (items.length === 0) return null;

  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((item, index) => (
        <li key={index}>
          {typeof item === "string" ? item : JSON.stringify(item)}
        </li>
      ))}
    </ul>
  );
}

export function AnalysisPanel({ analysis }: { analysis: AnalysisData }) {
  const hasContent =
    analysis &&
    (analysis.summary ||
      analysis.keyFindings ||
      analysis.risks ||
      analysis.entities ||
      analysis.actionItems);

  if (!hasContent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <SparklesIcon className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No AI insights yet</p>
          <p className="text-sm text-muted-foreground">
            Summary, risks, and key findings will appear here once
            diligence analysis is generated for this document.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {analysis.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {analysis.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {!!analysis.risks && (
        <Card>
          <CardHeader>
            <CardTitle>Risks</CardTitle>
          </CardHeader>
          <CardContent>{renderListField(analysis.risks)}</CardContent>
        </Card>
      )}

      {!!analysis.keyFindings && (
        <Card>
          <CardHeader>
            <CardTitle>Key findings</CardTitle>
          </CardHeader>
          <CardContent>{renderListField(analysis.keyFindings)}</CardContent>
        </Card>
      )}

      {!!analysis.actionItems && (
        <Card>
          <CardHeader>
            <CardTitle>Action items</CardTitle>
          </CardHeader>
          <CardContent>{renderListField(analysis.actionItems)}</CardContent>
        </Card>
      )}

      {!!analysis.entities && (
        <Card>
          <CardHeader>
            <CardTitle>Entities</CardTitle>
          </CardHeader>
          <CardContent>{renderListField(analysis.entities)}</CardContent>
        </Card>
      )}
    </div>
  );
}
