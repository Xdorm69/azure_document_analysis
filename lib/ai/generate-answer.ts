import { openai } from "@/lib/azure/openai";

import {
  buildRagPrompt,
} from "./prompt";

import type {
  RetrievedChunk,
} from "./rag";

export async function generateAnswer(
  question: string,
  chunks: RetrievedChunk[]
) {
  if (chunks.length === 0) {
    return {
      answer:
        "I couldn't find enough information in the document to answer that.",
      citations: [],
    };
  }

  const prompt =
    buildRagPrompt(
      question,
      chunks
    );

  const response =
    await openai.responses.create({
      model:
        process.env.AZURE_OPENAI_DEPLOYMENT!,

      input: prompt,

      temperature: 0.1,
    });

  const answer =
    response.output_text;

  const citations =
    chunks.map((chunk) => ({
      chunkId: chunk.id,
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
    }));

  return {
    answer,
    citations,
  };
}