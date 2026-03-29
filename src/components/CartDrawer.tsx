"use client";

import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { X, Plus, Minus, ShoppingBag, Loader2, ChevronDown, ArrowRight, Lock, Trash2, RotateCcw } from 'lucide-react';
import { createCheckout } from '@/lib/shopify';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeItem, updateVariant, clearCart } = useCartStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Subtotal calculation
  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price.amount) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isRedirecting) return;
    
    setIsRedirecting(true);
    
    try {
      const lineItems = cartItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // Ngayon, ang checkout ay may kasama nang cartId
      const checkout = await createCheckout(lineItems);

      if (checkout?.webUrl && checkout?.cartId) {
        /**
         * REAL-TIME SYNC LOGIC:
         * Ise-save natin ang cartId para ma-verify ng CartRecovery.tsx
         * kung nabayaran na ba ang cart na ito sa Shopify side.
         */
        localStorage.setItem('shopify_cart_id', checkout.cartId);
        localStorage.setItem('nothing_checkout_pending', 'true');
        
        // Redirect to Shopify
        window.location.href = checkout.webUrl;
      } else {
        console.error("Failed to retrieve checkout URL or Cart ID");
        alert("Checkout is currently unavailable. Please try again.");
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("CHECKOUT_ERROR:", error);
      setIsRedirecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[998]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed right-0 top-0 h-[100dvh] w-full sm:max-w-[420px] z-[999] flex flex-col bg-[#F9F9F7] shadow-[-20px_0_80px_rgba(0,0,0,0.1)]"
          >

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 bg-white border-b border-black/[0.07] sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <h2 className="font-ndot text-lg sm:text-xl tracking-tight text-[#07080F] uppercase pt-1">
                  Basket
                </h2>
                {cartItems.length > 0 && (
                  <span className="bg-[#07080F] text-white font-ndot text-[10px] px-2 py-0.5 rounded-full flex items-center justify-center">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {cartItems.length > 0 && !isRedirecting && (
                  <button 
                    onClick={clearCart}
                    className="font-ntype text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 py-2"
                  >
                    <RotateCcw size={12} strokeWidth={2.5} />
                    <span className="xs:inline">Empty basket</span>
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={closeCart}
                  disabled={isRedirecting}
                  className="w-10 h-10 rounded-full bg-black/[0.05] flex items-center justify-center active:bg-black/[0.1] transition-colors disabled:opacity-30"
                >
                  <X size={18} strokeWidth={2} className="text-[#07080F]" />
                </motion.button>
              </div>
            </div>

            {/* ── Item list ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">
              <LayoutGroup>
                <AnimatePresence mode="popLayout" initial={false}>
                  {cartItems.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-black/[0.03] flex items-center justify-center border border-dashed border-black/10">
                        <ShoppingBag size={24} strokeWidth={1} className="text-black/20" />
                      </div>
                      <div>
                        <p className="font-ndot text-xs text-[#07080F] uppercase tracking-[0.2em]">Empty basket</p>
                        <p className="font-ntype text-[11px] text-black/40 mt-1 uppercase tracking-wider">Your inventory is currently zero</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="px-5 py-2">
                      {cartItems.map((item) => (
                        <motion.div
                          layout
                          key={item.variantId}
                          className="flex gap-4 py-6 border-b border-black/[0.07] last:border-b-0"
                        >
                          <div className="w-[80px] h-[80px] xs:w-[90px] xs:h-[90px] flex-shrink-0 bg-white rounded-xl border border-black/[0.05] p-2 shadow-sm">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-ntype text-[12px] font-bold uppercase tracking-tight text-[#07080F] leading-snug line-clamp-2">
                                {item.title}
                              </h3>
                              {!isRedirecting && (
                                <button
                                  onClick={() => removeItem(item.variantId)}
                                  className="text-black/15 hover:text-red-500 p-2 -mr-2 -mt-2 transition-colors"
                                >
                                  <Trash2 size={16} strokeWidth={1.5} />
                                </button>
                              )}
                            </div>

                            <div className="mt-2">
                              {item.allVariants && item.allVariants.length > 1 ? (
                                <div className="relative inline-flex items-center">
                                  <select
                                    disabled={isRedirecting}
                                    value={item.variantId}
                                    onChange={(e) => {
                                      const selected = item.allVariants?.find((v: any) => v.id === e.target.value);
                                      if (selected) updateVariant(item.variantId, selected);
                                    }}
                                    className="appearance-none bg-black/[0.04] rounded-md pl-3 pr-8 py-2 font-ntype text-[10px] font-bold uppercase tracking-wider text-black/50 focus:outline-none min-h-[32px] cursor-pointer disabled:cursor-default"
                                  >
                                    {item.allVariants.map((v: any) => (
                                      <option key={v.id} value={v.id}>{v.title}</option>
                                    ))}
                                  </select>
                                  <ChevronDown size={12} className="absolute right-2.5 text-black/30 pointer-events-none" />
                                </div>
                              ) : (
                                <p className="font-ntype text-[10px] text-black/30 uppercase tracking-widest">
                                  {item.variantTitle !== 'Default Title' ? item.variantTitle : 'Standard'}
                                </p>
                              )}
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                              <div className="flex items-center rounded-lg border border-black/[0.08] bg-white shadow-sm overflow-hidden">
                                <button
                                  disabled={isRedirecting}
                                  onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors disabled:opacity-30"
                                >
                                  <Minus size={12} strokeWidth={2.5} />
                                </button>
                                <span className="w-8 text-center font-ndot text-[12px] text-[#07080F] select-none">{item.quantity}</span>
                                <button
                                  disabled={isRedirecting}
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                  className="w-10 h-10 flex items-center justify-center border-l border-black/5 hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors disabled:opacity-30"
                                >
                                  <Plus size={12} strokeWidth={2.5} />
                                </button>
                              </div>
                              <span className="font-ndot text-[15px] tracking-tight text-[#07080F]">
                                {item.price.currencyCode} {(Number(item.price.amount) * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </LayoutGroup>
            </div>

            {/* ── Footer ── */}
            {cartItems.length > 0 && (
              <div className="bg-white border-t border-black/[0.07] px-6 xs:px-8 pt-6 pb-8 sm:pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex flex-col">
                    <span className="font-ntype text-[10px] text-black/30 font-bold uppercase tracking-[0.2em] mb-1">Subtotal</span>
                    <motion.span
                      key={subtotal}
                      className="font-ndot text-3xl tracking-tighter text-[#07080F]"
                    >
                      {cartItems[0].price.currencyCode} {subtotal.toLocaleString()}
                    </motion.span>
                  </div>
                </div>

                <p className="font-ntype text-[10px] text-black/40 uppercase tracking-widest leading-relaxed mb-6">
                  Shipping & taxes calculated at checkout
                </p>

                <motion.button
                  onClick={handleCheckout}
                  disabled={isRedirecting}
                  whileTap={{ scale: 0.96 }}
                  className="w-full bg-[#07080F] text-white rounded-[12px] py-5 sm:py-6 flex items-center justify-center gap-3 shadow-xl shadow-black/10 transition-all hover:bg-black/90 disabled:bg-black/40 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="animate-spin text-white/70" size={20} />
                      <span className="font-ndot text-[13px] tracking-[0.3em] uppercase pt-0.5">Redirecting...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-ndot text-[13px] tracking-[0.3em] uppercase pt-0.5">Proceed To Checkout</span>
                      <ArrowRight size={18} strokeWidth={2} className="opacity-60" />
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-center gap-2 mt-6">
                  <Lock size={12} className="text-black/20" />
                  <span className="font-ntype text-[9px] text-black/30 uppercase tracking-[0.2em] font-bold">
                    Secure checkout enabled
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}