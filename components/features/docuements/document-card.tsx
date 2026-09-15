import Link from "next/link";
import { FileImageIcon, FileTextIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { DocumentStatusBadge } from "@/components/features/docuements/document-status-badge";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import type { DocumentSummary } from "@/types/document";

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
              {formatBytes(document.size)}
              {document.pageCount ? ` · ${document.pageCount} pages` : ""}
              {" · "}
              {formatRelativeTime(document.createdAt)}
            </p>
          </div>

          <DocumentStatusBadge status={document.status} className="shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
