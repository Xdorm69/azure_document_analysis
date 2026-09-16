"use client";

import { SearchIcon } from "lucide-react";
import { cn } from "cn";

export type DocumentFilter =
  | "all"
  | "processing"
  | "analyzed"
  | "high-risk"
  | "medium-risk"
  | "low-risk";

const FILTERS: { value: DocumentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "analyzed", label: "Analyzed" },
  { value: "high-risk", label: "High Risk" },
  { value: "medium-risk", label: "Medium Risk" },
  { value: "low-risk", label: "Low Risk" },
];

export function DocumentLibraryToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filter: DocumentFilter;
  onFilterChange: (value: DocumentFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search documents…"
          className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring/50"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function applyDocumentFilter<
  T extends { status: string; riskScore: number | null; name: string },
>(documents: T[], search: string, filter: DocumentFilter): T[] {
  const query = search.trim().toLowerCase();

  return documents.filter((doc) => {
    if (query && !doc.name.toLowerCase().includes(query)) return false;

    switch (filter) {
      case "processing":
        return doc.status === "UPLOADED" || doc.status === "PROCESSING";
      case "analyzed":
        return doc.status === "ANALYZED";
      case "high-risk":
        return doc.riskScore !== null && doc.riskScore >= 67;
      case "medium-risk":
        return (
          doc.riskScore !== null && doc.riskScore >= 34 && doc.riskScore < 67
        );
      case "low-risk":
        return doc.riskScore !== null && doc.riskScore < 34;
      default:
        return true;
    }
  });
}
