import Image from "next/image";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="relative overflow-hidden bg-archive group">
      {!product.isAvailable && (
        <span className="absolute top-3 left-3 z-10 bg-charcoal text-cream text-[0.6rem] tracking-[0.2em] uppercase px-2 py-1 font-medium">
          Unavailable
        </span>
      )}

      <div className="overflow-hidden aspect-[3/4]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={500}
          height={667}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
        />
      </div>

      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/25 transition-all duration-300 flex items-end justify-center pb-5">
        <button
          disabled={!product.isAvailable}
          className="opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-cream text-charcoal px-5 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
      </div>

      <div className="pt-3 pb-2 px-1">
        <h4 className="text-[0.82rem] tracking-[0.06em] font-normal mb-1">{product.name}</h4>
        <p className="text-[0.78rem] text-warmgray">₦{Number(product.price).toLocaleString()}</p>
      </div>
    </div>
  );
}