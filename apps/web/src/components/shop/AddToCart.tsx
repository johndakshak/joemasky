"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

type OptionGroupProps = {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
};

function OptionGroup({ label, options, selected, onSelect }: OptionGroupProps) {
  return (
    <div className="mb-5">
      <p className="text-xs uppercase tracking-widest text-warmgray mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`min-w-11 h-11 px-3 text-sm border transition-colors ${
              selected === option
                ? "bg-gold text-charcoal border-gold"
                : "border-charcoal/25 text-charcoal hover:border-gold"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

type AddToCartProps = {
  productId: number;
  isAvailable: boolean;
  sizes: string[];
  colors: string[];
};

export function AddToCart({ productId, isAvailable, sizes, colors }: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const needsSize = sizes.length > 0 && !selectedSize;
  const needsColor = colors.length > 0 && !selectedColor;

  let buttonLabel = "Add to Cart";
  if (!isAvailable) buttonLabel = "Unavailable";
  else if (needsSize) buttonLabel = "Select a size";
  else if (needsColor) buttonLabel = "Select a color";

  return (
    <div>
      {sizes.length > 0 && (
        <OptionGroup label="Size" options={sizes} selected={selectedSize} onSelect={setSelectedSize} />
      )}

      {colors.length > 0 && (
        <OptionGroup label="Color" options={colors} selected={selectedColor} onSelect={setSelectedColor} />
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-charcoal/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-sm"
          >
            −
          </button>
          <span className="px-4 text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 text-sm"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            addItem(productId, quantity, selectedSize, selectedColor);
            toast.success("Added to cart", {
              className: "!bg-green-600 !text-white !border-green-600",
            });
          }}        
          disabled={!isAvailable || needsSize || needsColor}
          className="bg-gold text-charcoal px-10 py-4 text-xs tracking-[0.18em] uppercase transition-colors enabled:cursor-pointer enabled:hover:bg-goldlt disabled:opacity-50 disabled:cursor-not-allowed"
          >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}