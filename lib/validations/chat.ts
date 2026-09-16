import { z } from "zod";

export const chatRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(2000, "Question is too long"),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

export const searchRequestSchema = chatRequestSchema;
export type SearchRequestInput = z.infer<typeof searchRequestSchema>;
