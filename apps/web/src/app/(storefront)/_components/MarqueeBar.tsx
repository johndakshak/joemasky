/**
 * Scrolling marquee strip — pure CSS animation, no JS required.
 * The inner div is duplicated so the loop is seamless: translate goes from
 * 0 → -50%, which brings the second copy into view exactly as the first exits.
 */

const items = [
  "New Collection",
  "Joe Masky Caps & Bags",
  "Premium Footwear",
  "Headwear",
  "Bags",
  "Proudly Nigerian",
  "New Collection",
  "Joe Masky Caps & Bags",
  "Premium Footwear",
  "Headwear",
  "Bags",
  "Proudly Nigerian",
];

export function MarqueeBar() {
  return (
    <div
      className="overflow-hidden border-y border-charcoal/10 py-4 bg-charcoal"
      aria-hidden="true"
    >
      <div className="flex gap-12 whitespace-nowrap animate-marquee">
        {items.map((item, i) => (
          <span key={i} className="shrink-0 flex items-center gap-12">
            <span className="text-[0.7rem] tracking-widest uppercase text-cream font-barlow">
              {item}
            </span>
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
