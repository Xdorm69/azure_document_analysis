"use client";

import { useEffect, useRef } from "react";

import { useDocumentsQuery } from "@/lib/queries/documents";
import { useToast } from "@/components/ui/toast";

const ACTIVE = new Set(["UPLOADED", "PROCESSING"]);

/**
 * Mounted once in the dashboard layout (so it survives navigation
 * between the document library and a document's detail page) — not per
 * upload. It rides the same `useDocumentsQuery` polling every other part
 * of the dashboard already uses, diffs statuses between polls, and
 * raises a toast the moment a document leaves an active state. This is
 * the "you get notified when it finishes" behavior without a
 * notification service — the browser tab just has to still be open.
 */
export function DocumentStatusWatcher() {
  const { data: documents } = useDocumentsQuery();
  const notify = useToast();
  const previousStatuses = useRef<Map<string, string>>(new Map());
  const hasSeenFirstLoad = useRef(false);

  useEffect(() => {
    if (!documents) return;

    // Don't fire notifications for the very first snapshot on page
    // load — only for transitions observed while this tab is open.
    if (!hasSeenFirstLoad.current) {
      hasSeenFirstLoad.current = true;
      previousStatuses.current = new Map(documents.map((d) => [d.id, d.status]));
      return;
    }

    for (const doc of documents) {
      const previousStatus = previousStatuses.current.get(doc.id);

      if (previousStatus && ACTIVE.has(previousStatus) && doc.status !== previousStatus) {
        if (doc.status === "ANALYZED") {
          notify({
            title: "Analysis complete",
            description: doc.name,
            variant: "success",
          });
        } else if (doc.status === "FAILED") {
          notify({
            title: "Analysis failed",
            description: doc.name,
            variant: "error",
          });
        }
      }

      previousStatuses.current.set(doc.id, doc.status);
    }
  }, [documents, notify]);

  return null;
}
