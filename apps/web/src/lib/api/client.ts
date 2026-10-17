export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// HELPER FUNCTION FOR ERROR CATCHING
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// HELPER FUNCTION FOR API CALL
export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(body?.message || "Request failed", res.status);
  }

  return body?.data as T;
}