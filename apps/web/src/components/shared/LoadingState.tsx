export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-warmgray">
      <div className="h-6 w-6 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}