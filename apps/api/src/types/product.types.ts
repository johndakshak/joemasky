export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  isAvailable?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

