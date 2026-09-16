"use client";

import { UploadZone } from "@/components/features/docuements/upload-zone";
import { DocumentList } from "@/components/features/docuements/document-list";
import { useDocumentsQuery } from "@/lib/queries/documents";

export function DocumentsWorkspace() {
  const { data: documents = [], isLoading, error } = useDocumentsQuery();

  return (
    <div className="space-y-8">
      <UploadZone />

      <div>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          {documents.length > 0
            ? `${documents.length} document${documents.length === 1 ? "" : "s"}`
            : "Documents"}
        </h2>

        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={error instanceof Error ? error.message : null}
        />
      </div>
    </div>
  );
}
