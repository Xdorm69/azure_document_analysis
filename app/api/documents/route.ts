import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/auth/current-user";

export async function GET() {
  const auth = await requireOnboardedUser();
  if (!auth.ok) return auth.response;

  const documents = await prisma.document.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      status: true,
      pageCount: true,
      createdAt: true,
      analysis: { select: { riskScore: true } },
    },
  });

  return NextResponse.json({
    documents: documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      mimeType: doc.mimeType,
      size: doc.size,
      status: doc.status,
      pageCount: doc.pageCount,
      createdAt: doc.createdAt,
      riskScore: doc.analysis?.riskScore ?? null,
    })),
  });
}
