import { openai } from "@/lib/azure/openai";

export async function createEmbedding(
  text: string
) {
  const response =
    await openai.embeddings.create({
      model:
        process.env
          .AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,

      input: text,
    });

  return response.data[0].embedding;
}