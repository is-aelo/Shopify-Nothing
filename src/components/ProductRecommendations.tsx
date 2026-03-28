"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface RecommendedProduct {
  id: string;
  title: string;
  handle: string;
  variants: {
    edges: Array<{
      node: {
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string; currencyCode: string };
      };
    }>;
  };
  images: {
    edges: Array<{
      node: { url: string; altText: string };
    }>;
  };
}

interface ProductRecommendationsProps {
  related: RecommendedProduct[];
  complementary: RecommendedProduct[];
}

export default function ProductRecommendations({ related = [], complementary = [] }: ProductRecommendationsProps) {
  // Pagsamahin ang dalawang listahan at tanggalin ang duplicates base sa ID
  const allProducts = Array.from(
    new Map([...related, ...complementary].map((item) => [item.id, item])).values()
  );

  if (allProducts.length === 0) return null;

  const formatPrice = (amt: string, code: string) => 
    new Intl.NumberFormat('en-PH', { 
      style: 'currency', 
      currency: code || 'PHP', 
      maximumFractionDigits: 0 
    }).format(Number(amt));

  return (
    <section className="mt-16 border-t border-black/[0.05] pt-16 max-w-[1440px] mx-auto px-6 md:px-12">
      <div className="flex items-baseline justify-between mb-10">
        <h2 className="font-ndot text-xl md:text-2xl uppercase tracking-tighter">
          {complementary.length > 0 ? "Complete the look" : "You May Also Like"}
        </h2>
        <span className="font-ntypeMono text-[10px] uppercase opacity-30 tracking-[0.2em] italic">
          {allProducts.length} Suggestions
        </span>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-6 pb-10">
        {allProducts.map((product, idx) => {
          const variant = product.variants.edges[0]?.node;
          const price = variant?.price;
          const compareAtPrice = variant?.compareAtPrice;
          const imgUrl = product.images.edges[0]?.node.url;

          return (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex-shrink-0 w-[240px] md:w-[300px] snap-start"
            >
              <Link href={`/products/${product.handle}`} className="group block">
                {/* NEW HOVER EFFECT CONTAINER
                   From scale-110 (thumping) to a clean border fade + subtle image fade
                */}
                <div className="aspect-square bg-[#F9F9F9] border border-black/[0.03] rounded-sm overflow-hidden p-8 flex items-center justify-center mb-4 transition-all duration-500 ease-out group-hover:border-black/10 group-hover:bg-[#f3f3f3]">
                  {imgUrl ? (
                    <img 
                      src={imgUrl} 
                      alt={product.title} 
                      className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-500 group-hover:opacity-80" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 animate-pulse" />
                  )}
                </div>
                
                {/* Product Title - Add subtle hover effect */}
                <h3 className="font-ndot text-xs md:text-sm uppercase tracking-tight mb-1 truncate group-hover:text-black/80 transition-colors">
                  {product.title}
                </h3>
                
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-ntypeMono text-[11px] md:text-[12px] opacity-60">
                    {price ? formatPrice(price.amount, price.currencyCode) : "No price"}
                  </span>
                  {compareAtPrice && Number(compareAtPrice.amount) > Number(price?.amount) && (
                    <span className="font-ntypeMono text-[10px] line-through opacity-20">
                      {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}