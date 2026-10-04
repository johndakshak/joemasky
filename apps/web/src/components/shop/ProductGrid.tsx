"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function ProductGrid() {
  const { data: products, isLoading, isError, refetch } = useProducts();

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}