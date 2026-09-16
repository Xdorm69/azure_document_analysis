"use client";

import { useRouter } from "next/navigation";
import { LoaderCircleIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAnalyzeDocumentMutation } from "@/lib/queries/documents";

export function RetryAnalysisButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const analyzeMutation = useAnalyzeDocumentMutation();

  async function handleRetry() {
    try {
      await analyzeMutation.mutateAsync(documentId);
      // The document detail page is a server component reading straight
      // from Prisma, so refresh it once the mutation (and its query
      // invalidation) has settled.
      router.refresh();
    } catch {
      // Error is surfaced below via analyzeMutation.error.
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRetry}
        disabled={analyzeMutation.isPending}
      >
        {analyzeMutation.isPending ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <RotateCwIcon />
        )}
        {analyzeMutation.isPending ? "Retrying..." : "Retry analysis"}
      </Button>
      {analyzeMutation.isError && (
        <p className="text-sm text-destructive">
          {analyzeMutation.error instanceof Error
            ? analyzeMutation.error.message
            : "Analysis failed"}
        </p>
      )}
    </div>
  );
}
