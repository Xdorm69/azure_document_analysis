import { searchClient } from "@/lib/azure/search";
import { prisma } from "@/lib/prisma";

import {
  createEmbeddings,
} from "./embed-chunks";

export async function indexDocumentChunks(
  documentId: string
) {
  const chunks =
    await prisma.documentChunk.findMany({
      where: {
        documentId,
      },

      orderBy: {
        chunkIndex: "asc",
      },
    });

  if (chunks.length === 0) {
    return {
      indexed: 0,
    };
  }

  const embeddings =
    await createEmbeddings(
      chunks.map(
        (chunk) => chunk.content
      )
    );

  const searchDocuments =
    chunks.map(
      (chunk, index) => ({
        id: chunk.id,

        documentId:
          chunk.documentId,

        content:
          chunk.content,

        pageNumber:
          chunk.pageNumber ?? 0,

        chunkIndex:
          chunk.chunkIndex,

        embedding:
          embeddings[index],
      })
    );

  await searchClient.mergeOrUploadDocuments(
    searchDocuments
  );

  return {
    indexed:
      searchDocuments.length,
  };
}