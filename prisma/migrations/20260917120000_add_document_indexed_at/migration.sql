-- Adds a real, observable signal for the "Search Indexing" stage of the
-- processing pipeline UI. Extraction/chunking already leave a trace
-- (DocumentChunk rows) and AI analysis leaves a trace (DocumentAnalysis
-- row), but indexing into Azure AI Search previously left no record in
-- our own database, so the pipeline UI had no honest way to show it as
-- a distinct completed step. This column is set once indexing succeeds.
ALTER TABLE "Document" ADD COLUMN "indexedAt" TIMESTAMP(3);
