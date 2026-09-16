import { FileStackIcon } from "lucide-react";

import { DocumentCard } from "@/components/features/docuements/document-card";
import type { DocumentSummary } from "@/types/document";

export function DocumentList({
  documents,
  isLoading,
  error,
}: {
  documents: DocumentSummary[];
  isLoading: boolean;
  error: string | null;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
        <FileStackIcon className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">No documents yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a file above to run your first analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
}
