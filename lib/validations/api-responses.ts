import { z } from "zod";

/**
 * Schemas for parsing JSON returned by our own API routes. Used on the
 * client (mainly by the Tanstack Query hooks in `lib/queries`) so that a
 * shape change on the server surfaces as a clear error instead of a
 * silent `undefined` deep in a component.
 */

export const documentStatusSchema = z.enum([
  "UPLOADED",
  "PROCESSING",
  "ANALYZED",
  "FAILED",
]);

export const documentSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  status: documentStatusSchema,
  pageCount: z.number().nullable(),
  createdAt: z.coerce.date().transform((date) => date.toISOString()),
});

export const documentListResponseSchema = z.object({
  documents: z.array(documentSummarySchema),
});

export const documentChunkSummarySchema = z.object({
  id: z.string(),
  chunkIndex: z.number(),
  pageNumber: z.number().nullable(),
  content: z.string(),
  tokenCount: z.number().nullable(),
});

export const documentChunksResponseSchema = z.object({
  chunks: z.array(documentChunkSummarySchema),
});

export const uploadResponseSchema = z.object({
  success: z.literal(true),
  document: documentSummarySchema.pick({ id: true, name: true }).extend({
    id: z.string(),
  }),
});

export const analyzeResponseSchema = z.object({
  success: z.literal(true),
  document: z.object({
    id: z.string(),
    name: z.string(),
    pageCount: z.number().nullable().optional(),
  }),
});

export const citationSchema = z.object({
  chunkId: z.string(),
  pageNumber: z.number(),
  chunkIndex: z.number(),
  score: z.number(),
});

export const chatResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(citationSchema),
  retrievedChunks: z.array(
    z.object({
      id: z.string(),
      pageNumber: z.number().nullable(),
      score: z.number(),
    })
  ),
});

export const apiErrorSchema = z.object({
  error: z.string(),
});

export const onboardingResponseSchema = z.object({
  success: z.literal(true),
});
