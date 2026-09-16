import {
  documentIntelligenceClient,
} from "./document-intelligence";

export async function analyzeDocument(
  sasUrl: string
) {
  const response =
    await documentIntelligenceClient
      .path(
        "/documentModels/{modelId}:analyze",
        "prebuilt-layout"
      )
      .post({
        contentType: "application/json",
        body: {
          urlSource: sasUrl,
        },
      });

  if (response.status !== "202") {
    throw new Error(
      `Document Intelligence failed: ${response.status}`
    );
  }

  const operationLocation =
    response.headers["operation-location"];

  if (!operationLocation) {
    throw new Error(
      "Missing operation-location"
    );
  }

  return operationLocation;
}

export async function getAnalysisResult(
  operationLocation: string
) {
  while (true) {
    const response =
      await fetch(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key":
            process.env
              .AZURE_DOCUMENT_INTELLIGENCE_KEY!,
        },
      });

    if (!response.ok) {
      throw new Error(
        "Failed to retrieve analysis result"
      );
    }

    const result = await response.json();

    if (result.status === "succeeded") {
      return result.analyzeResult;
    }

    if (result.status === "failed") {
      throw new Error(
        "Document analysis failed"
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 2000)
    );
  }
}