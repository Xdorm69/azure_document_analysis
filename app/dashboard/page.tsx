import { UploadZone } from "@/components/features/docuements/upload-zone";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          AI Document Analyzer
        </h1>

        <p className="mt-2 text-muted-foreground">
          Upload documents and turn them into
          searchable knowledge.
        </p>
      </div>

      <UploadZone />
    </main>
  );
}