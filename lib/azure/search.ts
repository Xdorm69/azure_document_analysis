import {
  SearchClient,
  SearchIndexClient,
  AzureKeyCredential,
} from "@azure/search-documents";

export type SearchDocument = {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number;
  chunkIndex: number;
  embedding: number[];
};

const endpoint =
  process.env.AZURE_SEARCH_ENDPOINT!;

if (!endpoint) throw new Error("No Search Endpoint");

const apiKey =
  process.env.AZURE_SEARCH_API_KEY!;

if (!apiKey) throw new Error("No Search API Key");

const indexName =
  process.env.AZURE_SEARCH_INDEX!;

if (!indexName) throw new Error("No Search Index Name");

const credential =
  new AzureKeyCredential(apiKey);

export const searchIndexClient =
  new SearchIndexClient(
    endpoint,
    credential
  );

export const searchClient =
  new SearchClient<SearchDocument>(
    endpoint,
    indexName,
    credential
  );