export function EmptyState({
  title = "Nothing here yet",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2 text-center">
      <p className="font-bebas text-2xl tracking-wide text-charcoal">{title}</p>
      {description && <p className="text-sm text-warmgray max-w-sm">{description}</p>}
    </div>
  );
}