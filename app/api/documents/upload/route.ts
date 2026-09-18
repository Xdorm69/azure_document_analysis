import { NextResponse, after } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { uploadDocument } from "@/lib/azure/blob";
import { validateDocument } from "@/lib/validations/document";
import { requireOnboardedUser } from "@/lib/auth/current-user";
import { processDocumentAnalysis } from "@/lib/document-processing";

// This route returns as soon as the file is stored — analysis runs in
// `after()` below, past the point the response is sent. On serverless
// (Vercel), `after()` extends the function's lifetime just for that
// background work (via `waitUntil`) rather than requiring a separate
// queue/worker service. maxDuration bounds how long that's allowed to
// run; match it to your hosting plan's limit.
export const maxDuration = 300;

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

    // Fire-and-forget: the client gets its response now and can move on
    // immediately. Progress is visible via `/api/documents/[id]/pipeline-status`
    // (already polled by `LivePipelineStatus`), and failures land on the
    // document as `status: "FAILED"`, retryable from the detail page —
    // same as before, just no longer blocking this request.
    after(() =>
      processDocumentAnalysis(document.id).catch((error) => {
        console.error(`Background analysis failed for ${document.id}:`, error);
      })
    );

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
