"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/category";

// Fetches the category list under the ["admin", "categories"] query key so
// mutations can invalidate it separately from the public ["categories"] cache.
export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: getCategories,
  });
}
