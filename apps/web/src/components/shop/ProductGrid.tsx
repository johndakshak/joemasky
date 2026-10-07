"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { CategoryFilter } from "./CategoryFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";

export function ProductGrid() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Failed to load products." onRetry={() => refetch()} />;
  }

  if (!products || products.length === 0) {
    return <EmptyState title="No products yet" description="Check back soon." />;
  }

  const visibleProducts =
    selectedCategoryId === null
      ? products
      : products.filter((product) => product.categoryId === selectedCategoryId);

  return (
    <div>
      {categories && categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
      )}

      {visibleProducts.length === 0 ? (
        <EmptyState title="Nothing in this category" description="Try another category." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}