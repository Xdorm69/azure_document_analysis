import OpenAI from "openai";

export const openai =
  new OpenAI({
    baseURL:
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/v1`,

    apiKey:
      process.env.AZURE_OPENAI_API_KEY!,
  });