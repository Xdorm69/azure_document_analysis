import { DocumentAnalysisResult } from "@/types/analysis";

export function validateAnalysis(
  value: unknown
): DocumentAnalysisResult {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    throw new Error(
      "Invalid analysis response"
    );
  }

  const data =
    value as Record<string, unknown>;

  if (
    typeof data.summary !== "string"
  ) {
    throw new Error(
      "Analysis summary missing"
    );
  }

  if (
    typeof data.riskScore !== "number"
  ) {
    throw new Error(
      "Analysis risk score missing"
    );
  }

  if (
    data.riskScore < 0 ||
    data.riskScore > 100
  ) {
    throw new Error(
      "Invalid risk score"
    );
  }

  if (
    !Array.isArray(
      data.keyFindings
    )
  ) {
    throw new Error(
      "Invalid key findings"
    );
  }

  if (
    !Array.isArray(data.risks)
  ) {
    throw new Error(
      "Invalid risks"
    );
  }

  if (
    !Array.isArray(
      data.entities
    )
  ) {
    throw new Error(
      "Invalid entities"
    );
  }

  if (
    !Array.isArray(
      data.importantDates
    )
  ) {
    throw new Error(
      "Invalid dates"
    );
  }

  if (
    !Array.isArray(
      data.importantNumbers
    )
  ) {
    throw new Error(
      "Invalid numbers"
    );
  }

  if (
    !Array.isArray(
      data.actionItems
    )
  ) {
    throw new Error(
      "Invalid action items"
    );
  }

  return data as DocumentAnalysisResult;
}