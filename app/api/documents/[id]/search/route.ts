import { NextResponse } from "next/server";

import { searchDocument } from "@/lib/ai/search-document";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/auth/current-user";
import { searchRequestSchema } from "@/lib/validations/chat";
import { documentIdParamSchema } from "@/lib/validations/document";

export async function POST(
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

  const body = await request.json().catch(() => null);
  const parsedBody = searchRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Question is required" },
      { status: 400 }
    );
  }
  const { question } = parsedBody.data;

  const document = await prisma.document.findFirst({
    where: { id, userId: auth.user.id },
    select: { id: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const results = await searchDocument(id, question);

  return NextResponse.json({
    results,
  });
}
