import { SparklesIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { RiskScoreCard } from "@/components/features/docuements/risk-score-card";
import { DocumentStatsRow } from "@/components/features/docuements/document-stats-row";
import { SummaryCard } from "@/components/features/docuements/summary-card";
import { FindingsList } from "@/components/features/docuements/findings-list";
import { RiskCategoryBreakdown } from "@/components/features/docuements/risk-category-breakdown";
import { EntitiesCard, ActionItemsCard } from "@/components/features/docuements/analysis-extras";
import {
  parseActionItems,
  parseEntities,
  parseKeyFindings,
  parseRisks,
} from "@/lib/analysis-view";

type AnalysisData = {
  summary: string | null;
  riskScore: number | null;
  keyFindings: unknown;
  risks: unknown;
  entities: unknown;
  actionItems: unknown;
} | null;

export function AnalysisOverview({
  analysis,
  pageCount,
  chunkCount,
  onSelectPage,
}: {
  analysis: AnalysisData;
  pageCount: number | null;
  chunkCount: number;
  onSelectPage?: (page: number) => void;
}) {
  if (!analysis) {
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

  const keyFindings = parseKeyFindings(analysis.keyFindings);
  const risks = parseRisks(analysis.risks);
  const entities = parseEntities(analysis.entities);
  const actionItems = parseActionItems(analysis.actionItems);

  return (
    <div className="space-y-4">
      <RiskScoreCard score={analysis.riskScore} />

      <DocumentStatsRow
        pageCount={pageCount}
        chunkCount={chunkCount}
        findingsCount={keyFindings.length}
        risksCount={risks.length}
      />

      <SummaryCard summary={analysis.summary} />

      <FindingsList keyFindings={keyFindings} risks={risks} onSelectPage={onSelectPage} />

      <RiskCategoryBreakdown />

      <EntitiesCard entities={entities} />

      <ActionItemsCard actionItems={actionItems} />
    </div>
  );
}
