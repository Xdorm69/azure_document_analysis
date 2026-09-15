"use client";

import { useState } from "react";

export function UploadZone() {
  const [file, setFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const uploadResponse =
        await fetch(
          "/api/documents/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.error
        );
      }

      const documentId =
        uploadData.document.id;

      setUploading(false);
      setAnalyzing(true);

      setMessage(
        "Document uploaded. Analyzing..."
      );

      const analysisResponse =
        await fetch(
          `/api/documents/${documentId}/analyze`,
          {
            method: "POST",
          }
        );

      const analysisData =
        await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(
          analysisData.error
        );
      }

      setAnalyzing(false);

      setMessage(
        `Analysis complete — ${analysisData.document.pageCount} pages processed.`
      );

      setFile(null);
    } catch (error) {
      setUploading(false);
      setAnalyzing(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    }
  }

  return (
    <div className="space-y-4 rounded-xl border p-6">

      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(event) =>
          setFile(
            event.target.files?.[0] ?? null
          )
        }
      />

      {file && (
        <div className="text-sm">
          Selected: {file.name}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={
          !file ||
          uploading ||
          analyzing
        }
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {uploading
          ? "Uploading..."
          : analyzing
            ? "Analyzing..."
            : "Upload & Analyze"}
      </button>

      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}
    </div>
  );
}