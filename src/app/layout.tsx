import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from "react";
import CartDrawer from "@/components/CartDrawer";
import CartRecovery from "@/components/CartRecovery";

// 1. NDot Matrix Fonts
const ndot = localFont({
  src: "./fonts/Ndot57-Regular.woff2",
  variable: "--font-ndot",
});

const ndotCaps = localFont({
  src: "./fonts/Ndot57Caps-Regular.woff2",
  variable: "--font-ndot-caps",
});

// 2. NType (Nothing Type) Fonts
const ntype = localFont({
  src: "./fonts/NType82-Regular.woff2",
  variable: "--font-ntype",
});

const ntypeHeadline = localFont({
  src: "./fonts/NType82-Headline.woff2",
  variable: "--font-ntype-headline",
});

const ntypeMono = localFont({
  src: "./fonts/NType82Mono-Regular.woff2",
  variable: "--font-ntype-mono",
});

export const metadata: Metadata = {
  title: "NOTHING (R) | PH",
  description: "A headless Shopify storefront with Nothing aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`
          ${ndot.variable} 
          ${ndotCaps.variable} 
          ${ntype.variable} 
          ${ntypeHeadline.variable} 
          ${ntypeMono.variable} 
          min-h-full flex flex-col bg-pureWhite text-black
        `}
      >
        {/* CartRecovery needs Suspense because useSearchParams() 
          triggers client-side rendering during the build process.
        */}
        <Suspense fallback={null}>
          <CartRecovery />
        </Suspense>

        {/* Main Content */}
        {children}

        {/* Global Cart Drawer Overlay */}
        <CartDrawer />
      </body>
    </html>
  );
}