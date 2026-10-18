"use client";

import { useState } from "react";
import { acceptOrder, declineOrder } from "@/lib/api/order";
import { ApiError } from "@/lib/api/client";
import type { Order } from "@/types/order";

interface OrderActionsProps {
  publicToken: string;
  // Called with the updated order returned by the API after a successful action.
  onUpdate: (updated: Order) => void;
}

export function OrderActions({ publicToken, onUpdate }: OrderActionsProps) {
  // Which action is currently in flight: "accept" | "decline" | null
  const [pending, setPending] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: "accept" | "decline") {
    setError(null);
    setPending(action);

    try {
      const updated =
        action === "accept"
          ? await acceptOrder(publicToken)
          : await declineOrder(publicToken);

      onUpdate(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="text-red-500 shrink-0 mt-px"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[0.78rem] text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Accept — gold primary */}
        <button
          type="button"
          onClick={() => handleAction("accept")}
          disabled={pending !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-[10px] bg-gold text-charcoal py-[1rem] px-6 text-[0.78rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:bg-goldlt hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(200,160,48,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
        >
          {pending === "accept" ? (
            <>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="animate-spin"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Accepting…
            </>
          ) : (
            <>
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Accept Order
            </>
          )}
        </button>

        {/* Decline — outlined secondary */}
        <button
          type="button"
          onClick={() => handleAction("decline")}
          disabled={pending !== null}
          className="flex-1 flex items-center justify-center gap-2 rounded-[10px] border border-charcoal/20 text-charcoal py-[1rem] px-6 text-[0.78rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:border-red-400 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {pending === "decline" ? (
            <>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="animate-spin"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Declining…
            </>
          ) : (
            <>
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Decline Order
            </>
          )}
        </button>
      </div>

      <p className="text-[0.68rem] text-warmgray text-center mt-3 leading-relaxed">
        Accepting confirms you&apos;re happy with the revised quantities and available items.
        Declining cancels the order entirely.
      </p>
    </div>
  );
}
