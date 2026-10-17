import { Request, Response } from "express";
import * as productService from "../services/product.service";
import * as categoryService from "../services/category.service"
import { CreateProductInput, UpdateProductInput } from "../types/product.types";
import { Prisma } from "../generated/prisma/client";
import { uploadImageBuffer } from "../lib/cloudinary";
import { validateName, validatePrice, validateStringArray } from "../utils/validation";

// GET ALL PRODUCTS
export async function getAllProducts(req: Request, res: Response) {

  try {

    const products = await productService.findAllProducts();

    return res.status(200).json({
      success: true,
      data: products
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
}

// GET SINGLE PRODUCT
export async function getProductById(req: Request, res: Response) {

  try {

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const productExist = await productService.findProductById(id);

    if (!productExist) {
      return res.status(404).json({
        success: false,
        message: "Product not found!"
      });
    }

    return res.status(200).json({
      success: true,
      data: productExist
    });

  }
  catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
}

// CREATE PRODUCT
export async function createProduct(req: Request, res: Response) {

  try {

    const { name, description, price, categoryId, isAvailable, sizes, colors } = req.body;

    const normalizedSizes = typeof sizes === "string" ? [sizes] : sizes;

    const normalizedColors = typeof colors === "string" ? [colors] : colors;    

    const nameError = validateName(name);
    if (nameError) {
      return res.status(400).json({ success: false, message: nameError });
    }  

    const sizesError = validateStringArray(normalizedSizes, "sizes");
    if (sizesError) {
      return res.status(400).json({ success: false, message: sizesError });
    }

    const colorsError = validateStringArray(normalizedColors, "colors");
    if (colorsError) {
      return res.status(400).json({ success: false, message: colorsError });
    }    

    const priceError = validatePrice(price);
    if (priceError) {
      return res.status(400).json({ success: false, message: priceError });
    }
    const priceNum = Number(price);

    const categoryIdNum = Number(categoryId);   

    if (!categoryId || isNaN(categoryIdNum)) {   
        return res.status(400).json({
            success: false,
            message: "categoryId is required and must be a number"
        });
    }    

    const categoryExists = await categoryService.findCategoryById(categoryIdNum); 

    if (!categoryExists) {
        return res.status(404).json({
            success: false,
            message: "CategoryId not found"
        });
    }   

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required"
      });
    }

    const imageUrl = await uploadImageBuffer(req.file.buffer, "joemasky/products");

    const productData: CreateProductInput = {
      name,
      description,
      price: priceNum,
      categoryId: categoryIdNum,   
      isAvailable,
      imageUrl,
      sizes: normalizedSizes,
      colors: normalizedColors,
    };

    const product = await productService.createProduct(productData);

    return res.status(201).json({
      success: true,
      data: product
    });

  }
  catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to create product"
    });
  }
}

// UPDATE PRODUCT
export async function updateProduct(req: Request, res: Response) {

  try {

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
    }    

    const { name, description, price, categoryId, isAvailable, sizes, colors, clearSizes, clearColors } = req.body;

    // If the client sent clearSizes="true", set sizes to an empty array so
    // Prisma writes [] to the column. Otherwise fall back to the standard
    // multipart normalization (string → single-element array, array → as-is,
    // undefined → omit from update and leave the existing value unchanged).
    const normalizedSizes: string[] | undefined =
      clearSizes === "true" ? [] :
      typeof sizes === "string" ? [sizes] : sizes;

    // Same logic for colors.
    const normalizedColors: string[] | undefined =
      clearColors === "true" ? [] :
      typeof colors === "string" ? [colors] : colors;
    
    const sizesError = validateStringArray(normalizedSizes, "sizes");

    if (sizesError) {
      return res.status(400).json({
        success: false,
        message: sizesError
      });
    }

    const colorsError = validateStringArray(normalizedColors, "colors");

    if (colorsError) {
      return res.status(400).json({
        success: false,
        message: colorsError
      });
    }    

    if (name !== undefined) {
      const nameError = validateName(name);
      if (nameError) {
        return res.status(400).json({ success: false, message: nameError });
      }
    } 

    if (price !== undefined) {
      const priceError = validatePrice(price);
      if (priceError) {
        return res.status(400).json({ success: false, message: priceError });
      }
    }

    let categoryIdNum: number | undefined;

    if (categoryId !== undefined) {
      categoryIdNum = Number(categoryId);

      if (isNaN(categoryIdNum)) {
        return res.status(400).json({
          success: false,
          message: "categoryId must be a number"
        });
      }

      const categoryExists = await categoryService.findCategoryById(categoryIdNum);

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "CategoryId not found"
        });
      }
    }

    const productData: UpdateProductInput = {
      name,
      description,
      price,
      categoryId: categoryIdNum,
      isAvailable,
      sizes: normalizedSizes,
      colors: normalizedColors,
    };

    if (req.file) {
      productData.imageUrl = await uploadImageBuffer(req.file.buffer, "joemasky/products");
    }

    const product = await productService.updateProduct(id, productData);

    return res.status(200).json({
      success: true,
      data: product
    });
  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
}

// DELETE PRODUCT
export async function deleteProduct(req: Request, res: Response) {

  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    await productService.deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  }
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete product: it is referenced by existing orders"
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
}