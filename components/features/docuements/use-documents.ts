"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentSummary } from "@/types/document";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/documents");

      if (!response.ok) {
        throw new Error("Failed to load documents");
      }

      const data = await response.json();
      setDocuments(data.documents);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load documents"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount: `refresh` sets loading/error/data state
    // as part of loading the initial list, not in response to a prop change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const hasActiveWork = documents.some(
    (document) =>
      document.status === "UPLOADED" || document.status === "PROCESSING"
  );

  useEffect(() => {
    if (!hasActiveWork) return;

    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [hasActiveWork, refresh]);

  return { documents, isLoading, error, refresh };
}
