import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/auth/current-user";
import { documentIdParamSchema } from "@/lib/validations/document";
import { generateBlobSasUrl } from "@/lib/azure/blob";
import { analyzeDocument, getAnalysisResult } from "@/lib/azure/analyze-document";
import { normalizeDocument } from "@/lib/azure/normalize-document";
import { storeDocumentChunks } from "@/lib/ai/store-chunks";
import { indexDocumentChunks } from "@/lib/ai/index-chunks";
import { getAnalysisContext } from "@/lib/ai/get-analysis-context";
import { analyzeDocumentWithAI } from "@/lib/ai/analyze-document";
import { storeAnalysis } from "@/lib/ai/store-analysis";

// Analysis (Document Intelligence + AI calls) can run for a while; give
// this route enough headroom on serverless rather than relying on the
// platform default. Match this to whatever your hosting plan allows.
export const maxDuration = 300;

/**
 * Manually (re-)runs analysis for a document — used by the "Retry
 * analysis" button on a failed document. Kept synchronous (unlike the
 * automatic trigger fired right after upload) so the retry button can
 * show a definitive success/failure result immediately.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireOnboardedUser();
  if (!auth.ok) return auth.response;

  const parsedParams = documentIdParamSchema.safeParse(await context.params);
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: parsedParams.error.issues[0]?.message ?? "Invalid document id" },
      { status: 400 },
    );
  }
  const { id } = parsedParams.data;

  try {
    // Scoped to the signed-in user: another user's document id 404s
    // instead of leaking whether it exists.
    const document = await prisma.document.findFirst({
      where: { id, userId: auth.user.id },
    });

    if (!document) {
      return NextResponse.json(
        {
          error: "Document not found",
        },
        { status: 404 },
      );
    }

    await prisma.document.update({
      where: { id },
      data: {
        status: "PROCESSING",
      },
    });

    // 1. Generate temporary URL
    const sasUrl = generateBlobSasUrl(document.blobPath);

    // 2. Start Azure analysis
    const operationLocation = await analyzeDocument(sasUrl);

    // 3. Wait for result
    const result = await getAnalysisResult(operationLocation);

    // 4. Convert Azure response
    const parsed = normalizeDocument(result);

    // u4. Chunk stats

    const chunkStats = await storeDocumentChunks(document.id, parsed);

    const searchStats = await indexDocumentChunks(document.id);

    // Recorded the moment indexing succeeds (not batched with the final
    // update below) so the processing pipeline UI can show "indexed" as
    // its own real, observable step while analysis is still running.
    await prisma.document.update({
      where: { id },
      data: { indexedAt: new Date() },
    });

    //ai summarization
    const analysisContext = await getAnalysisContext(document.id);

    const aiAnalysis = await analyzeDocumentWithAI(analysisContext);

    await storeAnalysis(document.id, aiAnalysis);

    // 5. Save result
    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: "ANALYZED",
        pageCount: parsed.pageCount,
        extractedText: parsed.fullText,
      },
    });

    return NextResponse.json({
      success: true,

      document: {
        id: updated.id,
        name: updated.name,
        pageCount: parsed.pageCount,
      },

      chunks: chunkStats,

      search: searchStats,

      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error(error);

    await prisma.document.update({
      where: { id },
      data: {
        status: "FAILED",
      },
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 },
    );
  }
}
