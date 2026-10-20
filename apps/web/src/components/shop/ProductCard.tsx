import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="relative overflow-hidden bg-archive group block cursor-pointer">
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

      {/* Hover darkening overlay — kept for visual effect */}
      <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/25 transition-all duration-300" />

      <div className="pt-3 pb-2 px-1">
        <h4 className="text-[0.82rem] tracking-[0.06em] font-normal mb-1">{product.name}</h4>
        <p className="text-[0.78rem] text-warmgray">₦{Number(product.price).toLocaleString()}</p>
      </div>
    </Link>
  );
}