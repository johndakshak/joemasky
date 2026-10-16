import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, Barlow, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["300", "400", "500"],
  variable: "--font-barlow",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Joe Masky — Caps & Bags",
  description: "Premium caps and bags for the Nigerian market.",
};

/**
 * Root layout
 *
 * Provides HTML shell, fonts, global providers, and toast notifications.
 * Header and Footer are rendered by the (storefront) route group layout,
 * so admin routes do not inherit storefront navigation.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${bebasNeue.variable} ${barlow.variable} ${cormorant.variable} h-full antialiased`}
      lang="en"
    >
      <body className="min-h-full flex flex-col font-barlow">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
