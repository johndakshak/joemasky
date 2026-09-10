import { prisma } from "../lib/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "../types/category.types";

// FIND ALL CATEGORIES
export async function findAllCategories() {
  return prisma.category.findMany();
}

// FIND CATEGORY
export async function findCategoryById(categoryId: number) {
  return prisma.category.findUnique({
    where: { id: categoryId },
  });
}

// CREATE CATEGORY
export async function createCategory(data: CreateCategoryInput) {
  const existing = await prisma.category.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new Error("DUPLICATE_CATEGORY_NAME");
  }

  return prisma.category.create({ data });
}

// UPDATE CATEGORY
export async function updateCategory(categoryId: number, data: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
}

// DELETE CATEGORY
export async function deleteCategory(categoryId: number) {
  return prisma.category.delete({
    where: { id: categoryId },
  });
}