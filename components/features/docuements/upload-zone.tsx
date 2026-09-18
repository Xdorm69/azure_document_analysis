"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircleIcon,
  FileIcon,
  LoaderCircleIcon,
  UploadCloudIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { validateDocument } from "@/lib/validations/document";
import { computePipelineStages } from "@/lib/pipeline";
import { LivePipelineStatus } from "@/components/features/docuements/live-pipeline-status";
import { useToast } from "@/components/ui/toast";
import { useUploadDocumentMutation } from "@/lib/queries/documents";

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg";

type SelectState = "idle" | "uploading" | "error";

const PLACEHOLDER_STAGES = computePipelineStages({
  status: "PROCESSING",
  hasChunks: false,
  indexedAt: null,
  hasAnalysis: false,
});

type InFlightDocument = { id: string; name: string };

/**
 * Uploading only stores the file and hands it off — analysis runs in the
 * background on the server (see `app/api/documents/upload/route.ts`), so
 * this component doesn't block on it. The dropzone is free again as soon
 * as the upload itself finishes, so multiple documents can be queued
 * back to back; each shows its own live pipeline here until it
 * completes, and completion/failure are also announced as a toast (via
 * `DocumentStatusWatcher`) so you don't have to keep watching this card.
 */
export function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<SelectState>("idle");
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [inFlight, setInFlight] = useState<InFlightDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocumentMutation();
  const notify = useToast();

  const reset = useCallback(() => {
    setFile(null);
    setState("idle");
    setMessage("");
    setUploadProgress(0);
  }, []);

  function selectFile(nextFile: File | null) {
    if (nextFile) {
      try {
        validateDocument(nextFile);
      } catch (error) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "Invalid file");
        setFile(nextFile);
        return;
      }
    }

    setFile(nextFile);
    setState("idle");
    setMessage("");
  }

  async function handleUpload() {
    if (!file) return;

    setState("uploading");
    setMessage("");
    setUploadProgress(0);

    try {
      const uploadData = await uploadMutation.mutateAsync({
        file,
        onProgress: setUploadProgress,
      });

      // Analysis is already queued server-side by the time this
      // resolves — free the dropzone immediately instead of waiting.
      setInFlight((current) => [
        ...current,
        { id: uploadData.document.id, name: uploadData.document.name },
      ]);
      notify({
        title: "Queued for analysis",
        description: uploadData.document.name,
        variant: "info",
      });
      reset();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  function removeInFlight(id: string) {
    setInFlight((current) => current.filter((doc) => doc.id !== id));
  }

  const isBusy = state === "uploading";

  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (isBusy) return;
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) selectFile(dropped);
        }}
        onClick={() => !isBusy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center transition-colors ${
          isBusy
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-muted/50"
        } ${isDragging ? "border-primary bg-muted/50" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          disabled={isBusy}
          onChange={(event) =>
            selectFile(event.target.files?.[0] ?? null)
          }
        />

        {file ? (
          <>
            <FileIcon className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(file.size)}
            </p>
          </>
        ) : (
          <>
            <UploadCloudIcon className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop a document here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, PNG, or JPEG — up to 20MB. You can keep uploading while
              earlier documents are still being analyzed.
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleUpload} disabled={!file || isBusy}>
          {isBusy && <LoaderCircleIcon className="animate-spin" />}
          {isBusy ? "Uploading..." : "Upload"}
        </Button>

        {file && !isBusy && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear
          </Button>
        )}
      </div>

      {state === "uploading" && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={uploadProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {state === "error" && message && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          {message}
        </p>
      )}

      {inFlight.length > 0 && (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            Processing ({inFlight.length})
          </p>
          {inFlight.map((doc) => (
            <div key={doc.id} className="space-y-2">
              <p className="truncate text-sm font-medium">{doc.name}</p>
              <LivePipelineStatus
                documentId={doc.id}
                initialStages={PLACEHOLDER_STAGES}
                onComplete={() => removeInFlight(doc.id)}
                onFailed={() => removeInFlight(doc.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}