"use client";

import { FormEvent, useState } from "react";

type Citation = {
  chunkId: string;
  pageNumber: number;
  chunkIndex: number;
  score: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

type DocumentChatProps = {
  documentId: string;
};

export function DocumentChat({
  documentId,
}: DocumentChatProps) {
  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const trimmed =
      question.trim();

    if (!trimmed || loading) {
      return;
    }

    setMessages((current) => [
      ...current,

      {
        role: "user",
        content: trimmed,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `/api/documents/${documentId}/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              question: trimmed,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to get answer"
        );
      }

      setMessages((current) => [
        ...current,

        {
          role: "assistant",
          content: data.answer,
          citations:
            data.citations,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,

        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">
              Ask this document
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Ask questions about the
              document and I&npos;ll provide
              answers with page references.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Summarize this document",
                "What are the major risks?",
                "What are the key financial figures?",
                "What are the important dates?",
              ].map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() =>
                    setQuestion(question)
                  }
                  className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(
          (message, index) => (
            <div
              key={index}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[80%] rounded-xl bg-black p-4 text-white"
                  : "max-w-[90%] rounded-xl border p-4"
              }
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>

              {message.citations &&
                message.citations.length >
                  0 && (
                  <div className="mt-4 border-t pt-3">
                    <p className="mb-2 text-xs font-medium">
                      Sources
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {message.citations.map(
                        (citation) => (
                          <button
                            key={
                              citation.chunkId
                            }
                            type="button"
                            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                          >
                            Page{" "}
                            {
                              citation.pageNumber
                            }
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )
        )}

        {loading && (
          <div className="max-w-[90%] rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
              Searching document...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t p-4"
      >
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            placeholder="Ask anything about this document..."
            className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !question.trim()
            }
            className="rounded-lg bg-black px-5 py-3 text-sm text-white disabled:opacity-50"
          >
            {loading
              ? "..."
              : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}