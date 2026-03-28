"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, ChevronDown, Eraser } from 'lucide-react';
import { createCheckout } from '@/lib/shopify';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeItem, updateVariant, clearCart } = useCartStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price.amount) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsRedirecting(true);
    try {
      const lineItems = cartItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));
      const checkout = await createCheckout(lineItems);
      if (checkout?.webUrl) window.location.href = checkout.webUrl;
    } catch (error) {
      console.error("CHECKOUT_ERROR:", error);
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white border-l border-black/[0.08] z-[999] flex flex-col shadow-2xl"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-black/[0.08] flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <span className="font-ndot text-xl uppercase tracking-widest text-[#07080F]">Basket</span>
                <span className="bg-[#07080F] text-white text-[10px] px-2 py-0.5 rounded-full font-ndot">
                  {cartItems.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button onClick={clearCart} className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-ndot uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Eraser size={14} />
                    <span className="hidden xs:inline">Clear</span>
                  </button>
                )}
                <button onClick={closeCart} className="p-2 hover:bg-black/[0.03] rounded-full transition-colors">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-ntypeMono text-[10px] uppercase tracking-widest">Your basket is empty</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="flex gap-4">
                      {/* IMAGE - KEY TRICK TO RE-ANIMATE ON CHANGE */}
                      <div className="w-24 h-24 bg-black/[0.02] border border-black/[0.05] rounded-sm overflow-hidden flex-shrink-0">
                        <AnimatePresence mode="wait">
                          <motion.img 
                            key={item.image}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-contain mix-blend-multiply p-2" 
                          />
                        </AnimatePresence>
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-[11px] font-bold uppercase tracking-tight text-[#07080F] line-clamp-2 pr-4">{item.title}</h3>
                            <button onClick={() => removeItem(item.variantId)} className="text-black/60 hover:text-red-600 transition-colors">
                              <Trash2 size={15} strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* VARIANT DROP DOWN - CLEANER UI */}
                          <div className="mt-2">
                            {item.allVariants && item.allVariants.length > 1 ? (
                              <div className="relative inline-flex items-center bg-black/[0.04] rounded px-2 py-1 group cursor-pointer border border-transparent hover:border-black/10">
                                <select 
                                  value={item.variantId}
                                  onChange={(e) => {
                                    const selected = item.allVariants.find((v: any) => v.id === e.target.value);
                                    if (selected) updateVariant(item.variantId, selected);
                                  }}
                                  className="appearance-none bg-transparent text-[10px] text-gray-800 font-bold uppercase tracking-widest font-ntypeMono pr-5 cursor-pointer focus:outline-none"
                                >
                                  {item.allVariants.map((v: any) => (
                                    <option key={v.id} value={v.id} className="text-black bg-white">{v.title}</option>
                                  ))}
                                </select>
                                <ChevronDown size={10} className="absolute right-1.5 text-gray-600" />
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider font-ntypeMono">
                                {item.variantTitle !== 'Default Title' ? item.variantTitle : 'Standard Edition'}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center border border-black/[0.1] rounded-sm bg-white">
                            <button onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))} className="p-1.5 hover:bg-black/[0.03] border-r border-black/[0.1]"><Minus size={10} strokeWidth={2.5} /></button>
                            <span className="w-8 text-center text-[10px] font-ndot pt-0.5">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1.5 hover:bg-black/[0.03] border-l border-black/[0.1]"><Plus size={10} strokeWidth={2.5} /></button>
                          </div>
                          <p className="text-[11px] font-ndot tracking-tighter text-[#07080F]">
                            {item.price.currencyCode} {(Number(item.price.amount) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-black/[0.08] bg-[#FAFAFA]">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-ntypeMono text-[10px] text-gray-600 font-bold uppercase tracking-widest text-black/60">Estimated Subtotal</span>
                  <span className="font-ndot text-xl tracking-tighter text-[#07080F]">
                    {cartItems[0].price.currencyCode} {subtotal.toLocaleString()}
                  </span>
                </div>
                <button onClick={handleCheckout} disabled={isRedirecting} className="w-full bg-[#07080F] text-white py-5 flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50">
                  {isRedirecting ? <Loader2 className="animate-spin" size={18} /> : <span className="font-ndot text-[11px] tracking-[0.2em] uppercase pt-0.5">Initialize Checkout →</span>}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}