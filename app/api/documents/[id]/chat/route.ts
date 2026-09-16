import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { retrieveChunks } from "@/lib/ai/rag";
import { generateAnswer } from "@/lib/ai/generate-answer";
import { requireOnboardedUser } from "@/lib/auth/current-user";
import { chatRequestSchema } from "@/lib/validations/chat";
import { documentIdParamSchema } from "@/lib/validations/document";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const auth = await requireOnboardedUser();
  if (!auth.ok) return auth.response;

  try {
    const parsedParams = documentIdParamSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: parsedParams.error.issues[0]?.message ?? "Invalid document id" },
        { status: 400 }
      );
    }
    const { id } = parsedParams.data;

    const body = await request.json().catch(() => null);
    const parsedBody = chatRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Question is required" },
        { status: 400 }
      );
    }
    const { question } = parsedBody.data;

    const document = await prisma.document.findFirst({
      where: { id, userId: auth.user.id },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          error: "Document not found",
        },
        { status: 404 }
      );
    }

    if (document.status !== "ANALYZED") {
      return NextResponse.json(
        {
          error: "Document has not finished processing",
        },
        { status: 409 }
      );
    }

    // 1. Retrieve relevant chunks
    const chunks = await retrieveChunks(id, question, 5);

    // 2. Generate grounded answer
    const result = await generateAnswer(question, chunks);

    return NextResponse.json({
      answer: result.answer,

      citations: result.citations,

      retrievedChunks: chunks.map((chunk) => ({
        id: chunk.id,
        pageNumber: chunk.pageNumber,
        score: chunk.score,
      })),
    });
  } catch (error) {
    console.error("Chat error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to answer question",
      },
      { status: 500 }
    );
  }
}
