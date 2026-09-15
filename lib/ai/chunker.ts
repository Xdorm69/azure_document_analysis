export type ChunkInput = {
  pageNumber: number;
  content: string;
};

export type ChunkOutput = {
  pageNumber: number;
  content: string;
  chunkIndex: number;
};

const MAX_CHARS = 3000;
const OVERLAP_CHARS = 300;

export function chunkPages(
  pages: ChunkInput[]
): ChunkOutput[] {
  const chunks: ChunkOutput[] = [];

  let chunkIndex = 0;

  for (const page of pages) {
    const text = page.content.trim();

    if (!text) continue;

    let start = 0;

    while (start < text.length) {
      let end =
        start + MAX_CHARS;

      if (end < text.length) {
        const paragraphBreak =
          text.lastIndexOf(
            "\n\n",
            end
          );

        if (
          paragraphBreak > start
        ) {
          end = paragraphBreak;
        }
      } else {
        end = text.length;
      }

      const content =
        text.slice(start, end).trim();

      if (content) {
        chunks.push({
          pageNumber:
            page.pageNumber,

          content,

          chunkIndex,
        });

        chunkIndex++;
      }

      if (end >= text.length) {
        break;
      }

      start =
        Math.max(
          end - OVERLAP_CHARS,
          start + 1
        );
    }
  }

  return chunks;
}