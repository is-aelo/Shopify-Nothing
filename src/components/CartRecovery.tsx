"use client";

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { getCart } from '@/lib/shopify';

/**
 * CartRecovery Component
 * Real-time sync sa Shopify Cart status.
 * Kapag naging 'null' o empty ang cart sa Shopify (converted to order),
 * lilinisin nito ang local Zustand store.
 */
export default function CartRecovery() {
  const { cartItems, clearCart } = useCartStore();

  useEffect(() => {
    const validateCartStatus = async () => {
      // 1. Kunin ang cartId na sinave natin nung nag-click ng checkout
      const savedCartId = localStorage.getItem('shopify_cart_id');
      
      // 2. Kung walang items sa local, huwag na mag-abala
      if (!savedCartId || cartItems.length === 0) return;

      try {
        // 3. Tanungin si Shopify: "Buhay pa ba 'tong cart na 'to?"
        const shopifyCart = await getCart(savedCartId);

        // 4. Logic: Kung converted na sa Order, ang shopifyCart ay magiging null 
        // o kaya ang lines nito ay magiging 0.
        const isCartCompleted = !shopifyCart || shopifyCart.totalQuantity === 0;

        if (isCartCompleted) {
          clearCart();
          localStorage.removeItem('shopify_cart_id');
          localStorage.removeItem('nothing_checkout_pending');
          console.log("🛒 [SYNC]: Shopify cart completed. Local cart cleared.");
        }
      } catch (error) {
        console.error("❌ [SYNC_ERROR]:", error);
      }
    };

    // Itatakbo natin ito sa mount at kapag nagbago ang cart length
    validateCartStatus();
  }, [cartItems.length, clearCart]);

  return null;
}