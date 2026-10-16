import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * Storefront layout
 *
 * Wraps all customer-facing pages with the site Header and Footer.
 * Admin routes sit outside this group and do not inherit these components.
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
