import {
  SearchIndexClient,
  AzureKeyCredential,
  SearchIndex,
} from "@azure/search-documents";

const endpoint =
  process.env.AZURE_SEARCH_ENDPOINT!;

const apiKey =
  process.env.AZURE_SEARCH_API_KEY!;

const indexName =
  process.env.AZURE_SEARCH_INDEX!;

const client =
  new SearchIndexClient(
    endpoint,
    new AzureKeyCredential(apiKey)
  );

const index: SearchIndex = {
  name: indexName,

  fields: [
    {
      name: "id",
      type: "Edm.String",
      key: true,
      filterable: true,
    },

    {
      name: "documentId",
      type: "Edm.String",
      filterable: true,
    },

    {
      name: "content",
      type: "Edm.String",
      searchable: true,
    },

    {
      name: "pageNumber",
      type: "Edm.Int32",
      filterable: true,
    },

    {
      name: "chunkIndex",
      type: "Edm.Int32",
      filterable: true,
    },

    {
      name: "embedding",
      type: "Collection(Edm.Single)",
      searchable: true,

      vectorSearchDimensions: 1536,

      vectorSearchProfileName:
        "default-vector-profile",
    },
  ],

  vectorSearch: {
    algorithms: [
      {
        name: "default-hnsw",

        kind: "hnsw",

        parameters: {
          metric: "cosine",
        },
      },
    ],

    profiles: [
      {
        name: "default-vector-profile",

        algorithmConfigurationName:
          "default-hnsw",
      },
    ],
  },
};

export async function createSearchIndex() {
  await client.createOrUpdateIndex(index);

  console.log(
    `Search index '${indexName}' created`
  );
}