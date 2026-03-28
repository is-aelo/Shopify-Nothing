"use client";

import { useEffect } from 'react';

export default function ProductClientPage({ product }: { product: any }) {
  // Safeguard: If Shopify returns nothing
  if (!product) {
    return <div className="pt-40 text-center font-ndot text-xs">ERR: UNIT_NOT_FOUND</div>;
  }

  useEffect(() => {
    // Technical Recording for Search History
    const rawHistory = localStorage.getItem('recentlyViewed');
    const history = rawHistory ? JSON.parse(rawHistory) : [];
    const filtered = history.filter((item: any) => item.id !== product.id);
    const newHistory = [product, ...filtered].slice(0, 5);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(newHistory));
  }, [product]);

  return (
    <main className="min-h-screen bg-white pt-32 px-6">
      <div className="max-w-7xl mx-auto">
        <span className="font-ntypeMono text-[10px] uppercase tracking-[0.3em] text-black/40">
          Unit_ID: {product.handle}
        </span>
        <h1 className="font-ndot text-5xl md:text-7xl uppercase mt-4 text-black">
          {product.title}
        </h1>
        {/* Render your other product details here */}
      </div>
    </main>
  );
}