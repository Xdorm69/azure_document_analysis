import { Card, CardContent } from "@/components/ui/card";
import type { DocumentChunkSummary } from "@/types/document";

export function ChunkList({ chunks }: { chunks: DocumentChunkSummary[] }) {
  if (chunks.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No chunks have been generated for this document yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-border">
        {chunks.map((chunk) => (
          <details key={chunk.id} className="group py-3 first:pt-0 last:pb-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm">
              <span className="font-medium">
                Chunk {chunk.chunkIndex + 1}
                {chunk.pageNumber ? ` · Page ${chunk.pageNumber}` : ""}
              </span>
              <span className="text-xs text-muted-foreground">
                {chunk.tokenCount ? `${chunk.tokenCount} tokens` : ""}
              </span>
            </summary>

            <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
              {chunk.content}
            </p>
          </details>
        ))}
      </CardContent>
    </Card>
  );
}
