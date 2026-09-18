import { prisma } from "@/lib/prisma";
import { generateBlobSasUrl } from "@/lib/azure/blob";
import { analyzeDocument, getAnalysisResult } from "@/lib/azure/analyze-document";
import { normalizeDocument } from "@/lib/azure/normalize-document";
import { storeDocumentChunks } from "@/lib/ai/store-chunks";
import { indexDocumentChunks } from "@/lib/ai/index-chunks";
import { getAnalysisContext } from "@/lib/ai/get-analysis-context";
import { analyzeDocumentWithAI } from "@/lib/ai/analyze-document";
import { storeAnalysis } from "@/lib/ai/store-analysis";

/**
 * Runs the full extraction → indexing → AI analysis pipeline for a
 * document that's already been uploaded. This is the one place that
 * logic lives — both the manual "Retry analysis" route and the
 * automatic background trigger fired right after upload call this, so
 * there's exactly one implementation of what "processing a document"
 * means.
 */
export async function processDocumentAnalysis(documentId: string) {
  const document = await prisma.document.findUniqueOrThrow({
    where: { id: documentId },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  try {
    const sasUrl = generateBlobSasUrl(document.blobPath);
    const operationLocation = await analyzeDocument(sasUrl);
    const result = await getAnalysisResult(operationLocation);
    const parsed = normalizeDocument(result);

    const chunkStats = await storeDocumentChunks(documentId, parsed);
    const searchStats = await indexDocumentChunks(documentId);

    // Recorded the moment indexing succeeds (not batched with the final
    // update below) so the processing pipeline UI can show "indexed" as
    // its own real, observable step while analysis is still running.
    await prisma.document.update({
      where: { id: documentId },
      data: { indexedAt: new Date() },
    });

    const analysisContext = await getAnalysisContext(documentId);
    const aiAnalysis = await analyzeDocumentWithAI(analysisContext);
    await storeAnalysis(documentId, aiAnalysis);

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "ANALYZED",
        pageCount: parsed.pageCount,
        extractedText: parsed.fullText,
      },
    });

    return {
      document: { id: updated.id, name: updated.name, pageCount: parsed.pageCount },
      chunks: chunkStats,
      search: searchStats,
      analysis: aiAnalysis,
    };
  } catch (error) {
    console.error(`Document analysis failed for ${documentId}:`, error);

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}
