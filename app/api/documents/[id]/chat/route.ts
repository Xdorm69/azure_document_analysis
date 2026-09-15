import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  retrieveChunks,
} from "@/lib/ai/rag";

import {
  generateAnswer,
} from "@/lib/ai/generate-answer";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const body =
      await request.json();

    const question =
      body.question;

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Question is required",
        },
        { status: 400 }
      );
    }

    const document =
      await prisma.document.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

    if (!document) {
      return NextResponse.json(
        {
          error:
            "Document not found",
        },
        { status: 404 }
      );
    }

    if (
      document.status !== "ANALYZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Document has not finished processing",
        },
        { status: 409 }
      );
    }

    // 1. Retrieve relevant chunks
    const chunks =
      await retrieveChunks(
        id,
        question,
        5
      );

    // 2. Generate grounded answer
    const result =
      await generateAnswer(
        question,
        chunks
      );

    return NextResponse.json({
      answer: result.answer,

      citations:
        result.citations,

      retrievedChunks: chunks.map(
        (chunk) => ({
          id: chunk.id,
          pageNumber:
            chunk.pageNumber,
          score: chunk.score,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Chat error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to answer question",
      },
      { status: 500 }
    );
  }
}