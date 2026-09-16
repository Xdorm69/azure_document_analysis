import { FileTextIcon, ListChecksIcon, SearchIcon, TriangleAlertIcon } from "lucide-react";

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold tabular-nums leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function DocumentStatsRow({
  pageCount,
  chunkCount,
  findingsCount,
  risksCount,
}: {
  pageCount: number | null;
  chunkCount: number;
  findingsCount: number;
  risksCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
      <StatItem
        icon={FileTextIcon}
        value={pageCount ?? "—"}
        label={pageCount === 1 ? "Page" : "Pages"}
      />
      <StatItem
        icon={SearchIcon}
        value={chunkCount}
        label="Chunks Indexed"
      />
      <StatItem
        icon={ListChecksIcon}
        value={findingsCount}
        label={findingsCount === 1 ? "Key Finding" : "Key Findings"}
      />
      <StatItem
        icon={TriangleAlertIcon}
        value={risksCount}
        label={risksCount === 1 ? "Risk Flagged" : "Risks Flagged"}
      />
    </div>
  );
}
