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

    // Actual Cart Logic - Updated to match ProductActionMenu structure for consistency
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
          ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 120) 
          : (typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 38),
        backgroundColor: added ? '#07080F' : isExpanded ? '#07080F' : '#FFFFFF',
        borderColor: added ? '#07080F' : isExpanded ? '#07080F' : '#E1E2E3',
      }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-10 w-10 md:h-9 md:w-9 rounded-full border flex items-center justify-center overflow-hidden shrink-0 pointer-events-auto"
    >
      <motion.span 
        className="flex items-center gap-2 px-1 whitespace-nowrap" 
        animate={{ color: isExpanded ? '#FFFFFF' : '#07080F' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!added ? (
            <motion.span 
              key="basket" 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center"
            >
              <ShoppingBag size={18} strokeWidth={1.5} className="md:w-4 md:h-4" />
            </motion.span>
          ) : (
            <motion.span 
              key="check" 
              initial={{ opacity: 0, scale: 0.5 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center justify-center"
            >
              <Check size={16} strokeWidth={2.5} className="md:w-3.5 md:h-3.5" />
            </motion.span>
          )}
        </AnimatePresence>

        {isExpanded && (
          <motion.span 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-ndot text-[10px] md:text-[11px] uppercase tracking-tight leading-none -mb-[1px] pr-2"
          >
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
    <div className="group/card bg-[#FFFFFF] p-4 md:p-10 flex flex-col transition-all duration-500 relative overflow-hidden border border-[#E1E2E3]">
      <Link href={`/products/${product.handle}`} className="absolute inset-0 z-0" />
      
      {isOnSale && (
        <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
          <span className="bg-[#07080F] text-[#FFFFFF] font-ndot text-[8px] md:text-[11px] px-2 py-1.5 md:px-3 md:py-2 uppercase tracking-widest leading-none rounded-sm flex items-center justify-center">
            -{discountPercent}%
          </span>
        </div>
      )}

      <div className="aspect-square w-full mb-4 md:mb-14 flex items-center justify-center overflow-hidden pointer-events-none">
        <motion.div 
          whileHover={{ scale: 1.04 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          className="w-full h-full flex items-center justify-center"
        >
          {image?.url ? (
            <img src={image.url} alt={product.title} className="w-[88%] h-[88%] object-contain mix-blend-multiply" />
          ) : (
            <div className="font-ntypeMono text-[8px] text-[#373B3B] opacity-40 italic uppercase tracking-widest text-center">
              Asset_Missing
            </div>
          )}
        </motion.div>
      </div>

      <div className="mt-auto relative z-10 pointer-events-none">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <h2 className="font-ndot text-[11px] md:text-2xl uppercase text-[#07080F] leading-normal md:leading-tight max-w-[80%] tracking-tight line-clamp-2 min-h-[32px] md:min-h-[3rem]">
            {product.title}
          </h2>
          
          <div className="pointer-events-auto p-2 md:p-2.5 border border-[#E1E2E3] rounded-full bg-[#FFFFFF] hover:bg-[#07080F] hover:text-[#FFFFFF] transition-all duration-500 transform group-hover/card:scale-105 text-[#07080F]">
            <Link href={`/products/${product.handle}`}>
              <ArrowUpRight size={14} strokeWidth={1.5} className="md:w-5 md:h-5" />
            </Link>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 md:pt-5 border-t border-[#E1E2E3]">
          <div className="flex flex-col justify-center">
            {isOnSale && (
              <span className="font-ndot text-[9px] md:text-[12px] text-[#373B3B] opacity-50 line-through tracking-tighter mb-0.5 leading-none">
                {formatCurrency(compareAtPrice.amount, compareAtPrice.currencyCode)}
              </span>
            )}
            <span className="font-ndot text-[15px] md:text-xl text-[#07080F] tracking-tight leading-none -mb-[1px]">
              {price ? formatCurrency(price.amount, price.currencyCode) : 'TBD'}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center justify-end min-w-[42px]">
            <AddToBasketButton product={product} variant={variant} />
          </div>
        </div>
      </div>
    </div>
  );
}