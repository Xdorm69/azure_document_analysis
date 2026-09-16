import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { uploadDocument } from "@/lib/azure/blob";
import { validateDocument } from "@/lib/validations/document";
import { requireOnboardedUser } from "@/lib/auth/current-user";

export async function POST(request: Request) {
  const auth = await requireOnboardedUser();
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "File is required",
        },
        { status: 400 }
      );
    }

    // Zod-backed metadata check (type/size) — throws with a friendly
    // message on failure, caught below.
    validateDocument(file);

    const extension = file.name.split(".").pop() ?? "bin";

    const uniqueName = `${crypto.randomUUID()}.${extension}`;

    const blobPath = uniqueName;

    await uploadDocument(file, blobPath);

    const document = await prisma.document.create({
      data: {
        name: file.name,
        mimeType: file.type,
        size: file.size,
        blobPath,
        status: "UPLOADED",
        userId: auth.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
