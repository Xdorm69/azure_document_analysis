import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      status: true,
      pageCount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ documents });
}
