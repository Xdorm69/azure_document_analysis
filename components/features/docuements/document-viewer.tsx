"use client";

import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDocumentFileUrlQuery } from "@/lib/queries/documents";

/**
 * Renders the original file inline. For PDFs this uses the browser's own
 * PDF viewer (via `<iframe>`), which supports jumping to a given page
 * through the standard `#page=N` URL fragment — a real capability, not a
 * simulated one. There's no text layer we control, so we can navigate to
 * a page but can't highlight a specific clause within it; that would need
 * a PDF.js-based renderer, which is a reasonable next step but out of
 * scope for this pass.
 */
export function DocumentViewer({
  documentId,
  mimeType,
  activePage,
}: {
  documentId: string;
  mimeType: string;
  activePage: number | null;
}) {
  const { data, isLoading, error, refetch, isRefetching } =
    useDocumentFileUrlQuery(documentId);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-border bg-muted/30">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading document…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/30 text-center">
        <AlertCircleIcon className="size-6 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Couldn&apos;t load the document</p>
          <p className="text-xs text-muted-foreground">
            The preview link may have expired.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCwIcon className={isRefetching ? "size-3.5 animate-spin" : "size-3.5"} />
          Retry
        </Button>
      </div>
    );
  }

  const isImage = mimeType.startsWith("image/");
  const src = isImage
    ? data.url
    : activePage
      ? `${data.url}#page=${activePage}`
      : data.url;

  if (isImage) {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-auto rounded-xl border border-border bg-muted/30 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- external SAS-signed blob URL, not a local/static asset */}
        <img
          src={data.url}
          alt="Document preview"
          className="max-h-full max-w-full rounded-md object-contain shadow-sm"
        />
      </div>
    );
  }

  return (
    <iframe
      key={src}
      src={src}
      title="Document preview"
      className="h-full w-full rounded-xl border border-border bg-muted/30"
    />
  );
}
