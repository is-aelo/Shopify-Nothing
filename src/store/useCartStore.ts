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
  allVariants?: any[];
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
  updateVariant: (oldVariantId: string, newVariant: any) => void;
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

      updateVariant: (oldVariantId, newVariant) =>
        set((state) => {
          // 1. Update the target item with new variant details
          const updatedItems = state.cartItems.map((item) => {
            if (item.variantId === oldVariantId) {
              return {
                ...item,
                variantId: newVariant.id,
                variantTitle: newVariant.title,
                price: newVariant.price,
                // Kinukuha ang URL mula sa Shopify image node kung available
                image: newVariant.image?.url || newVariant.image || item.image,
              };
            }
            return item;
          });

          // 2. Merge logic: Kung ang bagong variant ay exist na sa cart, pagsamahin ang quantity
          // Ginagamit ang reduce para linisin ang duplicates pagkatapos ng update
          const mergedItems = updatedItems.reduce((acc: CartItem[], current) => {
            const duplicate = acc.find((item) => item.variantId === current.variantId);
            if (duplicate) {
              duplicate.quantity += current.quantity;
              // Siguraduhin na ang metadata ay preserved
              duplicate.allVariants = current.allVariants || duplicate.allVariants;
            } else {
              acc.push({ ...current });
            }
            return acc;
          }, []);

          return { cartItems: mergedItems };
        }),

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'nothing-cart-storage',
    }
  )
);