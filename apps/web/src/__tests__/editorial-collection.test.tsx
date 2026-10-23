import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { mockProducts, mockCategories } from "./helpers";

// ── Mock the hooks and stores ─────────────────────────────────────────────────
// We mock at the hook level so the components under test are the real code.

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

// Import the component AFTER mocks are set up.
import { EditorialCollection } from "@/app/(storefront)/_components/EditorialCollection";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("EditorialCollection", () => {
  it("renders skeleton loading state while products are loading", async () => {
    getProductsMock.mockReturnValue(new Promise(() => {})); // never resolves
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    // The section heading is always rendered.
    expect(screen.getByText("The Collection")).toBeInTheDocument();

    // Skeletons are shown while loading — they use animate-pulse.
    await waitFor(() => {
      expect(getProductsMock).toHaveBeenCalled();
    });
  });

  it("renders products after successful fetch", async () => {
    getProductsMock.mockResolvedValue(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    await waitFor(() => {
      expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    });

    // Should render the first 3 products (slice(0, 3))
    expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    expect(screen.getByText("Test Shoes")).toBeInTheDocument();
    expect(screen.getByText("Unavailable Shirt")).toBeInTheDocument();
  });

  it("displays error message with retry button when fetch fails", async () => {
    getProductsMock.mockRejectedValue(new Error("Network error"));
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    await waitFor(() => {
      expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument();
    });

    // Retry button should be present
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("re-fetches products when the retry button is clicked", async () => {
    getProductsMock
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    // Click retry
    fireEvent.click(screen.getByText("Try Again"));

    // Products should appear after retry
    await waitFor(() => {
      expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    });

    // Should have been called twice (initial + retry)
    expect(getProductsMock).toHaveBeenCalledTimes(2);
  });

  it("renders empty state when no products are returned", async () => {
    getProductsMock.mockResolvedValue([]);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    await waitFor(() => {
      expect(screen.getByText("No products available.")).toBeInTheDocument();
    });
  });

  it("renders the correct section label based on preceding category sections", async () => {
    getProductsMock.mockResolvedValue(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    // 3 categories match products (Mens Wear, Shoes, Jerseys)
    // So section number = 3 + 1 = 04
    await waitFor(() => {
      expect(screen.getByText("04 / Collections")).toBeInTheDocument();
    });
  });

  it("shows correct availability labels on product cards", async () => {
    getProductsMock.mockResolvedValue(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    await waitFor(() => {
      expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    });

    // Two available products → multiple "In stock" labels
    expect(screen.getAllByText("In stock")).toHaveLength(2);
    // One unavailable product
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });

  it("shows 'Select Options' for products with variants, 'Add to Cart' for products without", async () => {
    getProductsMock.mockResolvedValue(mockProducts);
    getCategoriesMock.mockResolvedValue(mockCategories);

    render(withQueryClient(<EditorialCollection />));

    await waitFor(() => {
      expect(screen.getByText("Test Jersey")).toBeInTheDocument();
    });

    // Test Jersey (id:1) has no sizes/colors → "Add to Cart"
    // Test Shoes (id:2) has sizes/colors → "Select Options"
    // Unavailable Shirt (id:3) is unavailable → no button
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    expect(screen.getByText("Select Options")).toBeInTheDocument();
  });
});
