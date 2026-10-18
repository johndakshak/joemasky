"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAdminClient } from "@/hooks/useAdminClient";
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/api/adminCategories";
import { ApiError } from "@/lib/api/client";
import type { Category } from "@/types/category";

export function useCategoryMutations(onMutationSuccess: () => void) {
  const client = useAdminClient();
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function invalidateCategories() {
    await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    // Also invalidate the public cache used by the storefront and product form.
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  function handleMutationSuccess() {
    onMutationSuccess();
    void invalidateCategories();
  }

  async function handleCreate(name: string): Promise<boolean> {
    if (!client) return false;

    setIsSaving(true);
    try {
      const created = await adminCreateCategory(client, name);
      toast.success(`"${created.name}" created successfully.`);
      handleMutationSuccess();
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("A category with that name already exists.");
      } else if (err instanceof ApiError && err.status === 400) {
        toast.error(err.message || "Invalid category name.");
      } else {
        toast.error("Failed to create category. Please try again.");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRename(category: Category, name: string): Promise<boolean> {
    if (!client) return false;

    setIsSaving(true);
    try {
      const updated = await adminUpdateCategory(client, category.id, name);
      toast.success(`Renamed to "${updated.name}".`);
      handleMutationSuccess();
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error("A category with that name already exists.");
      } else if (err instanceof ApiError && err.status === 404) {
        toast.error("Category not found. It may have already been deleted.");
        handleMutationSuccess();
      } else if (err instanceof ApiError && err.status === 400) {
        toast.error(err.message || "Invalid category name.");
      } else {
        toast.error("Failed to rename category. Please try again.");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!client) return;

    setIsDeleting(true);
    try {
      await adminDeleteCategory(client, category.id);
      toast.success(`"${category.name}" deleted successfully.`);
      handleMutationSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(
          `"${category.name}" cannot be deleted while products are assigned to it. Reassign or remove those products first.`
        );
      } else if (err instanceof ApiError && err.status === 404) {
        toast.error("Category not found. It may have already been deleted.");
        handleMutationSuccess();
      } else {
        toast.error("Failed to delete category. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    isSaving,
    isDeleting,
    handleCreate,
    handleRename,
    handleDelete,
    handleMutationSuccess,
  };
}
