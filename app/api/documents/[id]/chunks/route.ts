import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/auth/current-user";
import { documentIdParamSchema } from "@/lib/validations/document";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
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

  const document = await prisma.document.findFirst({
    where: { id, userId: auth.user.id },
    select: { id: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const chunks = await prisma.documentChunk.findMany({
    where: {
      documentId: id,
    },

    orderBy: {
      chunkIndex: "asc",
    },

    select: {
      id: true,
      chunkIndex: true,
      pageNumber: true,
      content: true,
      tokenCount: true,
    },
  });

  return NextResponse.json({
    chunks,
  });
}
