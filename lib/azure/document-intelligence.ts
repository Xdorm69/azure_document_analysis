import DocumentIntelligence from "@azure-rest/ai-document-intelligence";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint =
  process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT!;

if (!endpoint) throw new Error("No Document Intelligence Endpoint");

const key =
  process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY!;

if (!key) throw new Error("No Document Intelligence Key");

export const documentIntelligenceClient =
  DocumentIntelligence(
    endpoint,
    new AzureKeyCredential(key)
  );