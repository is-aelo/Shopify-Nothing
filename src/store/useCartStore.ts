import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  variantId: string;
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
  isCartOpen: boolean;
  cartItems: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (newItem: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      isCartOpen: false,
      cartItems: [],

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.variantId === newItem.variantId
          );

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.variantId === newItem.variantId
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
              isCartOpen: true,
            };
          }
          return {
            cartItems: [...state.cartItems, newItem],
            isCartOpen: true,
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'nothing-cart-storage', // Pangalan ng key sa localStorage
    }
  )
);