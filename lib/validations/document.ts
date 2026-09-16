import { z } from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
] as const;

/**
 * Validates the *metadata* of a `File` (zod has no native `File` schema, so
 * we check the plain fields it exposes). Used by both the upload API route
 * and the client upload zone so the same rules apply everywhere.
 */
export const documentFileMetadataSchema = z.object({
    name: z.string().min(1, "File name is required"),
    type: z.enum(ALLOWED_TYPES, {
        message: "Only PDF, PNG and JPEG files are supported",
    }),
    size: z
        .number()
        .positive("File is empty")
        .max(MAX_FILE_SIZE, "File must be smaller than 20MB"),
});

export function validateDocument(file: File) {
    if (!file) throw new Error("No file provided");

    const result = documentFileMetadataSchema.safeParse({
        name: file.name,
        type: file.type,
        size: file.size,
    });

    if (!result.success) {
        throw new Error(
            result.error.issues[0]?.message ?? "Invalid file"
        );
    }
}

/** Validates a route param that should be a Prisma `cuid()` id. */
export const documentIdParamSchema = z.object({
    id: z.string().min(1, "Document id is required"),
});