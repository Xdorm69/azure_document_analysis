import {z} from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg"
]

export function validateDocument(file: File) {
    if (!file) throw new Error("No file provided");

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            "File must be smaller than 20MB"
        )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
            "Only PDF, PNG and JPEG files are supported"
        );
    }
}