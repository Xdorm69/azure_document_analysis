"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ProcessingPipeline } from "@/components/features/docuements/processing-pipeline";
import { computePipelineStages, type PipelineStage } from "@/lib/pipeline";
import { useDocumentPipelineStatusQuery } from "@/lib/queries/documents";

export function LivePipelineStatus({
  documentId,
  initialStages,
}: {
  documentId: string;
  initialStages: PipelineStage[];
}) {
  const router = useRouter();
  const { data } = useDocumentPipelineStatusQuery(documentId, true);

  const stages = data ? computePipelineStages(data) : initialStages;
  const isComplete = stages.every((stage) => stage.status === "completed");

  useEffect(() => {
    if (isComplete) {
      // The document detail page renders a completely different layout
      // once analysis finishes (DocumentWorkspaceSplit instead of the
      // pipeline card) — that comes from server data, so hand off to a
      // full refresh rather than trying to render it from here.
      router.refresh();
    }
  }, [isComplete, router]);

  return <ProcessingPipeline stages={stages} />;
}
