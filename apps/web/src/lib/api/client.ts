export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// HELPER FUNCTION FOR ERROR CATCHING
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * HELPER FUNCTION FOR API CALL
 *
 * Handles:
 *  - Network failures (server unreachable, DNS errors, etc.)
 *  - Non-JSON responses (502/503 from cold starts, HTML error pages)
 *  - Missing `data` field in a success response
 *  - Non-2xx status codes
 *
 * A network-level failure (fetch throws) is wrapped in an ApiError with
 * status 0 so callers can distinguish "couldn't reach server" from a
 * normal HTTP error.
 */
export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    // fetch() rejects on network errors — server unreachable, DNS failure,
    // CORS rejection, etc.  Wrap it so callers get a consistent ApiError.
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
    );
  }

  // Parse the body as JSON if possible; non-JSON responses (HTML error pages,
  // empty 502/503 bodies from cold starts) produce null.
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body?.message ||
      (res.status === 503
        ? "The server is starting up. Please try again in a moment."
        : res.status === 502
          ? "The server is temporarily unavailable. Please try again."
          : "Request failed");
    throw new ApiError(message, res.status);
  }

  // A 200 response should always include a `data` field.  If it doesn't,
  // the response is malformed — throw rather than silently returning null.
  if (!body || body.data === undefined) {
    throw new ApiError("Received an invalid response from the server.", res.status);
  }

  return body.data as T;
}
