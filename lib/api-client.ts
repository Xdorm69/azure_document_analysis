import { z } from "zod";
import { apiErrorSchema } from "@/lib/validations/api-responses";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FetchJsonOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Thin wrapper around `fetch` for talking to our own `/api/*` routes.
 *
 * - Serializes `body` as JSON automatically.
 * - Throws `ApiError` with the server's `error` message on non-2xx
 *   responses, so Tanstack Query mutations/queries get a useful message.
 * - Validates the successful response against a Zod schema so shape
 *   drift between client and server fails loudly instead of silently.
 */
export async function fetchJson<Schema extends z.ZodType>(
  url: string,
  schema: Schema,
  options: FetchJsonOptions = {}
): Promise<z.infer<Schema>> {
  const { body, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers:
      body !== undefined
        ? { "Content-Type": "application/json", ...headers }
        : headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(data);
    throw new ApiError(
      parsedError.success ? parsedError.data.error : `Request failed (${response.status})`,
      response.status
    );
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw new ApiError(
      `Unexpected response shape from ${url}: ${parsed.error.issues[0]?.message ?? "validation failed"}`,
      response.status
    );
  }

  return parsed.data;
}
