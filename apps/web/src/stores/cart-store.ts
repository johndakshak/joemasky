import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: number;
  quantity: number;
  selectedSize: string | null;
  selectedColor: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (productId: number, quantity: number, selectedSize: string | null, selectedColor: string | null) => void;
  removeItem: (productId: number, selectedSize: string | null, selectedColor: string | null) => void;
  increaseQuantity: (productId: number, selectedSize: string | null, selectedColor: string | null) => void;
  decreaseQuantity: (productId: number, selectedSize: string | null, selectedColor: string | null) => void;
  clearCart: () => void;
}

// Check if two cart items refer to the same product variant (same id + same size + same color)
function isSameVariant(item: CartItem, productId: number, selectedSize: string | null, selectedColor: string | null) {
  return (
    item.productId === productId &&
    item.selectedSize === selectedSize &&
    item.selectedColor === selectedColor
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (productId, quantity, selectedSize, selectedColor) =>
        set((state) => {
          const existing = state.items.find((item) =>
            isSameVariant(item, productId, selectedSize, selectedColor)
          );

          if (existing) {
            // Same variant already in cart — just increase its quantity
            return {
              items: state.items.map((item) =>
                isSameVariant(item, productId, selectedSize, selectedColor)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          // New variant — add as a separate cart entry
          return {
            items: [...state.items, { productId, quantity, selectedSize, selectedColor }],
          };
        }),

      removeItem: (productId, selectedSize, selectedColor) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !isSameVariant(item, productId, selectedSize, selectedColor)
          ),
        })),

      increaseQuantity: (productId, selectedSize, selectedColor) =>
        set((state) => ({
          items: state.items.map((item) =>
            isSameVariant(item, productId, selectedSize, selectedColor)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQuantity: (productId, selectedSize, selectedColor) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              isSameVariant(item, productId, selectedSize, selectedColor)
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),
    }),
    { name: "jeomasky-cart" }
  )
);
