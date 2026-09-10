import { Request, Response } from "express";
import * as categoryService from "../services/category.service";
import { CreateCategoryInput, UpdateCategoryInput } from "../types/category.types";
import { Prisma } from "../generated/prisma/client";

// GET ALL CATEGORIES
export async function getAllCategories(req: Request, res: Response) {

  try {

    const categories = await categoryService.findAllCategories();

    return res.status(200).json({
      success: true,
      data: categories
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
}

// GET SINGLE CATEGORY
export async function getCategoryById(req: Request, res: Response) {

  try {

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    const categoryExist = await categoryService.findCategoryById(id);

    if (!categoryExist) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: categoryExist
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category"
    });
  }
}

// CREATE CATEGORY
export async function createCategory(req: Request, res: Response) {

  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "name must be a string"
      });
    }    

    const categoryData: CreateCategoryInput = { name };

    const category = await categoryService.createCategory(categoryData);

    return res.status(201).json({
      success: true,
      data: category
    });

  }
  catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_CATEGORY_NAME") {
      return res.status(409).json({
        success: false,
        message: "Category name already exists"
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category name already exists"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category"
    });
  }
}

// UPDATE CATEGORY
export async function updateCategory(req: Request, res: Response) {

  try {

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
    }      

    const { name } = req.body;

    if (name !== undefined && !name) {
      return res.status(400).json({
        success: false,
        message: "name cannot be empty"
      });
    }

    if (typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "name must be a string"
      });
    }    

    const categoryData: UpdateCategoryInput = { name };

    const category = await categoryService.updateCategory(id, categoryData);

    return res.status(200).json({
      success: true,
      data: category
    });

  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Category name already exists"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category"
    });
  }
}

// DELETE CATEGORY
export async function deleteCategory(req: Request, res: Response) {

  try {

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    await categoryService.deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete category: it is referenced by existing products"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category"
    });
  }
}