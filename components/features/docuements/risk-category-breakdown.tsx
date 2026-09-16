import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The AI analysis doesn't currently tag risks with a category (legal,
 * financial, compliance, etc.) — `Risk` only carries a `severity`. Rather
 * than invent categories, this renders an honest empty state. If
 * `lib/ai` starts producing a `category` field on `Risk`, this component
 * is the place to group and chart it.
 */
export function RiskCategoryBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Breakdown by Category</CardTitle>
        <p className="text-xs text-muted-foreground">
          Legal, financial, compliance, contractual, operational
        </p>
      </CardHeader>
      <CardContent>
        <p className="py-4 text-sm text-muted-foreground">
          Category-level risk tagging isn&apos;t produced by the analysis
          model yet. Once risks are tagged with a category, they&apos;ll be
          broken out here automatically.
        </p>
      </CardContent>
    </Card>
  );
}
