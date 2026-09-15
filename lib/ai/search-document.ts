import { searchClient } from "@/lib/azure/search";

import { createEmbedding } from "../azure/embeddings";

export async function searchDocument(documentId: string, question: string) {
  const embedding = await createEmbedding(question);

  const vectorQuery = {
    kind: "vector" as const,
    vector: embedding,
    kNearestNeighborsCount: 5,
    fields: ["embedding"] as const,
  };

  const results = await searchClient.search(question, {
    filter: `documentId eq '${documentId}'`,

    vectorSearchOptions: {
      queries: [vectorQuery],
    },

    select: ["id", "documentId", "content", "pageNumber", "chunkIndex"],

    top: 5,
  });

  const chunks = [];

  for await (const result of results.results) {
    chunks.push({
      score: result.score,

      id: result.document?.id,

      content: result.document?.content,

      pageNumber: result.document?.pageNumber,

      chunkIndex: result.document?.chunkIndex,
    });
  }

  return chunks;
}
