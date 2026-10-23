import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { mockProducts, mockCategories } from "./helpers";

// ── Mock the hooks and stores ─────────────────────────────────────────────────

const getProductsMock = vi.fn();
const getCategoriesMock = vi.fn();

vi.mock("@/lib/api/product", () => ({
  getProducts: (...args: unknown[]) => getProductsMock(...args),
  getProductById: vi.fn(),
}));

vi.mock("@/lib/api/category", () => ({
  getCategories: (...args: unknown[]) => getCategoriesMock(...args),
}));

vi.mock("@/stores/cart-store", () => ({
  useCartStore: vi.fn((selector) =>
    selector({
      addItem: vi.fn(),
      items: [],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      total: 0,
    }),
  ),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity, refetchOnWindowFocus: false },
    },
  });
}

function withQueryClient(children: ReactNode) {
  const qc = createQueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

import { CategoryProductSections } from "@/app/(storefront)/_components/CategoryProductSections";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CategoryProductSections", () => {
  it("renders skeleton loading state while loading", async () => {
    getProductsMock.mockReturnValue(new Promise(() => {}));
    getCategoriesMock.mockReturnValue(new Promise(() => {}));

    render(withQueryClient(<CategoryProductSections />));

    // The section heading skeleton placeholders are rendered.
    // We expect the "shop" id on the first skeleton section.
    const shopSection = document.getElementById("shop");
    expect(shopSection).toBeInTheDocument();
  });

  it("renders product sections grouped by category after successful fetch", async () => {
    getProductsMock.mockResolvedValue(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText("Mens Wear")).toBeInTheDocument();
    });

    // All 3 categories should have section headers.
    expect(screen.getByText("Shoes")).toBeInTheDocument();
    expect(screen.getByText("Jerseys")).toBeInTheDocument();

    // Product names should be visible.
    expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    expect(screen.getByText("Test Shoes")).toBeInTheDocument();
    expect(screen.getByText("Unavailable Shirt")).toBeInTheDocument();
  });

  it("displays error with retry button when fetch fails", async () => {
    getProductsMock.mockRejectedValue(new Error("Network error"));
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("re-fetches when retry button is clicked after error", async () => {
    getProductsMock
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Try Again"));

    await waitFor(() => {
      expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    });

    expect(getProductsMock).toHaveBeenCalledTimes(2);
  });

  it("renders empty state when no products exist", async () => {
    getProductsMock.mockResolvedValue([]);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText(/no products available/i)).toBeInTheDocument();
    });
  });

  it("renders empty state when categories exist but have no products", async () => {
    // Products with a categoryId that doesn't match any category
    const orphanProducts = [
      { ...mockProducts[0], categoryId: 999 },
    ];
    getProductsMock.mockResolvedValue(orphanProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText(/no products available/i)).toBeInTheDocument();
    });
  });

  it("skips categories that have no products", async () => {
    // Only Jerseys (id:6) has a product in this test data.
    const onlyJerseyProducts = mockProducts.filter((p) => p.categoryId === 6);
    getProductsMock.mockResolvedValue(onlyJerseyProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText("Jerseys")).toBeInTheDocument();
    });

    // Mens Wear and Shoes should NOT appear because they have no products.
    expect(screen.queryByText("Mens Wear")).not.toBeInTheDocument();
    expect(screen.queryByText("Shoes")).not.toBeInTheDocument();
  });

  it("sorts categories by createdAt ascending", async () => {
    // Categories in reverse createdAt order
    const reversedCategories = [...mockCategories].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    getProductsMock.mockResolvedValue(mockProducts);
    getCategoriesMock.mockResolvedValue(reversedCategories);

    render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText("Mens Wear")).toBeInTheDocument();
    });

    // Section numbers should reflect createdAt-ascending order:
    // Mens Wear (2026-10-17) → 01, Shoes (2026-10-19) → 02, Jerseys (2026-10-19) → 03
    expect(screen.getByText("01 / Mens Wear")).toBeInTheDocument();
  });

  it("does not trigger duplicate requests for products on re-render", async () => {
    getProductsMock.mockResolvedValue(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    const { rerender } = render(withQueryClient(<CategoryProductSections />));

    await waitFor(() => {
      expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    });

    // Re-render the same component (e.g., parent state change)
    rerender(withQueryClient(<CategoryProductSections />));

    // Give any potential refetch time to fire
    await new Promise((r) => setTimeout(r, 100));

    // Should still only be called once — data is fresh (staleTime: Infinity)
    expect(getProductsMock).toHaveBeenCalledTimes(1);
    expect(getCategoriesMock).toHaveBeenCalledTimes(1);
  });
});
