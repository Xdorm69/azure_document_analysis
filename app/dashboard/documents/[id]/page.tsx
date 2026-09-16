import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeftIcon, FileImageIcon, FileTextIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { DocumentStatusBadge } from "@/components/features/docuements/document-status-badge";
import { AnalysisPanel } from "@/components/features/docuements/analysis-panel";
import { ExtractedTextPanel } from "@/components/features/docuements/extracted-text-panel";
import { ChunkList } from "@/components/features/docuements/chunk-list";
import { RetryAnalysisButton } from "@/components/features/docuements/retry-analysis-button";
import { AutoRefresh } from "@/components/features/docuements/auto-refresh";
import { DocumentChat } from "@/components/features/docuements/document-chat";
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

  const isImage = document.mimeType.startsWith("image/");
  const Icon = isImage ? FileImageIcon : FileTextIcon;
  const isAnalyzed = document.status === "ANALYZED";

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
        <Card>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">
              Analysis failed for this document. You can try running it
              again.
            </p>
            <RetryAnalysisButton documentId={document.id} />
          </CardContent>
        </Card>
      )}

      {(document.status === "UPLOADED" || document.status === "PROCESSING") && (
        <>
          <AutoRefresh />
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {document.status === "PROCESSING"
                ? "Analysis is running — this page will update automatically once it's done."
                : "This document is queued for analysis."}
            </CardContent>
          </Card>
        </>
      )}

      {isAnalyzed && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* Left: analysis, extracted text, chunks */}
          <div className="min-w-0 space-y-6">
            <AnalysisPanel analysis={document.analysis} />

            {document.extractedText && (
              <ExtractedTextPanel text={document.extractedText} />
            )}

            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Chunks ({chunks.length})
              </h2>
              <ChunkList chunks={chunks} />
            </div>
          </div>

          {/* Right: chat, pinned alongside the content on large screens */}
          <Card
            className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden p-0 lg:sticky lg:top-8"
          >
            <CardContent className="flex-1 overflow-hidden p-0">
              <DocumentChat documentId={document.id} />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
