"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, CreditCard } from "@phosphor-icons/react";

export default function ProductClientPage({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center font-ndot text-xs uppercase tracking-widest text-black/20">
          PRODUCT NOT FOUND
        </div>
      </>
    );
  }

  // Formatting for the price & discount logic
  const variant = product.variants?.edges?.[0]?.node;
  const price = variant?.price;
  const compareAtPrice = variant?.compareAtPrice;
  const image = product.images?.edges?.[0]?.node?.url;

  // Calculate if it's on sale
  const isOnSale = compareAtPrice && Number(compareAtPrice.amount) > Number(price?.amount);
  const discountPercentage = isOnSale 
    ? Math.round(((Number(compareAtPrice.amount) - Number(price.amount)) / Number(compareAtPrice.amount)) * 100)
    : 0;

  const formatPrice = (amt: string, code: string) => 
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: code || 'PHP' }).format(Number(amt));

  return (
    <>
      <Header />

      <main className="min-h-screen bg-white pt-24 pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* LEFT: IMAGE CONTAINER */}
            <div className="lg:sticky lg:top-32 relative">
              {isOnSale && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-red-600 text-white font-ndot text-[10px] px-3 py-1.5 uppercase tracking-widest rounded-sm shadow-xl">
                    -{discountPercentage}% OFF
                  </span>
                </div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square bg-[#F9F9F9] rounded-sm flex items-center justify-center overflow-hidden p-12 border border-black/[0.03]"
              >
                {image ? (
                  <img 
                    src={image} 
                    alt={product.title} 
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 hover:scale-110" 
                  />
                ) : (
                  <span className="font-ntypeMono text-[10px] opacity-20 uppercase">No Asset Available</span>
                )}
              </motion.div>
            </div>

            {/* RIGHT: INFO & SPECS */}
            <div className="flex flex-col">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 border-b border-black/[0.05] pb-10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <p className="font-ntypeMono text-[10px] uppercase tracking-[0.3em] text-black/40">Technical Manifest / Unit_01</p>
                </div>
                
                <h1 className="font-ndot text-5xl md:text-7xl uppercase text-black leading-none mb-6 tracking-tight">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-4">
                  <span className="font-ndot text-4xl text-black">
                    {formatPrice(price?.amount, price?.currencyCode)}
                  </span>
                  
                  {isOnSale && (
                    <span className="font-ntypeMono text-lg text-black/20 line-through decoration-1">
                      {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* DESCRIPTION SECTION */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="prose prose-sm prose-neutral max-w-none 
                           font-ntypeMono text-black/60 leading-relaxed
                           [&_b]:font-ndot [&_b]:text-black [&_b]:uppercase [&_b]:tracking-widest [&_b]:text-[13px] [&_b]:block [&_b]:mt-8
                           [&_ul]:list-none [&_ul]:pl-0 [&_ul]:space-y-4 [&_ul]:mt-4
                           [&_li]:relative [&_li]:pl-6
                           [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[8px] [&_li]:before:w-[5px] [&_li]:before:h-[5px] [&_li]:before:bg-black [&_li]:before:rounded-full
                           [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
              />
            </div>
          </div>
        </div>

        {/* FIXED BOTTOM ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="max-w-2xl mx-auto bg-white border border-black/10 rounded-full p-2 shadow-2xl flex items-center gap-2 pointer-events-auto backdrop-blur-md"
          >
            {/* Quantity Selector */}
            <div className="flex items-center border border-black/5 rounded-full h-12 px-3 bg-[#F9F9F9]">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:opacity-40 transition-opacity">
                <Minus size={14} />
              </button>
              <span className="font-ndot text-sm w-12 text-center tabular-nums">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:opacity-40 transition-opacity">
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart */}
            <button className="flex-1 bg-white border border-black/10 text-black h-12 rounded-full font-ndot uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all active:scale-[0.98]">
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Add to Basket</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Buy Now (with subtle price feedback) */}
            <button className="flex-1 bg-black text-white h-12 rounded-full font-ndot uppercase tracking-widest text-[10px] flex flex-col items-center justify-center leading-none hover:bg-[#333] transition-all active:scale-[0.98] px-4">
              <div className="flex items-center gap-2">
                <CreditCard size={18} />
                <span>Buy Now</span>
              </div>
              {isOnSale && (
                <span className="text-[8px] opacity-60 mt-1 tracking-tighter">
                  Save {formatPrice((Number(compareAtPrice.amount) - Number(price.amount)).toString(), price?.currencyCode)}
                </span>
              )}
            </button>
          </motion.div>
        </div>
      </main>
    </>
  );
}