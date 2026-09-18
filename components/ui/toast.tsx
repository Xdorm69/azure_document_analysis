"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2Icon, AlertCircleIcon, XIcon } from "lucide-react";
import { cn } from "cn";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type NotifyInput = Omit<Toast, "id">;

const ToastContext = createContext<((toast: NotifyInput) => void) | null>(null);

/**
 * App-wide, in-app notification — no email/push infra, just a fixed
 * stack rendered from React state. This is what backs "you get notified
 * when it finishes" for the lightweight, no-new-infra approach.
 */
export function useToast() {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used within <ToastProvider>");
  return notify;
}

const VARIANT_ICON: Record<ToastVariant, typeof CheckCircle2Icon> = {
  success: CheckCircle2Icon,
  error: AlertCircleIcon,
  info: CheckCircle2Icon,
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-chart-2/30 text-foreground",
  error: "border-destructive/30 text-foreground",
  info: "border-border text-foreground",
};

const VARIANT_ICON_CLASSES: Record<ToastVariant, string> = {
  success: "text-chart-2",
  error: "text-destructive",
  info: "text-primary",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const notify = useCallback((input: NotifyInput) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...input, id }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  function dismiss(id: number) {
    setToasts((current) => current.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={notify}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = VARIANT_ICON[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "animate-fade-in-up pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-card p-3.5 shadow-md ring-1 ring-foreground/5",
                VARIANT_CLASSES[toast.variant]
              )}
            >
              <Icon
                className={cn("mt-0.5 size-4 shrink-0", VARIANT_ICON_CLASSES[toast.variant])}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
