import type {
  ActionItem,
  Entity,
  ImportantDate,
  ImportantNumber,
  KeyFinding,
  Risk,
} from "@/types/analysis";

/**
 * `DocumentAnalysis`'s JSON columns are validated against
 * `documentAnalysisResultSchema` before they're ever written (see
 * `lib/validations/analysis.ts`), so a persisted row's shape can be
 * trusted here. These helpers just guard against `null`/legacy rows.
 */
function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function parseKeyFindings(value: unknown): KeyFinding[] {
  return asArray<KeyFinding>(value);
}

export function parseRisks(value: unknown): Risk[] {
  return asArray<Risk>(value);
}

export function parseEntities(value: unknown): Entity[] {
  return asArray<Entity>(value);
}

export function parseActionItems(value: unknown): ActionItem[] {
  return asArray<ActionItem>(value);
}

export function parseImportantDates(value: unknown): ImportantDate[] {
  return asArray<ImportantDate>(value);
}

export function parseImportantNumbers(value: unknown): ImportantNumber[] {
  return asArray<ImportantNumber>(value);
}

export type Severity = "low" | "medium" | "high";

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

function severityOf(item: { severity?: Severity } | { importance?: Severity }): Severity {
  if ("severity" in item && item.severity) return item.severity;
  if ("importance" in item && item.importance) return item.importance;
  return "low";
}

export function sortBySeverity<T extends { severity?: Severity } | { importance?: Severity }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => SEVERITY_RANK[severityOf(a)] - SEVERITY_RANK[severityOf(b)]
  );
}

export function riskScoreLabel(score: number): {
  label: string;
  tone: "low" | "medium" | "high" | "critical";
} {
  if (score >= 85) return { label: "CRITICAL RISK", tone: "critical" };
  if (score >= 67) return { label: "HIGH RISK", tone: "high" };
  if (score >= 34) return { label: "MEDIUM RISK", tone: "medium" };
  return { label: "LOW RISK", tone: "low" };
}

export const RISK_TONE_CLASSES: Record<
  "low" | "medium" | "high" | "critical",
  { text: string; bg: string; ring: string }
> = {
  low: {
    text: "text-chart-2",
    bg: "bg-chart-2/10",
    ring: "stroke-chart-2",
  },
  medium: {
    text: "text-chart-4",
    bg: "bg-chart-4/10",
    ring: "stroke-chart-4",
  },
  high: {
    text: "text-chart-5",
    bg: "bg-chart-5/10",
    ring: "stroke-chart-5",
  },
  critical: {
    text: "text-destructive",
    bg: "bg-destructive/10",
    ring: "stroke-destructive",
  },
};
