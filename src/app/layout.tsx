import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce PoC | Products",
  description:
    "Digital and physical products — a proof of concept for Stripe Checkout with Sanity CMS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-border bg-card">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors"
            >
              Store
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Products
            </Link>
          </nav>
        </header>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
