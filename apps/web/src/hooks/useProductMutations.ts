"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminClient } from "@/hooks/useAdminClient";
import {
  adminDeleteProduct,
  adminSetProductAvailability,
} from "@/lib/api/adminProducts";
import { ApiError } from "@/lib/api/client";
import type { Product } from "@/types/product";

export function useProductMutations(onMutationSuccess: () => void) {
  const client = useAdminClient();
  const queryClient = useQueryClient();

  // A ref tracks in-flight product IDs without causing unnecessary re-renders
  // on every add/delete. A state counter is incremented to re-render consumers
  // when the set changes so disabled states stay accurate.
  const togglingIds = useRef<Set<number>>(new Set());
  const [, forceUpdate] = useState(0);

  function startToggle(id: number) {
    togglingIds.current.add(id);
    forceUpdate((n) => n + 1);
  }

  function endToggle(id: number) {
    togglingIds.current.delete(id);
    forceUpdate((n) => n + 1);
  }

  const [isDeleting, setIsDeleting] = useState(false);

  async function invalidateProducts() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  function handleMutationSuccess() {
    onMutationSuccess();
    void invalidateProducts();
  }

  async function handleDelete(product: Product) {
    if (!client) return;

    setIsDeleting(true);
    try {
      await adminDeleteProduct(client, product.id);
      toast.success(`"${product.name}" deleted successfully.`);
      handleMutationSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("This product is referenced by existing orders and cannot be deleted.");
      } else if (err instanceof ApiError && err.status === 404) {
        toast.error("Product not found. It may have already been deleted.");
        handleMutationSuccess();
      } else {
        toast.error("Failed to delete the product. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  // Optimistic availability toggle:
  // 1. Flip the product in the admin cache immediately so the toggle responds
  //    without waiting for the server.
  // 2. Track each product's in-flight state independently — toggling product A
  //    never disables or clears the loading state of product B.
  // 3. On success, invalidate both caches to pull the authoritative value.
  // 4. On failure, revert only this product to its original server-backed state.
  async function handleToggleAvailability(product: Product) {
    if (!client) return;
    // Prevent a duplicate request for the same product while one is in-flight.
    if (togglingIds.current.has(product.id)) return;

    const nextValue = !product.isAvailable;

    queryClient.setQueryData<Product[]>(
      ["admin", "products"],
      (prev) =>
        prev?.map((p) =>
          p.id === product.id ? { ...p, isAvailable: nextValue } : p
        ) ?? prev
    );

    startToggle(product.id);

    try {
      await adminSetProductAvailability(client, product.id, nextValue);
      toast.success(`"${product.name}" marked as ${nextValue ? "available" : "unavailable"}.`);
      void invalidateProducts();
    } catch (err) {
      // Revert the optimistic update, but only if the cache still holds the
      // value we wrote. A background refetch may have replaced it with a
      // newer authoritative value — in that case the rollback is a no-op.
      queryClient.setQueryData<Product[]>(
        ["admin", "products"],
        (prev) =>
          prev?.map((p) =>
            p.id === product.id && p.isAvailable === nextValue
              ? { ...p, isAvailable: !nextValue }
              : p
          ) ?? prev
      );

      if (err instanceof ApiError && err.status === 404) {
        toast.error("Product not found.");
        void invalidateProducts();
      } else {
        toast.error("Failed to update availability. Please try again.");
      }
    } finally {
      endToggle(product.id);
    }
  }

  return {
    // Return a copied snapshot so consumers always get an immutable value
    // for this render. forceUpdate ensures a re-render on every change.
    togglingIds: new Set(togglingIds.current),
    isDeleting,
    handleDelete,
    handleToggleAvailability,
    handleMutationSuccess,
  };
}
