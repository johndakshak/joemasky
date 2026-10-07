import type { Category } from "./category";

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
  sizes: string[];
  colors: string[];  
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
}