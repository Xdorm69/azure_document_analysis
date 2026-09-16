const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/tiff": "TIFF",
};

export function labelForMimeType(mimeType: string): string {
  return (
    MIME_LABELS[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? mimeType
  );
}
