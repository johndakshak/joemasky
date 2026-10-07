import Image from "next/image";
import { getProductById } from "@/lib/api/product";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await getProductById(Number(id));
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-8 py-10 md:py-14">
      <div className="flex flex-col md:flex-row md:items-stretch gap-10 md:gap-14">

        {/* Product Image */}
        <div className="w-full md:w-[400px] shrink-0">
          <div className="relative w-full h-72 md:h-full min-h-[320px] bg-archive overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-warmgray mb-2">
            {product.category.name}
          </p>

          <h1 className="font-bebas text-4xl tracking-wide mb-2">
            {product.name}
          </h1>

          <p className="text-warmgray mb-5">
            ₦{Number(product.price).toLocaleString()}
          </p>

          {product.description && (
            <p className="text-sm mb-6">{product.description}</p>
          )}

          <AddToCart
            isAvailable={product.isAvailable}
            sizes={product.sizes}
            colors={product.colors}
          />
        </div>

      </div>
    </main>
  );
}