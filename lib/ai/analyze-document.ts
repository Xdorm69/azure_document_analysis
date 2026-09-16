import { openai } from "@/lib/azure/openai";

import type {
  RetrievedChunk,
} from "./rag";

import type {
  DocumentAnalysisResult,
} from "@/types/analysis";
import { validateAnalysis } from "../validations/analysis";

function buildAnalysisPrompt(
  chunks: RetrievedChunk[]
) {
  const context = chunks
    .map(
      (chunk, index) => `
SOURCE ${index + 1}

Page: ${chunk.pageNumber}
Chunk ID: ${chunk.id}

${chunk.content}
`
    )
    .join("\n----------------------\n");

  return `
You are a professional document analysis engine.

Analyze the provided document sources.

IMPORTANT:
Use ONLY information contained in the sources.

Do not invent facts.

If something is not present in the sources,
do not infer it as a fact.

Return a JSON object matching this exact
structure:

{
  "summary": "string",

  "riskScore": 0,

  "keyFindings": [
    {
      "title": "string",
      "description": "string",
      "importance": "low | medium | high",
      "pages": [1]
    }
  ],

  "risks": [
    {
      "title": "string",
      "description": "string",
      "severity": "low | medium | high",
      "pages": [1]
    }
  ],

  "entities": [
    {
      "name": "string",
      "type": "person | organization | location | product | other"
    }
  ],

  "importantDates": [
    {
      "date": "string",
      "description": "string",
      "pages": [1]
    }
  ],

  "importantNumbers": [
    {
      "value": "string",
      "description": "string",
      "pages": [1]
    }
  ],

  "actionItems": [
    {
      "action": "string",
      "priority": "low | medium | high",
      "pages": [1]
    }
  ]
}

Risk score must be an integer from 0 to 100.

Do not use markdown.

DOCUMENT SOURCES:

${context}
`;
}

export async function analyzeDocumentWithAI(
  chunks: RetrievedChunk[]
): Promise<DocumentAnalysisResult> {
  const prompt =
    buildAnalysisPrompt(chunks);

  const response =
    await openai.responses.create({
      model:
        process.env
          .AZURE_OPENAI_DEPLOYMENT!,

      input: prompt,

      temperature: 0.1,
    });

  const raw =
    response.output_text.trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "Azure OpenAI returned invalid JSON"
    );
  }

  return validateAnalysis(
    parsed
  );
}