export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <p className="text-sm text-warmgray">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs tracking-[0.18em] uppercase text-charcoal border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-cream transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}