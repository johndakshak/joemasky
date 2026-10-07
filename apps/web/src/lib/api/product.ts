import { apiClient } from "./client";
import type { Product } from "@/types/product";

// GET ALL PRODUCTS
export function getProducts() {
  return apiClient<Product[]>("/products");
}

// GET PRODUCT BY ID
export function getProductById(id: number) {
  return apiClient<Product>(`/product/${id}`);
}