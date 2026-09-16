import type { Entity, KeyFinding, Risk } from "@/types/analysis";

const SEVERITY_RANK = { high: 0, medium: 1, low: 2 } as const;

/**
 * Builds suggested prompts from what the analysis actually found for
 * *this* document, rather than a generic fixed list that assumes every
 * document is a contract. Nothing here names a clause type or party
 * obligation the document hasn't shown evidence of.
 */
export function buildSuggestedQuestions({
  hasSummary,
  risks,
  keyFindings,
  entities,
}: {
  hasSummary: boolean;
  risks: Risk[];
  keyFindings: KeyFinding[];
  entities: Entity[];
}): string[] {
  const suggestions: string[] = [];

  if (hasSummary) {
    suggestions.push("Summarize this document");
  }

  if (risks.length > 0) {
    suggestions.push("What are the major risks?");

    const topRisk = [...risks].sort(
      (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
    )[0];
    suggestions.push(`What does "${topRisk.title}" mean for me?`);
  }

  if (keyFindings.length > 0) {
    suggestions.push(`Tell me more about "${keyFindings[0].title}"`);
  }

  const organization = entities.find((e) => e.type === "organization");
  if (organization) {
    suggestions.push(`What is ${organization.name}'s role in this document?`);
  }

  return Array.from(new Set(suggestions)).slice(0, 4);
}
