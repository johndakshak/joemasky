import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api/category";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}