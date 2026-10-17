"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/product";

// Fetches the product list under the ["admin", "products"] query key so
// mutations can invalidate it separately from the public ["products"] cache.
export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: getProducts,
  });
}
