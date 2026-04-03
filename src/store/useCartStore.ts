import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createCart,
  addCartLines,
  updateCartLine,
  removeCartLines,
  getCart,
} from '@/lib/shopify-client'; // ← changed from @/lib/shopify

// ============================================================
// TYPES
// ============================================================

export interface CartItem {
  lineId: string;       // Shopify cart line ID (used for update/remove mutations)
  variantId: string;    // Shopify variant ID
  title: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image: string;
  quantity: number;
  handle: string;
}

interface CartState {
  // Shopify cart identifiers
  cartId: string | null;
  checkoutUrl: string | null;

  // UI state
  isCartOpen: boolean;
  isLoading: boolean;

  // Local mirror of Shopify cart lines (for rendering)
  cartItems: CartItem[];

  // UI actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart actions — all sync with Shopify
  addItem: (item: Omit<CartItem, 'lineId'>) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
}

// ============================================================
// HELPERS
// Map Shopify cart API response → local CartItem[]
// ============================================================

function mapShopifyCartLines(cart: any): CartItem[] {
  return (
    cart?.lines?.edges?.map(({ node }: any) => ({
      lineId: node.id,
      variantId: node.merchandise.id,
      title: node.merchandise.product.title,
      variantTitle: node.merchandise.title,
      price: node.merchandise.price,
      image: node.merchandise.image?.url ?? '',
      quantity: node.quantity,
      handle: node.merchandise.product.handle,
    })) ?? []
  );
}

// ============================================================
// STORE
// Source of truth is always Shopify's backend.
// cartItems here is just a local mirror for rendering.
// cartId is persisted in localStorage so the cart survives page refreshes.
// ============================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      checkoutUrl: null,
      isCartOpen: false,
      isLoading: false,
      cartItems: [],

      // ----------------------------------------------------------
      // UI
      // ----------------------------------------------------------

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      // ----------------------------------------------------------
      // Add item
      // Creates a cart if one doesn't exist yet, then adds the line.
      // ----------------------------------------------------------

      addItem: async (item) => {
        set({ isLoading: true });
        try {
          let { cartId } = get();

          // Create cart on first add
          if (!cartId) {
            const newCart = await createCart();
            if (!newCart) {
              console.error('[ADD_ITEM]: Failed to create cart.');
              return;
            }
            cartId = newCart.id;
            set({ cartId, checkoutUrl: newCart.checkoutUrl });
          }

          // Add line to Shopify cart
          const updatedCart = await addCartLines(cartId, [
            { variantId: item.variantId, quantity: item.quantity }
          ]);

          if (!updatedCart) {
            console.error('[ADD_ITEM]: Failed to add line to cart.');
            return;
          }

          set({
            cartItems: mapShopifyCartLines(updatedCart),
            checkoutUrl: updatedCart.checkoutUrl,
            isCartOpen: true,
          });
        } catch (error) {
          console.error('[ADD_ITEM_ERROR]:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ----------------------------------------------------------
      // Remove item by Shopify line ID
      // ----------------------------------------------------------

      removeItem: async (lineId) => {
        set({ isLoading: true });
        try {
          const { cartId } = get();
          if (!cartId) return;

          const updatedCart = await removeCartLines(cartId, [lineId]);
          if (!updatedCart) {
            console.error('[REMOVE_ITEM]: Failed to remove line from cart.');
            return;
          }

          set({
            cartItems: mapShopifyCartLines(updatedCart),
            checkoutUrl: updatedCart.checkoutUrl,
          });
        } catch (error) {
          console.error('[REMOVE_ITEM_ERROR]:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ----------------------------------------------------------
      // Update quantity by Shopify line ID
      // Passing quantity = 0 will remove the line entirely.
      // ----------------------------------------------------------

      updateQuantity: async (lineId, quantity) => {
        set({ isLoading: true });
        try {
          const { cartId } = get();
          if (!cartId) return;

          if (quantity <= 0) {
            await get().removeItem(lineId);
            return;
          }

          const updatedCart = await updateCartLine(cartId, lineId, quantity);
          if (!updatedCart) {
            console.error('[UPDATE_QUANTITY]: Failed to update cart line.');
            return;
          }

          set({
            cartItems: mapShopifyCartLines(updatedCart),
            checkoutUrl: updatedCart.checkoutUrl,
          });
        } catch (error) {
          console.error('[UPDATE_QUANTITY_ERROR]:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ----------------------------------------------------------
      // Refresh cart from Shopify (call on page load to rehydrate UI)
      // ----------------------------------------------------------

      refreshCart: async () => {
        const { cartId } = get();
        if (!cartId) return;

        set({ isLoading: true });
        try {
          const cart = await getCart(cartId);

          if (!cart) {
            // Cart expired on Shopify's end — reset everything
            console.warn('[REFRESH_CART]: Cart not found, resetting.');
            set({ cartId: null, checkoutUrl: null, cartItems: [] });
            return;
          }

          set({
            cartItems: mapShopifyCartLines(cart),
            checkoutUrl: cart.checkoutUrl,
          });
        } catch (error) {
          console.error('[REFRESH_CART_ERROR]:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // ----------------------------------------------------------
      // Clear local state (e.g. after successful order)
      // Does NOT call Shopify — Shopify auto-expires carts after checkout.
      // ----------------------------------------------------------

      clearCart: () => {
        set({
          cartId: null,
          checkoutUrl: null,
          cartItems: [],
          isCartOpen: false,
        });
      },
    }),
    {
      name: 'nothing-cart-storage',
      // Only persist cartId and checkoutUrl.
      // cartItems are re-fetched from Shopify via refreshCart() on load.
      partialize: (state) => ({
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
    }
  )
);