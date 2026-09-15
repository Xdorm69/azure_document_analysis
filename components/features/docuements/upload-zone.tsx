"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FileIcon,
  LoaderCircleIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg";

type UploadState = "idle" | "uploading" | "analyzing" | "done" | "error";

export function UploadZone({ onUploaded }: { onUploaded?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setState("idle");
    setMessage("");
  }, []);

  function selectFile(nextFile: File | null) {
    setFile(nextFile);
    setState("idle");
    setMessage("");
  }

  async function handleUpload() {
    if (!file) return;

    setState("uploading");
    setMessage("Uploading document...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error ?? "Upload failed");
      }

      const documentId = uploadData.document.id;

      setState("analyzing");
      setMessage("Document uploaded. Running analysis...");
      onUploaded?.();

      const analysisResponse = await fetch(
        `/api/documents/${documentId}/analyze`,
        { method: "POST" }
      );

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(analysisData.error ?? "Analysis failed");
      }

      setState("done");
      setMessage(
        `Analysis complete — ${analysisData.document.pageCount} page${
          analysisData.document.pageCount === 1 ? "" : "s"
        } processed.`
      );
      onUploaded?.();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
      onUploaded?.();
    }
  }

  const isBusy = state === "uploading" || state === "analyzing";

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
              PDF, PNG, or JPEG — up to 20MB
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleUpload}
          disabled={!file || isBusy || state === "done"}
        >
          {isBusy && <LoaderCircleIcon className="animate-spin" />}
          {state === "uploading"
            ? "Uploading..."
            : state === "analyzing"
              ? "Analyzing..."
              : "Upload & Analyze"}
        </Button>

        {file && !isBusy && (
          <Button variant="ghost" size="icon" onClick={reset}>
            <XIcon />
            <span className="sr-only">Clear selection</span>
          </Button>
        )}

        {state === "done" && (
          <Button variant="outline" onClick={reset}>
            Upload another
          </Button>
        )}
      </div>

      {message && (
        <p
          className={`flex items-center gap-1.5 text-sm ${
            state === "error" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {state === "error" && <AlertCircleIcon className="size-4 shrink-0" />}
          {state === "done" && (
            <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
          )}
          {message}
        </p>
      )}
    </div>
  );
}
