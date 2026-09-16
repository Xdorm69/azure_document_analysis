"use client";

import { useState } from "react";

import { UploadZone } from "@/components/features/docuements/upload-zone";
import { DocumentList } from "@/components/features/docuements/document-list";
import {
  DocumentLibraryToolbar,
  applyDocumentFilter,
  type DocumentFilter,
} from "@/components/features/docuements/document-library-toolbar";
import { useDocumentsQuery } from "@/lib/queries/documents";

export function DocumentsWorkspace() {
  const { data: documents = [], isLoading, error } = useDocumentsQuery();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DocumentFilter>("all");

  const filteredDocuments = applyDocumentFilter(documents, search, filter);
  const isFiltered = search.trim() !== "" || filter !== "all";

  return (
    <div className="space-y-8">
      <UploadZone />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {documents.length > 0
              ? `${filteredDocuments.length} of ${documents.length} document${documents.length === 1 ? "" : "s"}`
              : "Documents"}
          </h2>
        </div>

        {documents.length > 0 && (
          <DocumentLibraryToolbar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
          />
        )}

        <DocumentList
          documents={filteredDocuments}
          isLoading={isLoading}
          error={error instanceof Error ? error.message : null}
          isFiltered={isFiltered}
        />
      </div>
    </div>
  );
}
