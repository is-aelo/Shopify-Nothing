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
          // Normalize ID to prevent mismatch
          const incomingId = String(newItem.variantId).trim();
          
          const existingItemIndex = state.cartItems.findIndex(
            (item) => String(item.variantId).trim() === incomingId
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.cartItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
            };
            return {
              cartItems: updatedItems,
              isCartOpen: true,
            };
          }

          return {
            cartItems: [...state.cartItems, { ...newItem, variantId: incomingId }],
            isCartOpen: true,
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => String(item.variantId).trim() !== String(variantId).trim()
          ),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            String(item.variantId).trim() === String(variantId).trim() 
              ? { ...item, quantity } 
              : item
          ),
        })),

      updateVariant: (oldVariantId, newVariant) =>
        set((state) => {
          const normalizedOldId = String(oldVariantId).trim();
          const normalizedNewId = String(newVariant.id).trim();

          const updatedItems = state.cartItems.map((item) => {
            if (String(item.variantId).trim() === normalizedOldId) {
              return {
                ...item,
                variantId: normalizedNewId,
                variantTitle: newVariant.title,
                price: newVariant.price,
                image: newVariant.image?.url || newVariant.image || item.image,
              };
            }
            return item;
          });

          const mergedItems = updatedItems.reduce((acc: CartItem[], current) => {
            const currentId = String(current.variantId).trim();
            const duplicate = acc.find((item) => String(item.variantId).trim() === currentId);
            
            if (duplicate) {
              duplicate.quantity += current.quantity;
              duplicate.allVariants = current.allVariants || duplicate.allVariants;
            } else {
              acc.push({ ...current, variantId: currentId });
            }
            return acc;
          }, []);

          return { cartItems: mergedItems };
        }),

      clearCart: () => {
        console.log('[CART_ACTION]: Cart cleared after successful checkout attempt.');
        set({ cartItems: [] });
      },
    }),
    {
      name: 'nothing-cart-storage',
    }
  )
);