import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { generateBlobSasUrl } from "@/lib/azure/blob";
import { requireOnboardedUser } from "@/lib/auth/current-user";
import { documentIdParamSchema } from "@/lib/validations/document";

/**
 * Returns a short-lived (10 min) read-only SAS URL for the original file,
 * so the document viewer can render it without proxying bytes through our
 * own server. Reuses the same `generateBlobSasUrl` helper the analysis
 * pipeline already relies on.
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

  const document = await prisma.document.findFirst({
    where: { id, userId: auth.user.id },
    select: { blobPath: true, mimeType: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const url = generateBlobSasUrl(document.blobPath);

  return NextResponse.json({
    url,
    mimeType: document.mimeType,
    expiresInSeconds: 10 * 60,
  });
}
