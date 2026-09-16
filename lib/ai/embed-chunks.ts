import { openai } from "@/lib/azure/openai";

const BATCH_SIZE = 50;

export async function createEmbeddings(
  texts: string[]
) {
  const embeddings: number[][] = [];

  for (
    let i = 0;
    i < texts.length;
    i += BATCH_SIZE
  ) {
    const batch =
      texts.slice(
        i,
        i + BATCH_SIZE
      );

    const response =
      await openai.embeddings.create({
        model:
          process.env
            .AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,

        input: batch,
      });

    embeddings.push(
      ...response.data.map(
        (item) => item.embedding
      )
    );
  }

  return embeddings;
}