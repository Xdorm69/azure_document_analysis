import Link from "next/link";
import { FileImageIcon, FileTextIcon } from "lucide-react";
import { cn } from "cn";

import { Card, CardContent } from "@/components/ui/card";
import { DocumentStatusBadge } from "@/components/features/docuements/document-status-badge";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { labelForMimeType } from "@/lib/mime-labels";
import { riskScoreLabel, RISK_TONE_CLASSES } from "@/lib/analysis-view";
import type { DocumentSummary } from "@/types/document";

function RiskBadge({ score }: { score: number }) {
  const { label, tone } = riskScoreLabel(score);
  const toneClasses = RISK_TONE_CLASSES[tone];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        toneClasses.bg,
        toneClasses.text
      )}
    >
      {label.replace(" RISK", "")} · {score}
    </span>
  );
}

export function DocumentCard({ document }: { document: DocumentSummary }) {
  const isImage = document.mimeType.startsWith("image/");
  const Icon = isImage ? FileImageIcon : FileTextIcon;

  return (
    <Link href={`/dashboard/documents/${document.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex flex-row items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{document.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {labelForMimeType(document.mimeType)}
              {" · "}
              {formatBytes(document.size)}
              {document.pageCount ? ` · ${document.pageCount} pages` : ""}
              {" · "}
              {formatRelativeTime(document.createdAt)}
            </p>
          </div>

          {document.riskScore !== null && (
            <RiskBadge score={document.riskScore} />
          )}

          <DocumentStatusBadge status={document.status} className="shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
