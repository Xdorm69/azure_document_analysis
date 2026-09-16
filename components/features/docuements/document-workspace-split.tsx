"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentViewer } from "@/components/features/docuements/document-viewer";
import { AnalysisOverview } from "@/components/features/docuements/analysis-overview";
import { ExtractedTextPanel } from "@/components/features/docuements/extracted-text-panel";
import { ChunkList } from "@/components/features/docuements/chunk-list";
import { DocumentChat } from "@/components/features/docuements/document-chat";
import type { DocumentChunkSummary } from "@/types/document";

type AnalysisData = {
  summary: string | null;
  riskScore: number | null;
  keyFindings: unknown;
  risks: unknown;
  entities: unknown;
  actionItems: unknown;
} | null;

export function DocumentWorkspaceSplit({
  documentId,
  mimeType,
  analysis,
  pageCount,
  chunkCount,
  chunks,
  extractedText,
}: {
  documentId: string;
  mimeType: string;
  analysis: AnalysisData;
  pageCount: number | null;
  chunkCount: number;
  chunks: DocumentChunkSummary[];
  extractedText: string | null;
}) {
  const [activePage, setActivePage] = useState<number | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_440px] lg:items-start">
      {/* Left: original document */}
      <div className="h-[calc(100vh-13rem)] min-h-[500px] lg:sticky lg:top-8">
        <DocumentViewer
          documentId={documentId}
          mimeType={mimeType}
          activePage={activePage}
        />
      </div>

      {/* Right: AI analysis / ask, tabbed to keep the split screen from
          turning into one very long scroll */}
      <Card className="flex h-[calc(100vh-13rem)] min-h-[500px] flex-col overflow-hidden p-0 lg:sticky lg:top-8">
        <Tabs defaultValue="analysis" className="flex h-full flex-col">
          <div className="border-b border-border p-3">
            <TabsList>
              <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="ask">Ask</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analysis" className="flex-1 overflow-y-auto">
            <CardContent className="space-y-4 py-4">
              <AnalysisOverview
                analysis={analysis}
                pageCount={pageCount}
                chunkCount={chunkCount}
                onSelectPage={setActivePage}
              />

              {extractedText && <ExtractedTextPanel text={extractedText} />}

              <div>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                  Chunks ({chunks.length})
                </h2>
                <ChunkList chunks={chunks} />
              </div>
            </CardContent>
          </TabsContent>

          <TabsContent value="ask" className="flex-1 overflow-hidden">
            <CardContent className="h-full p-0">
              <DocumentChat
                documentId={documentId}
                analysis={analysis}
                onSelectPage={setActivePage}
              />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
