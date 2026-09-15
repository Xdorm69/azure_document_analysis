import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } =
    await context.params;

  const chunks =
    await prisma.documentChunk.findMany({
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