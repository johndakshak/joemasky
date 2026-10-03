import Link from "next/link";
import { Logo } from "./Logo";

const shopLinks = [
  { href: "/shop", label: "All Products" },
  { href: "#", label: "Footwear" },
  { href: "#", label: "Caps" },
  { href: "#", label: "Bags" },
  { href: "#", label: "Menswear" },
  { href: "#", label: "Limited Editions" },
];

const infoLinks = [
  { href: "#", label: "About Us" },
  { href: "#", label: "Our Story" },
  { href: "#", label: "Size Guide" },
  { href: "#", label: "Shipping Policy" },
  { href: "#", label: "Returns & Refunds" },
  { href: "#", label: "FAQs" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Logo className="h-16 w-auto mb-6" />
            <p className="text-sm leading-relaxed mb-6 text-white/45">
              Premium caps and bags designed for those who lead. Proudly Nigerian. Globally inspired.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"                
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center border border-gold/20 text-gold/40 transition-colors hover:border-gold/60 hover:text-gold/70"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"                
                aria-label="Twitter/X"
                className="w-9 h-9 flex items-center justify-center border border-gold/20 text-gold/40 transition-colors hover:border-gold/60 hover:text-gold/70"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.733-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"                
                aria-label="WhatsApp"
                className="w-9 h-9 flex items-center justify-center border border-gold/20 text-gold/40 transition-colors hover:border-gold/60 hover:text-gold/70"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-gold">Shop</h4>
            <ul className="space-y-3 list-none p-0">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-gold">Information</h4>
            <ul className="space-y-3 list-none p-0">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 transition-colors hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-6 text-gold">Contact Us</h4>
            <ul className="space-y-4 list-none p-0">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#C8880A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="text-sm text-white/50">Lagos & Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0 text-[#C8880A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <a href="tel:+2340000000000" className="text-sm text-white/50 transition-colors hover:text-gold">
                  +234 000 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0 text-[#C8880A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:hello@joemasky.com" className="text-sm text-white/50 transition-colors hover:text-gold">
                  hello@joemasky.com
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <p className="text-xs font-bold tracking-widest uppercase mb-3 text-gold/40">We Accept</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-bold border border-gold/20 text-white/40">Cash</span>
                <span className="px-3 py-1 text-xs font-bold border border-gold/20 text-white/40">Card Payment</span>
                <span className="px-3 py-1 text-xs font-bold border border-gold/20 text-white/40">Transfer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent mt-14 mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© 2025 Joe Masky Caps & Bags®. All rights reserved.</p>
          <p className="text-xs text-white/20">Crafted with pride in Nigeria 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}