import { searchClient } from "@/lib/azure/search";
import { createEmbedding } from "../azure/embeddings";

export type RetrievedChunk = {
  id: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  score: number;
};

export async function retrieveChunks(
  documentId: string,
  question: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const embedding =
    await createEmbedding(question);

  const results = await searchClient.search(
    question,
    {
      filter: `documentId eq '${documentId}'`,

      vectorSearchOptions: {
        queries: [
          {
            kind: "vector",
            vector: embedding,
            fields: ["embedding"],
            kNearestNeighborsCount: topK,
          },
        ],
      },

      select: [
        "id",
        "content",
        "pageNumber",
        "chunkIndex",
      ],

      top: topK,
    }
  );

  const chunks: RetrievedChunk[] = [];

  for await (const result of results.results) {
    const document =
      result.document as {
        id: string;
        content: string;
        pageNumber: number;
        chunkIndex: number;
      };

    chunks.push({
      id: document.id,
      content: document.content,
      pageNumber: document.pageNumber,
      chunkIndex: document.chunkIndex,
      score: result.score ?? 0,
    });
  }

  return chunks;
}