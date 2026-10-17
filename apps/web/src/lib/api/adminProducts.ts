import { BASE_URL, ApiError } from "./client";
import type { Product } from "@/types/product";

type AuthenticatedClient = <T>(path: string, options?: RequestInit) => Promise<T>;

// Sends a multipart/form-data request with a Bearer token.
// Content-Type must NOT be set manually — the browser sets it automatically
// (including the multipart boundary) when a FormData body is passed to fetch.
// This bypasses apiClient, which unconditionally sets Content-Type: application/json.
async function multipartFetch<T>(
  path: string,
  method: "POST" | "PATCH",
  token: string,
  body: FormData,
  onUnauthorized?: () => void
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  const responseBody = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new ApiError(responseBody?.message || "Request failed", res.status);
    if (res.status === 401) onUnauthorized?.();
    throw err;
  }

  return responseBody?.data as T;
}

// POST /create/product  (requires admin JWT, multipart/form-data)
// `isAvailable` is intentionally omitted — the schema defaults to true and
// booleans cannot be reliably sent via multipart. Use adminSetProductAvailability.
export async function adminCreateProduct(
  token: string,
  data: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    sizes?: string[];
    colors?: string[];
    image: File;
  },
  onUnauthorized?: () => void
): Promise<Product> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("price", String(data.price));
  form.append("categoryId", String(data.categoryId));
  if (data.description) form.append("description", data.description);
  data.sizes?.forEach((s) => form.append("sizes", s));
  data.colors?.forEach((c) => form.append("colors", c));
  form.append("image", data.image);

  return multipartFetch<Product>("/create/product", "POST", token, form, onUnauthorized);
}

// PATCH /update/product/:id  (requires admin JWT, multipart/form-data)
// All fields optional. Pass `image` only when replacing the current image.
// `isAvailable` is excluded for the same reason as adminCreateProduct.
//
// Clearing arrays:
//   - Pass `clearSizes: true` to set sizes to [] on the server. When this flag
//     is set, no `sizes` entries should be included (the flag takes precedence).
//   - Pass `clearColors: true` for the equivalent behavior on colors.
//   - Omitting both the flag and the array entries leaves the existing value
//     unchanged (standard partial-update semantics).
export async function adminUpdateProduct(
  token: string,
  id: number,
  data: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    sizes?: string[];
    colors?: string[];
    clearSizes?: boolean;
    clearColors?: boolean;
    image?: File;
  },
  onUnauthorized?: () => void
): Promise<Product> {
  const form = new FormData();
  if (data.name !== undefined) form.append("name", data.name);
  if (data.description !== undefined) form.append("description", data.description);
  if (data.price !== undefined) form.append("price", String(data.price));
  if (data.categoryId !== undefined) form.append("categoryId", String(data.categoryId));
  if (data.clearSizes) {
    form.append("clearSizes", "true");
  } else {
    data.sizes?.forEach((s) => form.append("sizes", s));
  }
  if (data.clearColors) {
    form.append("clearColors", "true");
  } else {
    data.colors?.forEach((c) => form.append("colors", c));
  }
  if (data.image) form.append("image", data.image);

  return multipartFetch<Product>(`/update/product/${id}`, "PATCH", token, form, onUnauthorized);
}

// PATCH /update/product/:id  (requires admin JWT, JSON body)
// Sends isAvailable as a proper boolean via JSON so Prisma receives the correct type.
// Kept separate from the multipart functions because multipart sends all values as strings.
export async function adminSetProductAvailability(
  client: AuthenticatedClient,
  id: number,
  isAvailable: boolean
): Promise<Product> {
  return client<Product>(`/update/product/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isAvailable }),
  });
}

// DELETE /delete/product/:id  (requires admin JWT)
// Throws ApiError 409 when the product is referenced by existing orders.
export async function adminDeleteProduct(
  client: AuthenticatedClient,
  id: number
): Promise<void> {
  return client<void>(`/delete/product/${id}`, { method: "DELETE" });
}
