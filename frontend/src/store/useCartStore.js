import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: {}, // { userId: [{ packId, qty }] }

            getCart: (userId) => get().cartItems[userId] || [],

            addToCart: (userId, packId, qty = 1) => {
                if (!userId) {
                    toast.error("Please login to add to cart");
                    return;
                }
                const cart = get().cartItems;
                const userCart = cart[userId] || [];
                
                const existingItemIndex = userCart.findIndex(item => String(item.packId) === String(packId));

                if (existingItemIndex > -1) {
                    userCart[existingItemIndex].qty += qty;
                } else {
                    userCart.push({ packId, qty });
                }

                set({ cartItems: { ...cart, [userId]: userCart } });
                toast.success("Item added to cart");
                
                // Note: Integration with SaveForLater removal should happen in component or via cross-store logic if strict
            },

            removeFromCart: (userId, packId) => {
                const cart = get().cartItems;
                if (cart[userId]) {
                    const updatedUserCart = cart[userId].filter(item => item.packId !== packId);
                    set({ cartItems: { ...cart, [userId]: updatedUserCart } });
                    toast.success("Item removed from cart");
                }
            },

            updateCartQty: (userId, packId, qty) => {
                const cart = get().cartItems;
                if (cart[userId]) {
                    if (qty < 1) {
                         const updatedUserCart = cart[userId].filter(item => item.packId !== packId);
                         set({ cartItems: { ...cart, [userId]: updatedUserCart } });
                         return;
                    }
                    const updatedUserCart = cart[userId].map(item => 
                        item.packId === packId ? { ...item, qty } : item
                    );
                    set({ cartItems: { ...cart, [userId]: updatedUserCart } });
                }
            },

            clearCart: (userId) => {
                const cart = get().cartItems;
                set({ cartItems: { ...cart, [userId]: [] } });
            }
        }),
        {
            name: 'farmlyf_cart', // unique name
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCartStore;
