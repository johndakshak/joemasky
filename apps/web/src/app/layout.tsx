import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  title: "Joe Masky — Caps & Bags",
  description: "Premium caps and bags for the Nigerian market.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className={`${bebasNeue.variable} ${barlow.variable} h-full antialiased`} lang="en">
      <body className="min-h-full flex flex-col font-barlow">
        <QueryProvider>
          <Header />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}