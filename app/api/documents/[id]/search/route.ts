import { NextResponse } from "next/server";

import {
  searchDocument,
} from "@/lib/ai/search-document";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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
      {
        status: 400,
      }
    );
  }

  const results =
    await searchDocument(
      id,
      question
    );

  return NextResponse.json({
    results,
  });
}