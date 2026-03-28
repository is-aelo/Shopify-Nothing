"use client";

import { motion } from 'framer-motion';
import { Plus, Minus, CreditCard, ShoppingBag } from "lucide-react";
import { useCartStore } from '@/store/useCartStore';

interface ProductActionMenuProps {
  product: any;
  quantity: number;
  setQuantity: (quantity: number) => void;
  selectedVariant: any;
  isOnSale: boolean;
  savingsAmount: number;
  price: any;
  handleBuyNow: () => void;
}

export default function ProductActionMenu({
  product,
  quantity,
  setQuantity,
  selectedVariant,
  isOnSale,
  savingsAmount,
  price,
  handleBuyNow
}: ProductActionMenuProps) {

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const formatPrice = (amt: string | number, code: string) => 
    new Intl.NumberFormat('en-PH', { 
      style: 'currency', 
      currency: code || 'PHP',
      maximumFractionDigits: 0 
    }).format(Number(amt));

  const handleAddToBasket = () => {
    if (!selectedVariant) return;

    addItem({
      id: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      image: product.images?.edges?.[0]?.node?.url,
      quantity: quantity,
      handle: product.handle,
      allVariants: product.variants?.edges?.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        price: edge.node.price,
        image: edge.node.image?.url
      })) || []
    });

    openCart();
  };

  return (
    <div className="fixed bottom-6 md:bottom-8 left-0 right-0 z-50 px-4 pointer-events-none">
      <motion.div 
        initial={{ y: 60, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[580px] mx-auto bg-white/80 backdrop-blur-2xl border border-[#E1E2E3] rounded-full p-1.5 md:p-2 shadow-2xl flex items-center gap-1.5 md:gap-2 pointer-events-auto"
      >
        <div className="hidden sm:flex items-center px-4 gap-4 border-r border-[#E1E2E3]">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
            className="hover:opacity-40 transition-opacity text-[#07080F]"
            aria-label="Decrease quantity"
          >
            <Minus size={14} strokeWidth={1.5} />
          </button>
          <span className="font-ndot text-xs w-4 text-center tabular-nums text-[#07080F]">
            {quantity}
          </span>
          <button 
            onClick={() => setQuantity(quantity + 1)} 
            className="hover:opacity-40 transition-opacity text-[#07080F]"
            aria-label="Increase quantity"
          >
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
        
        <button 
          onClick={handleAddToBasket}
          disabled={!selectedVariant}
          className="flex-1 bg-white border border-[#E1E2E3] text-[#07080F] h-10 md:h-12 rounded-full font-ndot uppercase text-[9px] md:text-[10px] tracking-[0.1em] hover:bg-[#F1F1F1] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShoppingBag size={14} strokeWidth={1.5} />
          <span className="hidden xs:inline">Basket</span>
        </button>
        
        <button 
          onClick={handleBuyNow}
          disabled={!selectedVariant}
          className="flex-[1.5] md:flex-[2] bg-[#07080F] text-white h-10 md:h-12 rounded-full font-ndot uppercase tracking-[0.1em] text-[9px] md:text-[10px] flex flex-col items-center justify-center leading-none px-6 md:px-10 shadow-xl active:scale-[0.98] transition-all overflow-hidden disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <CreditCard size={16} strokeWidth={1.5} />
            <span>Buy Now</span>
          </div>
          
          {isOnSale && price && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[8px] md:text-[9px] font-ntypeHeadline font-bold text-white/50 tracking-widest mt-0.5 uppercase"
            >
              SAVE {formatPrice(savingsAmount, price.currencyCode)}
            </motion.span>
          )}
        </button>
      </motion.div>
    </div>
  );
}