import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/auth/current-user";
import { documentIdParamSchema } from "@/lib/validations/document";

/**
 * Returns the same raw signals `computePipelineStages` consumes on the
 * document detail page, so both the detail page and the upload flow can
 * show a live processing pipeline without duplicating the derivation
 * logic (see `lib/pipeline.ts`).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireOnboardedUser();
  if (!auth.ok) return auth.response;

  const parsedParams = documentIdParamSchema.safeParse(await context.params);
  if (!parsedParams.success) {
    return NextResponse.json(
      { error: parsedParams.error.issues[0]?.message ?? "Invalid document id" },
      { status: 400 }
    );
  }
  const { id } = parsedParams.data;

  const [document, chunkCount, analysis] = await Promise.all([
    prisma.document.findFirst({
      where: { id, userId: auth.user.id },
      select: { status: true, indexedAt: true },
    }),
    prisma.documentChunk.count({ where: { documentId: id } }),
    prisma.documentAnalysis.findUnique({
      where: { documentId: id },
      select: { id: true },
    }),
  ]);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: document.status,
    hasChunks: chunkCount > 0,
    indexedAt: document.indexedAt,
    hasAnalysis: analysis !== null,
  });
}
