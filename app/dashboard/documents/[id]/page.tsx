import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeftIcon, FileImageIcon, FileTextIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { DocumentStatusBadge } from "@/components/features/docuements/document-status-badge";
import { DocumentWorkspaceSplit } from "@/components/features/docuements/document-workspace-split";
import { RetryAnalysisButton } from "@/components/features/docuements/retry-analysis-button";
import { LivePipelineStatus } from "@/components/features/docuements/live-pipeline-status";
import { computePipelineStages } from "@/lib/pipeline";
import { Card, CardContent } from "@/components/ui/card";

export default async function DocumentDetailPage(
  props: PageProps<"/dashboard/documents/[id]">
) {
  const { id } = await props.params;

  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/");
  }

  const owner = await prisma.user.findUnique({ where: { clerkId } });
  if (!owner) {
    redirect("/onboard");
  }

  const document = await prisma.document.findFirst({
    where: { id, userId: owner.id },
    include: { analysis: true },
  });

  if (!document) {
    notFound();
  }

  const chunks =
    document.status === "ANALYZED"
      ? await prisma.documentChunk.findMany({
          where: { documentId: id },
          orderBy: { chunkIndex: "asc" },
          select: {
            id: true,
            chunkIndex: true,
            pageNumber: true,
            content: true,
            tokenCount: true,
          },
        })
      : [];

  const chunkCount =
    document.status === "ANALYZED"
      ? chunks.length
      : await prisma.documentChunk.count({ where: { documentId: id } });

  const isImage = document.mimeType.startsWith("image/");
  const Icon = isImage ? FileImageIcon : FileTextIcon;
  const isAnalyzed = document.status === "ANALYZED";

  const pipelineStages = computePipelineStages({
    status: document.status,
    hasChunks: chunkCount > 0,
    indexedAt: document.indexedAt,
    hasAnalysis: document.analysis !== null,
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to documents
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold">{document.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatBytes(document.size)}
            {document.pageCount ? ` · ${document.pageCount} pages` : ""}
            {" · uploaded "}
            {formatRelativeTime(document.createdAt)}
          </p>
        </div>

        <DocumentStatusBadge status={document.status} className="shrink-0" />
      </div>

      {document.status === "FAILED" && (
        <div className="space-y-4">
          <LivePipelineStatus documentId={document.id} initialStages={pipelineStages} />
          <Card>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-sm text-destructive">
                Analysis failed for this document. You can try running it
                again.
              </p>
              <RetryAnalysisButton documentId={document.id} />
            </CardContent>
          </Card>
        </div>
      )}

      {(document.status === "UPLOADED" || document.status === "PROCESSING") && (
        <LivePipelineStatus documentId={document.id} initialStages={pipelineStages} />
      )}

      {isAnalyzed && (
        <DocumentWorkspaceSplit
          documentId={document.id}
          mimeType={document.mimeType}
          analysis={document.analysis}
          pageCount={document.pageCount}
          chunkCount={chunkCount}
          chunks={chunks}
          extractedText={document.extractedText}
        />
      )}
    </main>
  );
}
