import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: {}, // { userId: [{ packId, qty }] }
            appliedCoupons: {}, // { userId: couponData }

            getCart: (userId) => get().cartItems[userId || 'guest'] || [],

            addToCart: (userId, packId, qty = 1) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                const userCart = cart[effectiveId] || [];

                const existingItemIndex = userCart.findIndex(item => String(item.packId) === String(packId));

                if (existingItemIndex > -1) {
                    userCart[existingItemIndex].qty += qty;
                } else {
                    userCart.push({ packId, qty });
                }

                set({ cartItems: { ...cart, [effectiveId]: userCart } });
                toast.success("Item added to cart");
            },

            removeFromCart: (userId, packId) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                if (cart[effectiveId]) {
                    const updatedUserCart = cart[effectiveId].filter(item => item.packId !== packId);
                    set({ cartItems: { ...cart, [effectiveId]: updatedUserCart } });
                    toast.success("Item removed from cart");
                }
            },

            updateCartQty: (userId, packId, qty) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                if (cart[effectiveId]) {
                    if (qty < 1) {
                        const updatedUserCart = cart[effectiveId].filter(item => item.packId !== packId);
                        set({ cartItems: { ...cart, [effectiveId]: updatedUserCart } });
                        return;
                    }
                    const updatedUserCart = cart[effectiveId].map(item =>
                        item.packId === packId ? { ...item, qty } : item
                    );
                    set({ cartItems: { ...cart, [effectiveId]: updatedUserCart } });
                }
            },

            clearCart: (userId) => {
                const effectiveId = userId || 'guest';
                const cart = get().cartItems;
                const coupons = get().appliedCoupons;
                set({
                    cartItems: { ...cart, [effectiveId]: [] },
                    appliedCoupons: { ...coupons, [effectiveId]: null }
                });
            },

            applyCoupon: (userId, coupon) => {
                const effectiveId = userId || 'guest';
                const coupons = get().appliedCoupons;
                set({ appliedCoupons: { ...coupons, [effectiveId]: coupon } });
                toast.success(`Coupon ${coupon.code} applied!`);
            },

            removeCoupon: (userId) => {
                const effectiveId = userId || 'guest';
                const coupons = get().appliedCoupons;
                set({ appliedCoupons: { ...coupons, [effectiveId]: null } });
                toast.success("Coupon removed");
            },

            getAppliedCoupon: (userId) => get().appliedCoupons[userId || 'guest'] || null
        }),
        {
            name: 'farmlyf_cart', // unique name
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCartStore;
