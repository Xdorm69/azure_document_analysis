import { prisma } from "@/lib/prisma";

const MAX_ANALYSIS_CHUNKS = 80;

import type { RetrievedChunk } from "./rag";

export async function getAnalysisContext(
  documentId: string,
): Promise<RetrievedChunk[]> {
  const chunks = await prisma.documentChunk.findMany({
    where: {
      documentId,
    },

    orderBy: {
      chunkIndex: "asc",
    },

    select: {
      id: true,
      content: true,
      pageNumber: true,
      chunkIndex: true,
    },
  });

  return chunks.slice(0, MAX_ANALYSIS_CHUNKS).map((chunk) => ({
    id: chunk.id,
    content: chunk.content,
    pageNumber: chunk.pageNumber ?? 0,
    chunkIndex: chunk.chunkIndex,
    score: 1,
  }));
}
