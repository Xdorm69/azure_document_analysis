import type { DocumentStatus } from "@/types/document";

export type PipelineStageStatus = "pending" | "processing" | "completed" | "failed";

export type PipelineStage = {
  key: string;
  label: string;
  status: PipelineStageStatus;
};

/**
 * Every stage here is backed by a real, persisted signal — never a timer
 * or a guess:
 *  - "Uploaded" — the Document row exists (the file is already in Blob
 *    Storage by the time the row is created; see the upload route).
 *  - "Text Extraction" — DocumentChunk rows exist for this document
 *    (written right after Document Intelligence extraction completes).
 *  - "Search Indexing" — `document.indexedAt` is set, right after the
 *    chunks are pushed into Azure AI Search.
 *  - "AI Analysis" — a DocumentAnalysis row exists. The AI call produces
 *    the risk score in the same pass as the rest of the analysis, so
 *    there's no genuinely separate "risk assessment" step to report —
 *    presenting one wouldn't reflect anything the backend actually does.
 *  - "Complete" — `status === "ANALYZED"`.
 *
 * When `status === "FAILED"`, the first stage without a completion
 * signal is the one marked failed — that's as precise as we can honestly
 * be, since the pipeline only records success signals, not failure
 * locations.
 */
export function computePipelineStages(document: {
  status: DocumentStatus;
  hasChunks: boolean;
  indexedAt: Date | null;
  hasAnalysis: boolean;
}): PipelineStage[] {
  const { status, hasChunks, indexedAt, hasAnalysis } = document;

  const signals = [
    true, // uploaded: always true once the row exists
    hasChunks,
    indexedAt !== null,
    hasAnalysis,
    status === "ANALYZED",
  ];

  const labels = [
    "Uploaded",
    "Text Extraction",
    "Search Indexing",
    "AI Analysis",
    "Complete",
  ];
  const keys = ["upload", "extraction", "indexing", "analysis", "complete"];

  const firstIncompleteIndex = signals.findIndex((done) => !done);

  return labels.map((label, index) => {
    const done = signals[index];
    let stageStatus: PipelineStageStatus;

    if (done) {
      stageStatus = "completed";
    } else if (status === "FAILED" && index === firstIncompleteIndex) {
      stageStatus = "failed";
    } else if (status === "PROCESSING" && index === firstIncompleteIndex) {
      stageStatus = "processing";
    } else {
      stageStatus = "pending";
    }

    return { key: keys[index], label, status: stageStatus };
  });
}
