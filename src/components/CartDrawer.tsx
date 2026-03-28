"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeItem } = useCartStore();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price.amount) * item.quantity,
    0
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* BACKDROP / OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998]"
          />

          {/* DRAWER PANEL */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[450px] bg-white border-l border-grayishWhite z-[999] flex flex-col shadow-2xl"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-grayishWhite flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <span className="font-ndot text-xl uppercase tracking-widest">Basket</span>
                <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-ndot">
                  {cartItems.length}
                </span>
              </div>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-grayishWhite/30 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* CART ITEMS LIST */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                  <p className="dot-matrix text-xs uppercase tracking-widest">Your basket is empty</p>
                  <button 
                    onClick={closeCart}
                    className="mt-6 text-[10px] font-ntypeMono underline underline-offset-4 tracking-widest uppercase hover:text-black transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="flex gap-4 group">
                      {/* ITEM IMAGE */}
                      <div className="w-24 h-24 bg-grayishWhite/20 border border-grayishWhite rounded-sm overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-contain mix-blend-multiply p-2 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* ITEM INFO */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-xs font-medium uppercase tracking-tight">{item.title}</h3>
                            <button 
                              onClick={() => removeItem(item.variantId)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray hover:text-black"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-[10px] text-gray mt-1 uppercase tracking-wider font-ntypeMono">
                            {item.variantTitle !== 'Default Title' ? item.variantTitle : 'Standard Edition'}
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          {/* QUANTITY SELECTOR */}
                          <div className="flex items-center border border-grayishWhite rounded-sm overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                              className="p-1.5 hover:bg-grayishWhite/30 transition-colors"
                            >
                              <Minus size={12} strokeWidth={2} />
                            </button>
                            <span className="w-8 text-center text-[10px] font-ndot">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="p-1.5 hover:bg-grayishWhite/30 transition-colors"
                            >
                              <Plus size={12} strokeWidth={2} />
                            </button>
                          </div>

                          <p className="text-sm font-ndot tracking-tighter">
                            {item.price.currencyCode} {(Number(item.price.amount) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER / CHECKOUT */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-grayishWhite bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="dot-matrix text-[10px] text-gray uppercase tracking-widest">Subtotal</span>
                  <span className="font-ndot text-xl tracking-tighter">
                    {cartItems[0].price.currencyCode} {subtotal.toFixed(2)}
                  </span>
                </div>
                
                <p className="text-[9px] text-gray uppercase tracking-[0.2em] mb-6 text-center font-ntypeMono">
                  Shipping and taxes calculated at checkout
                </p>

                <button 
                  className="w-full bg-black text-white py-5 flex items-center justify-center gap-3 group hover:bg-gray transition-all duration-500"
                >
                  <span className="dot-matrix text-xs tracking-[0.2em] uppercase">Begin Checkout</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.div>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}