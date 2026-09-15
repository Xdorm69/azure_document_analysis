"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RetryAnalysisButton({ documentId }: { documentId: string }) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRetry() {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/analyze`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Analysis failed"
      );
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={handleRetry} disabled={isRetrying}>
        {isRetrying ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          <RotateCwIcon />
        )}
        {isRetrying ? "Retrying..." : "Retry analysis"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
