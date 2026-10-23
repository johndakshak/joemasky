import { vi } from "vitest";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

/**
 * Shared mock factories for API modules used across tests.
 *
 * These factories create vi.fn() stubs that can be individually overridden
 * in each test.  Import and call the relevant mocker in a beforeEach.
 */

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Test Jersey",
    description: "A test jersey",
    price: "30500",
    imageUrl: "https://res.cloudinary.com/test/image1.jpg",
    isAvailable: true,
    sizes: [],
    colors: [],
    categoryId: 6,
    category: {
      id: 6,
      name: "Jerseys",
      createdAt: "2026-10-19T21:53:56.552Z",
      updatedAt: "2026-10-19T21:53:56.552Z",
    },
    createdAt: "2026-10-03T14:51:24.107Z",
    updatedAt: "2026-10-19T21:54:14.034Z",
  },
  {
    id: 2,
    name: "Test Shoes",
    description: "A test shoe",
    price: "25000",
    imageUrl: "https://res.cloudinary.com/test/image2.jpg",
    isAvailable: true,
    sizes: ["43"],
    colors: ["White"],
    categoryId: 5,
    category: {
      id: 5,
      name: "Shoes",
      createdAt: "2026-10-19T21:50:32.070Z",
      updatedAt: "2026-10-19T21:50:32.070Z",
    },
    createdAt: "2026-10-16T21:49:21.032Z",
    updatedAt: "2026-10-19T21:51:43.133Z",
  },
  {
    id: 3,
    name: "Unavailable Shirt",
    description: "An unavailable shirt",
    price: "15000",
    imageUrl: "https://res.cloudinary.com/test/image3.jpg",
    isAvailable: false,
    sizes: [],
    colors: ["Black"],
    categoryId: 4,
    category: {
      id: 4,
      name: "Mens Wear",
      createdAt: "2026-10-17T19:13:42.151Z",
      updatedAt: "2026-10-17T19:13:42.151Z",
    },
    createdAt: "2026-10-06T12:21:40.208Z",
    updatedAt: "2026-10-19T21:48:26.886Z",
  },
];

export const mockCategories: Category[] = [
  {
    id: 4,
    name: "Mens Wear",
    createdAt: "2026-10-17T19:13:42.151Z",
    updatedAt: "2026-10-17T19:13:42.151Z",
  },
  {
    id: 5,
    name: "Shoes",
    createdAt: "2026-10-19T21:50:32.070Z",
    updatedAt: "2026-10-19T21:50:32.070Z",
  },
  {
    id: 6,
    name: "Jerseys",
    createdAt: "2026-10-19T21:53:56.552Z",
    updatedAt: "2026-10-19T21:53:56.552Z",
  },
];

/**
 * Mock the @/lib/api/product and @/lib/api/category modules.
 * Returns the vi.fn stubs so tests can override return values or rejections.
 */
export function mockApiModules() {
  const getProductsMock = vi.fn();
  const getCategoriesMock = vi.fn();

  vi.doMock("@/lib/api/product", () => ({
    getProducts: getProductsMock,
    getProductById: vi.fn(),
  }));

  vi.doMock("@/lib/api/category", () => ({
    getCategories: getCategoriesMock,
    getCategoryById: vi.fn(),
  }));

  return { getProductsMock, getCategoriesMock };
}
