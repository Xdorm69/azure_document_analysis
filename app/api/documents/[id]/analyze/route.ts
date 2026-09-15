import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { generateBlobSasUrl } from "@/lib/azure/blob";

import {
  analyzeDocument,
  getAnalysisResult,
} from "@/lib/azure/analyze-document";

import { normalizeDocument } from "@/lib/azure/normalize-document";

import { storeDocumentChunks } from "@/lib/ai/store-chunks";

import { indexDocumentChunks } from "@/lib/ai/index-chunks";

import { getAnalysisContext } from "@/lib/ai/get-analysis-context";

import { analyzeDocumentWithAI } from "@/lib/ai/analyze-document";

import { storeAnalysis } from "@/lib/ai/store-analysis";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await context.params;

  try {
    const document = await prisma.document.findUnique({
      where: { id },
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
