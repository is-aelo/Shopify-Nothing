import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Load Nothing Dot Matrix font
const ndot = localFont({
  src: "./fonts/Ndot57-Regular.woff2",
  variable: "--font-ndot",
});

// Load Nothing secondary font
const ntype = localFont({
  src: "./fonts/NType82-Regular.woff2",
  variable: "--font-ntype",
});

export const metadata: Metadata = {
  title: "NOTHING (R) STORE",
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
        className={`${ndot.variable} ${ntype.variable} min-h-full flex flex-col bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}