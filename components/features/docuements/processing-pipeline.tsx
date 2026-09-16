import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "cn";

import { Card, CardContent } from "@/components/ui/card";
import type { PipelineStage } from "@/lib/pipeline";

function StageIcon({ status }: { status: PipelineStage["status"] }) {
  if (status === "completed") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-chart-2 text-white">
        <CheckIcon className="size-3.5" />
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
        <XIcon className="size-3.5" />
      </div>
    );
  }
  if (status === "processing") {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary">
        <div className="size-2.5 animate-pulse rounded-full bg-primary" />
      </div>
    );
  }
  return (
    <div className="size-6 shrink-0 rounded-full border-2 border-muted-foreground/30" />
  );
}

export function ProcessingPipeline({ stages }: { stages: PipelineStage[] }) {
  return (
    <Card>
      <CardContent>
        <ol className="space-y-0">
          {stages.map((stage, index) => (
            <li key={stage.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StageIcon status={stage.status} />
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      "my-1 h-6 w-px",
                      stage.status === "completed"
                        ? "bg-chart-2"
                        : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>

              <div
                className={cn(
                  "pb-6 text-sm",
                  index === stages.length - 1 && "pb-0"
                )}
              >
                <p
                  className={cn(
                    "font-medium",
                    stage.status === "pending" && "text-muted-foreground",
                    stage.status === "failed" && "text-destructive"
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stage.status === "completed" && "Done"}
                  {stage.status === "processing" && "In progress…"}
                  {stage.status === "failed" && "Processing stopped here"}
                  {stage.status === "pending" && "Waiting"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
