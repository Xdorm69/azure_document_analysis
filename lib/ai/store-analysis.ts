import { prisma } from "@/lib/prisma";

import type { DocumentAnalysisResult } from "@/types/analysis";

export async function storeAnalysis(
  documentId: string,
  analysis: DocumentAnalysisResult,
) {
  return prisma.documentAnalysis.upsert({
    where: {
      documentId,
    },

    create: {
      documentId,

      summary: analysis.summary,

      keyFindings: analysis.keyFindings,

      risks: analysis.risks,

      entities: analysis.entities,

      importantDates: analysis.importantDates,

      importantNumbers: analysis.importantNumbers,

      actionItems: analysis.actionItems,

      riskScore: analysis.riskScore,

      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
    },

    update: {
      summary: analysis.summary,

      keyFindings: analysis.keyFindings,

      risks: analysis.risks,

      entities: analysis.entities,

      importantDates: analysis.importantDates,

      importantNumbers: analysis.importantNumbers,

      actionItems: analysis.actionItems,
      riskScore: analysis.riskScore,

      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
    },
  });
}
