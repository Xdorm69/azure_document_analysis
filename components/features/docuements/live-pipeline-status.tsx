"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ProcessingPipeline } from "@/components/features/docuements/processing-pipeline";
import { computePipelineStages, type PipelineStage } from "@/lib/pipeline";
import { useDocumentPipelineStatusQuery } from "@/lib/queries/documents";

export function LivePipelineStatus({
  documentId,
  initialStages,
  onComplete,
  onFailed,
}: {
  documentId: string;
  initialStages: PipelineStage[];
  /** Called once, the moment every stage reports "completed". */
  onComplete?: () => void;
  /** Called once, the moment any stage reports "failed". */
  onFailed?: () => void;
}) {
  const router = useRouter();
  const { data } = useDocumentPipelineStatusQuery(documentId, true);

  const stages = data ? computePipelineStages(data) : initialStages;
  const isComplete = stages.every((stage) => stage.status === "completed");
  const hasFailed = stages.some((stage) => stage.status === "failed");

  useEffect(() => {
    if (isComplete) {
      onComplete?.();
      // The document detail page renders a completely different layout
      // once analysis finishes (DocumentWorkspaceSplit instead of the
      // pipeline card) — that comes from server data, so hand off to a
      // full refresh rather than trying to render it from here.
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per completion, not on every callback identity change
  }, [isComplete, router]);

  useEffect(() => {
    if (hasFailed) {
      onFailed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per failure, not on every callback identity change
  }, [hasFailed]);

  return <ProcessingPipeline stages={stages} />;
}