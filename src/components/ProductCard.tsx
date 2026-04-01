"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ShoppingBag, Check } from "lucide-react";
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

// ── Internal Sub-Component: Refined Add to Basket ──────────────────────────
function AddToBasketButton({ product, variant }: { product: any; variant: any }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (added) return;

    addItem({
      id: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      price: variant.price,
      image: product.images?.edges?.[0]?.node?.url,
      quantity: 1,
      handle: product.handle,
      allVariants: product.variants?.edges?.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        price: edge.node.price,
        image: edge.node.image?.url
      })) || []
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setHovered(false);
    }, 2200);
  }

  const isExpanded = hovered || added;

  return (
    <motion.button
      onHoverStart={() => !added && setHovered(true)}
      onHoverEnd={() => !added && setHovered(false)}
      onClick={handleClick}
      animate={{
        width: isExpanded 
          ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 90 : 110) 
          : (typeof window !== 'undefined' && window.innerWidth < 768 ? 36 : 34),
        backgroundColor: added ? '#07080F' : isExpanded ? '#07080F' : '#FFFFFF',
        borderColor: added ? '#07080F' : isExpanded ? '#07080F' : '#E1E2E3',
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-9 w-9 md:h-8 md:w-8 rounded-full border flex items-center justify-center overflow-hidden shrink-0 pointer-events-auto"
    >
      <motion.span 
        className="flex items-center gap-2 px-1 whitespace-nowrap" 
        animate={{ color: isExpanded ? '#FFFFFF' : '#07080F' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!added ? (
            <motion.span key="basket" className="flex items-center justify-center">
              <ShoppingBag size={16} strokeWidth={1.5} />
            </motion.span>
          ) : (
            <motion.span key="check" className="flex items-center justify-center">
              <Check size={14} strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
        {isExpanded && (
          <motion.span className="font-ndot text-[9px] md:text-[10px] uppercase tracking-tight leading-none pr-2">
            {added ? 'Added' : 'Add'}
          </motion.span>
        )}
      </motion.span>
    </motion.button>
  );
}

// ── Main ProductCard Component ──────────────────────────────────────────────
export default function ProductCard({ product }: { product: any }) {
  const variant = product.variants?.edges?.[0]?.node;
  const price = variant?.price;
  const compareAtPrice = variant?.compareAtPrice;
  const image = product.images?.edges?.[0]?.node;
  
  const isOnSale = compareAtPrice && Number(compareAtPrice.amount) > Number(price?.amount);
  const discountPercent = isOnSale 
    ? Math.round(((Number(compareAtPrice.amount) - Number(price.amount)) / Number(compareAtPrice.amount)) * 100) 
    : 0;

  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency', 
      currency: currencyCode || 'PHP', 
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <div className="group/card bg-[#FFFFFF] flex flex-col transition-all duration-500 relative overflow-hidden border border-black/[0.08]">
      <Link href={`/products/${product.handle}`} className="absolute inset-0 z-10" />
      
      {/* 1. IMAGE AREA */}
      <div className="relative aspect-square w-full bg-[#F6F6F6] flex items-center justify-center overflow-hidden border-b border-black/[0.08]">
        {/* SALE BADGE - Updated to N% OFF */}
        {isOnSale && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-[#07080F] text-[#FFFFFF] font-ndot text-[10px] md:text-[12px] px-2.5 py-1.5 uppercase tracking-[0.1em] leading-none rounded-sm">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        <motion.div 
          whileHover={{ scale: 1.05 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          className="w-full h-full p-10 md:p-14 flex items-center justify-center"
        >
          {image?.url ? (
            <img 
              src={image.url} 
              alt={product.title} 
              className="w-full h-full object-contain mix-blend-multiply" 
            />
          ) : (
            <span className="font-ntypeMono text-[8px] opacity-20 uppercase tracking-widest">Asset_Missing</span>
          )}
        </motion.div>
      </div>

      {/* 2. TEXT CONTENT AREA */}
      <div className="p-5 md:p-7 flex flex-col flex-grow bg-white">
        <div className="flex justify-between items-start mb-6 md:mb-8">
          <h2 className="font-ndot text-[13px] md:text-[18px] uppercase text-[#07080F] leading-tight max-w-[80%] tracking-tight line-clamp-2">
            {product.title}
          </h2>
          
          <div className="z-20 p-2 border border-black/[0.08] rounded-full bg-white hover:bg-[#07080F] hover:text-white transition-all duration-300">
            <Link href={`/products/${product.handle}`}>
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-center pt-5 border-t border-black/[0.05]">
          <div className="flex flex-col gap-1">
            {isOnSale && (
              <span className="font-ndot text-[11px] md:text-[13px] text-black/30 line-through tracking-tighter leading-none">
                {formatCurrency(compareAtPrice.amount, compareAtPrice.currencyCode)}
              </span>
            )}
            <span className="font-ndot text-[16px] md:text-[20px] text-[#07080F] tracking-tight leading-none">
              {price ? formatCurrency(price.amount, price.currencyCode) : 'TBD'}
            </span>
          </div>

          <div className="z-20">
            <AddToBasketButton product={product} variant={variant} />
          </div>
        </div>
      </div>
    </div>
  );
}