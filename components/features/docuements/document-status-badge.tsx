import { cn } from "cn";
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  LoaderCircleIcon,
  XCircleIcon,
} from "lucide-react";

import type { DocumentStatus } from "@/types/document";

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; className: string; icon: React.ElementType; spin?: boolean }
> = {
  UPLOADED: {
    label: "Queued",
    className: "bg-muted text-muted-foreground",
    icon: CircleDashedIcon,
  },
  PROCESSING: {
    label: "Analyzing",
    className: "bg-accent text-accent-foreground",
    icon: LoaderCircleIcon,
    spin: true,
  },
  ANALYZED: {
    label: "Analyzed",
    className: "bg-primary/10 text-primary",
    icon: CheckCircle2Icon,
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
    icon: XCircleIcon,
  },
};

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: DocumentStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className={cn("size-3.5", config.spin && "animate-spin")} />
      {config.label}
    </span>
  );
}
