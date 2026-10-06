export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isAvailable?: boolean;
  imageUrl: string;
  sizes?: string[];
  colors?: string[];
}
export type UpdateProductInput = Partial<CreateProductInput>;

