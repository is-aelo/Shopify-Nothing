"use client";

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { getCart } from '@/lib/shopify';

/**
 * CartRecovery
 *
 * Runs silently in the background on every page load.
 * Asks Shopify: "Is this cart still alive?"
 *
 * Two scenarios it handles:
 * 1. Cart was completed (user checked out) → Shopify returns null → clear local store
 * 2. Cart still exists → refresh local cartItems from Shopify → stays in sync
 */
export default function CartRecovery() {
  const { cartId, refreshCart, clearCart } = useCartStore();

  useEffect(() => {
    const validateCartStatus = async () => {
      // No cartId in store = nothing to validate
      if (!cartId) return;

      try {
        const shopifyCart = await getCart(cartId);

        if (!shopifyCart || shopifyCart.totalQuantity === 0) {
          // Cart was completed or expired on Shopify's end
          clearCart();
          console.log('[CART_RECOVERY]: Cart completed or expired. Local store cleared.');
        } else {
          // Cart is still alive — sync latest state from Shopify into local store
          await refreshCart();
          console.log('[CART_RECOVERY]: Cart synced from Shopify.');
        }
      } catch (error) {
        console.error('[CART_RECOVERY_ERROR]:', error);
      }
    };

    validateCartStatus();
  }, []); // ← runs once on mount only

  return null;
}