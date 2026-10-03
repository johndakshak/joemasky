import { apiClient } from "./client";
import type { Category } from "@/types/category";

// GET ALL CATEGORIES
export function getCategories() {
  return apiClient<Category[]>("/category");
}

// GET CATEGORY BY ID
export function getCategoryById(id: number) {
  return apiClient<Category>(`/category/${id}`);
}