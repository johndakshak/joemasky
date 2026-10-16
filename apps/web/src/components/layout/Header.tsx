"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PageContainer } from "./Page-Container";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#shop", label: "Shop" },
  { href: "/#collections", label: "Collections" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((state) => state.items.length);

  useEffect(() => {
    setMounted(true);

    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);  

  return (
    <header className={`sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-charcoal/[.06] transition-all duration-300 ${scrolled ? "py-1" : ""}`}>
      <PageContainer>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center h-11">
            <Logo className="h-11 w-auto" />
          </Link>

          <nav className="hidden md:flex gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-xs tracking-[0.18em] uppercase text-charcoal"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-charcoal scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-charcoal hover:text-gold">
              <Search className="h-[17px] w-[17px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              nativeButton={false}
              render={<Link href="/cart" />}
              className="relative text-charcoal hover:text-gold"
            >
              <ShoppingCart className="h-[17px] w-[17px]" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-charcoal text-[0.5rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Sheet>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden text-charcoal" />}
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="bg-charcoal border-none [&_[data-slot=sheet-close]]:text-cream [&_[data-slot=sheet-close]]:hover:text-cream/70">
                <SheetHeader>
                  <SheetTitle className="font-bebas text-2xl text-cream tracking-wider">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-6 px-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="font-bebas text-3xl tracking-widest text-cream hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}