import type { Category } from "@/types/category";

type AuthenticatedClient = <T>(path: string, options?: RequestInit) => Promise<T>;

// POST /create/category  (requires admin JWT)
export async function adminCreateCategory(
  client: AuthenticatedClient,
  name: string
): Promise<Category> {
  return client<Category>("/create/category", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

// PATCH /update/category/:id  (requires admin JWT)
export async function adminUpdateCategory(
  client: AuthenticatedClient,
  id: number,
  name: string
): Promise<Category> {
  return client<Category>(`/update/category/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

// DELETE /delete/category/:id  (requires admin JWT)
// Throws ApiError 409 when the category is still referenced by products.
export async function adminDeleteCategory(
  client: AuthenticatedClient,
  id: number
): Promise<void> {
  return client<void>(`/delete/category/${id}`, { method: "DELETE" });
}
