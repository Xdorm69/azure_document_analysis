"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, fetchJson } from "@/lib/api-client";
import {
  analyzeResponseSchema,
  chatResponseSchema,
  documentChunksResponseSchema,
  documentListResponseSchema,
  uploadResponseSchema,
} from "@/lib/validations/api-responses";
import { chatRequestSchema } from "@/lib/validations/chat";
import type { DocumentSummary } from "@/types/document";

export const documentKeys = {
  all: ["documents"] as const,
  list: () => [...documentKeys.all, "list"] as const,
  detail: (id: string) => [...documentKeys.all, "detail", id] as const,
  chunks: (id: string) => [...documentKeys.all, id, "chunks"] as const,
};

const ACTIVE_STATUSES: DocumentSummary["status"][] = ["UPLOADED", "PROCESSING"];

/**
 * Lists the signed-in user's documents. Polls every 5s while any document
 * is still uploading/processing, mirroring the previous manual-interval
 * behaviour but driven by Tanstack Query's `refetchInterval`.
 */
export function useDocumentsQuery() {
  return useQuery({
    queryKey: documentKeys.list(),
    queryFn: () => fetchJson("/api/documents", documentListResponseSchema),
    select: (data) => data.documents,
    refetchInterval: (query) => {
      const documents = query.state.data?.documents ?? [];
      const hasActiveWork = documents.some((document) =>
        ACTIVE_STATUSES.includes(document.status)
      );
      return hasActiveWork ? 5000 : false;
    },
  });
}

export function useDocumentChunksQuery(documentId: string, enabled = true) {
  return useQuery({
    queryKey: documentKeys.chunks(documentId),
    queryFn: () =>
      fetchJson(
        `/api/documents/${documentId}/chunks`,
        documentChunksResponseSchema
      ),
    select: (data) => data.chunks,
    enabled,
  });
}

async function uploadDocumentRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      (data && typeof data.error === "string" && data.error) || "Upload failed",
      response.status
    );
  }

  return uploadResponseSchema.parse(data);
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocumentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list() });
    },
  });
}

export function useAnalyzeDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      fetchJson(
        `/api/documents/${documentId}/analyze`,
        analyzeResponseSchema,
        { method: "POST" }
      ),
    onSettled: (_data, _error, documentId) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list() });
      queryClient.invalidateQueries({
        queryKey: documentKeys.chunks(documentId),
      });
    },
  });
}

export function useDocumentChatMutation(documentId: string) {
  return useMutation({
    mutationFn: (question: string) => {
      const body = chatRequestSchema.parse({ question });
      return fetchJson(
        `/api/documents/${documentId}/chat`,
        chatResponseSchema,
        { method: "POST", body }
      );
    },
  });
}
