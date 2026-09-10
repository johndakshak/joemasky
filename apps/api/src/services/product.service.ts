import { prisma } from "../lib/prisma";
import { CreateProductInput, UpdateProductInput } from "../types/product.types";

// FIND ALL RPODUCTS
export async function findAllProducts() {
  return prisma.product.findMany({
    include: { category: true },
  });
}

// FIND PRODUCT BY ID
export async function findProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

// CREATE PRODUCT
export async function createProduct(data: CreateProductInput) {
  return prisma.product.create({
    data,
    include: { category: true },
  });
}

// UPDATE PRODUCT
export async function updateProduct(id: number, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
}

// DELETE PRODUCT
export async function deleteProduct(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}


