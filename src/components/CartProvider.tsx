"use client";

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';

/**
 * CartProvider
 *
 * Mounts once in layout.tsx.
 * On every page load, checks if a cartId exists in localStorage
 * and syncs the latest cart state from Shopify into the store.
 *
 * This ensures cartItems are always fresh even after:
 * - Page refresh
 * - Items selling out
 * - Price changes on Shopify's end
 */
export default function CartProvider({ children }: { children: React.ReactNode }) {
  const refreshCart = useCartStore((state) => state.refreshCart);

  useEffect(() => {
    refreshCart();
  }, []); // runs once on mount

  return <>{children}</>;
}