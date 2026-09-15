import type { RetrievedChunk } from "./rag";

export function buildRagPrompt(question: string, chunks: RetrievedChunk[]) {
  const context = chunks
    .map(
      (chunk, index) => `
SOURCE ${index + 1}

Chunk ID: ${chunk.id}
Page: ${chunk.pageNumber}
Chunk: ${chunk.chunkIndex}

Content:
${chunk.content}
`,
    )
    .join("\n--------------------\n");

  return `
You are an AI document analyst.

Answer the user's question using ONLY the
provided document sources.

Rules:

1. Do not use outside knowledge.
2. Do not invent facts.
3. If the answer cannot be determined from
   the sources, say:
   "I couldn't find enough information in
   the document to answer that."
4. Cite every important factual claim.
5. Use [Page X] citations.
6. If multiple pages support a statement,
   cite all relevant pages.
7. Distinguish clearly between facts stated
   in the document and reasonable interpretation.
8. Keep the answer concise but useful.

DOCUMENT SOURCES:

${context}

USER QUESTION:

${question}
`;
}
