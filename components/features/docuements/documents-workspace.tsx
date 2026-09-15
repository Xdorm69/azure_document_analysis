"use client";

import { UploadZone } from "@/components/features/docuements/upload-zone";
import { DocumentList } from "@/components/features/docuements/document-list";
import { useDocuments } from "@/components/features/docuements/use-documents";

export function DocumentsWorkspace() {
  const { documents, isLoading, error, refresh } = useDocuments();

  return (
    <div className="space-y-8">
      <UploadZone onUploaded={refresh} />

      <div>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          {documents.length > 0
            ? `${documents.length} document${documents.length === 1 ? "" : "s"}`
            : "Documents"}
        </h2>

        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
