"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ExtractedTextPanel({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Extracted text</p>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <pre
          className={`overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap text-muted-foreground ${
            isExpanded ? "max-h-none" : "max-h-64"
          }`}
        >
          {text}
        </pre>

        <Button
          variant="link"
          size="sm"
          className="mt-1 px-0"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? "Show less" : "Show full text"}
        </Button>
      </CardContent>
    </Card>
  );
}
