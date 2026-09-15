import {
  ParsedDocument,
  DocumentPage,
  DocumentTable,
  AzureDocumentResult,
} from "@/types/document";

export function normalizeDocument(
  result: AzureDocumentResult
): ParsedDocument {
  const pages: DocumentPage[] =
    (result.pages ?? []).map((page) => ({
      pageNumber: page.pageNumber,

      lines: (page.lines ?? []).map(
        (line) => ({
          content: line.content,
        })
      ),
    }));

  const tables: DocumentTable[] =
    (result.tables ?? []).map(
      (table) => ({
        rowCount: table.rowCount,
        columnCount: table.columnCount,

        cells: (table.cells ?? []).map(
          (cell) => ({
            rowIndex: cell.rowIndex,
            columnIndex: cell.columnIndex,
            content: cell.content,
          })
        ),
      })
    );

  const fullText = pages
    .map((page) =>
      page.lines
        .map((line) => line.content)
        .join("\n")
    )
    .join("\n\n");

  return {
    pageCount: pages.length,
    pages,
    tables,
    fullText,
  };
}