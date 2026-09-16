"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { AlertCircleIcon, SendIcon, SparklesIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { useDocumentChatMutation } from "@/lib/queries/documents";
import { buildSuggestedQuestions } from "@/lib/chat-suggestions";
import { parseEntities, parseKeyFindings, parseRisks } from "@/lib/analysis-view";

type Citation = {
  chunkId: string;
  pageNumber: number;
  chunkIndex: number;
  score: number;
};

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; citations: Citation[] }
  | { role: "error"; content: string };

type AnalysisData = {
  summary: string | null;
  keyFindings: unknown;
  risks: unknown;
  entities: unknown;
} | null;

export function DocumentChat({
  documentId,
  analysis,
  onSelectPage,
}: {
  documentId: string;
  analysis?: AnalysisData;
  onSelectPage?: (page: number) => void;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useDocumentChatMutation(documentId);
  const loading = chatMutation.isPending;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function ask(trimmed: string) {
    if (!trimmed || loading) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setQuestion("");

    chatMutation.mutate(trimmed, {
      onSuccess: (data) => {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: data.answer, citations: data.citations },
        ]);
      },
      onError: (error) => {
        setMessages((current) => [
          ...current,
          {
            role: "error",
            content:
              error instanceof Error
                ? error.message
                : "Something went wrong answering that. Try again.",
          },
        ]);
      },
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask(question.trim());
    }
  }

  const suggestions = buildSuggestedQuestions({
    hasSummary: !!analysis?.summary,
    risks: parseRisks(analysis?.risks),
    keyFindings: parseKeyFindings(analysis?.keyFindings),
    entities: parseEntities(analysis?.entities),
  });

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Ask your document</h3>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Ask a question and get an answer grounded in this document,
              with page references you can jump to.
            </p>

            {suggestions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((message, index) => {
          if (message.role === "user") {
            return (
              <div
                key={index}
                className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
              >
                {message.content}
              </div>
            );
          }

          if (message.role === "error") {
            return (
              <div
                key={index}
                className="flex max-w-[90%] items-start gap-2 rounded-xl rounded-bl-sm border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive"
              >
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                <span>{message.content}</span>
              </div>
            );
          }

          return (
            <div
              key={index}
              className="max-w-[90%] rounded-xl rounded-bl-sm border border-border bg-card px-4 py-3"
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>

              {message.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    Sources:
                  </span>
                  {message.citations.map((citation) => (
                    <button
                      key={citation.chunkId}
                      type="button"
                      onClick={() => onSelectPage?.(citation.pageNumber)}
                      disabled={!onSelectPage}
                      className={cn(
                        "rounded-md border border-border px-2 py-0.5 text-xs",
                        onSelectPage && "hover:border-primary hover:text-primary"
                      )}
                    >
                      Page {citation.pageNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex max-w-[90%] items-center gap-2 rounded-xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <span className="flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-current" />
            </span>
            Reading the document…
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this document… (Enter to send, Shift+Enter for a new line)"
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
          />

          <Button
            size="icon"
            onClick={() => ask(question.trim())}
            disabled={loading || !question.trim()}
            aria-label="Send question"
          >
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
