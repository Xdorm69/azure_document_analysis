import type {
  ParsedDocument,
} from "@/types/document";

export function preparePages(
  document: ParsedDocument
) {
  return document.pages.map(
    (page) => ({
      pageNumber:
        page.pageNumber,

      content:
        page.lines
          .map(
            (line) => line.content
          )
          .join("\n")
          .trim(),
    })
  );
}