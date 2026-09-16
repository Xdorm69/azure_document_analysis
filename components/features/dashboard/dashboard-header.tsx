"use client";

import { UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DashboardHeader({ userName }: { userName?: string | null }) {
  const greeting = userName ? `Welcome back, ${userName}` : "Welcome back";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Dilligence
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your documents.
        </p>
      </div>

      <Button
        size="lg"
        onClick={() =>
          document
            .getElementById("upload-zone")
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      >
        <UploadIcon className="size-4" />
        Upload Document
      </Button>
    </div>
  );
}
