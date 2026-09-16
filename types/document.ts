export type DocumentStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "ANALYZED"
  | "FAILED";

export type DocumentSummary = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  pageCount: number | null;
  createdAt: string;
  riskScore: number | null;
};

export type DocumentChunkSummary = {
  id: string;
  chunkIndex: number;
  pageNumber: number | null;
  content: string;
  tokenCount: number | null;
};

export type DocumentLine = {
  content: string;
};

export type DocumentPage = {
  pageNumber: number;
  lines: DocumentLine[];
};

export type DocumentTable = {
  pageNumber?: number;
  rowCount: number;
  columnCount: number;
  cells: {
    rowIndex: number;
    columnIndex: number;
    content: string;
  }[];
};

export type ParsedDocument = {
  pageCount: number;
  pages: DocumentPage[];
  tables: DocumentTable[];
  fullText: string;
};

export type AzureDocumentResult = {
  pages?: AzurePage[];
  tables?: AzureTable[];
};

type AzurePage = {
  pageNumber: number;
  lines?: AzureLine[];
};

type AzureLine = {
  content: string;
};

type AzureTable = {
  rowCount: number;
  columnCount: number;
  cells?: AzureCell[];
};

type AzureCell = {
  rowIndex: number;
  columnIndex: number;
  content: string;
};
