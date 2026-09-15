import { prisma } from "@/lib/prisma";

import {
  chunkPages,
} from "./chunker";

import {
  preparePages,
} from "./prepare-pages";

import type {
  ParsedDocument,
} from "@/types/document";

export async function storeDocumentChunks(
  documentId: string,
  parsedDocument: ParsedDocument
) {
  const pages =
    preparePages(parsedDocument);

  const chunks =
    chunkPages(pages);

  await prisma.$transaction(async (tx) => {
    // Remove existing data so this operation
    // can safely be retried.
    await tx.documentChunk.deleteMany({
      where: {
        documentId,
      },
    });

    await tx.documentPage.deleteMany({
      where: {
        documentId,
      },
    });

    // Store pages
    const createdPages =
      await Promise.all(
        pages.map((page) =>
          tx.documentPage.create({
            data: {
              documentId,
              pageNumber:
                page.pageNumber,
              content:
                page.content,
            },
          })
        )
      );

    const pageMap =
      new Map(
        createdPages.map(
          (page) => [
            page.pageNumber,
            page.id,
          ]
        )
      );

    // Store chunks
    await tx.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId,

        pageId:
          pageMap.get(
            chunk.pageNumber
          ),

        pageNumber:
          chunk.pageNumber,

        chunkIndex:
          chunk.chunkIndex,

        content:
          chunk.content,

        tokenCount:
          estimateTokenCount(
            chunk.content
          ),
      })),
    });
  });

  return {
    pageCount: pages.length,
    chunkCount: chunks.length,
  };
}

function estimateTokenCount(
  text: string
) {
  // Rough estimate for now.
  // We'll replace this with an actual
  // tokenizer before embedding.
  return Math.ceil(
    text.length / 4
  );
}