export function ProductCardSkeleton() {
  return (
    <div className="bg-archive animate-pulse">
      <div className="aspect-[3/4] bg-charcoal/10" />
      <div className="pt-3 pb-2 px-1 space-y-2">
        <div className="h-3 bg-charcoal/10 w-3/4" />
        <div className="h-3 bg-charcoal/10 w-1/3" />
      </div>
    </div>
  );
}