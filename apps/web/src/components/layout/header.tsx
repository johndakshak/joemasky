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
import { PageContainer } from "./page-container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-xl border-b border-charcoal/[.06]">
      <PageContainer>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-bebas text-2xl tracking-wider text-charcoal">
            JeoMasky
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
            <Button variant="ghost" size="icon" className="text-charcoal hover:text-gold">
              <ShoppingCart className="h-[17px] w-[17px]" />
            </Button>

            <Sheet>
                <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden text-charcoal" />}
                >
                    <Menu className="h-5 w-5" />
                </SheetTrigger>
              <SheetContent side="right" className="bg-charcoal border-none">
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