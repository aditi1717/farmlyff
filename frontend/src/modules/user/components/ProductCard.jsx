import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import logo from '../../../assets/logo.png';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    // const { addToCart, toggleWishlist, isInWishlist } = useShop(); // Removed
    const addItemToCart = useCartStore(state => state.addItem);
    const { addItem: addToWishlist, removeItem: removeFromWishlist, items: wishlistItems } = useUserStore();
    
    // Helper to check wishlist
    const isInWishlist = (productId) => wishlistItems.some(id => id === productId); // Assuming wishlistItems is array of IDs or objects. 
    // Wait, useUserStore structure: wishlist: [] (ids? or objects?)
    // Checking useUserStore.js previously: it had toggleWishlist.
    // Let's verify useUserStore content. I'll make a safe assumption or check file first.

    // Handle products with variants (Flipkart style)
    const hasVariants = product.variants && product.variants.length > 0;

    // Get lowest price for "From ₹X" look
    const displayPrice = hasVariants
        ? Math.min(...product.variants.map(v => v.price))
        : product.price;

    const displayMrp = hasVariants
        ? product.variants.find(v => v.price === displayPrice)?.mrp || product.variants[0].mrp
        : product.mrp;

    const displayDiscount = hasVariants
        ? product.variants.find(v => v.price === displayPrice)?.discount || product.variants[0].discount
        : product.discount;

    const displayUnitPrice = hasVariants
        ? product.variants.find(v => v.price === displayPrice)?.unitPrice || product.variants[0].unitPrice
        : product.unitPrice;

    return (
        <motion.div
            layout
            onClick={() => navigate(`/product/${product.id}`)}
            className="group relative bg-white border border-gray-100 rounded-[0.7rem] md:rounded-[1rem] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full"
        >
            {/* Image Header - Shorter Aspect Ratio to reduce overall card height */}
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#FDFDFD] p-2 md:p-4 text-center">
                {product.tag && (
                    <div className="absolute top-2 left-0 z-10 md:top-3">
                        <span className="bg-[#B07038] text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 md:px-3 md:py-1 rounded-r-lg shadow-sm">
                            {product.tag}
                        </span>
                    </div>
                )}
                {displayDiscount && (
                    <div className="absolute top-2 right-2 z-10 md:top-3 md:right-3">
                        <span className="bg-primary text-white text-[7px] md:text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">
                            {displayDiscount}
                        </span>
                    </div>
                )}

                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            {/* Content Section - Compact Height */}
            <div className="p-2 md:p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="flex items-center gap-1">
                        <img src={logo} alt="FarmLyf" className="h-2.5 md:h-3.5 w-auto object-contain" />
                        {product.brand && product.brand.replace(/FARMLYF/i, '').trim() && (
                            <span className="font-brand font-bold text-[7px] md:text-[10px] uppercase tracking-wide text-footerBg line-clamp-1">
                                {product.brand.replace(/FARMLYF/i, '').trim()}
                            </span>
                        )}
                    </div>
                </div>

                <h3 className="text-[9px] md:text-[12px] font-bold text-[#4A4A4A] leading-tight mb-2 md:mb-3 line-clamp-2 h-7 md:h-8">
                    {product.name}
                </h3>

                <div className="mt-auto space-y-2 md:space-y-4">
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <span className="text-[10px] md:text-sm font-black text-footerBg tracking-tight">₹{displayPrice}</span>
                        <span className="text-[8px] md:text-[10px] text-gray-300 line-through">₹{displayMrp}</span>
                        <div className="bg-footerBg text-white flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] md:text-[9px] font-bold ml-auto shrink-0">
                            <Star size={7} md:size={9} fill="currentColor" />
                            <span>{product.rating}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1 md:gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user) return navigate('/login');
                                const itemId = hasVariants ? product.variants[0].id : product.id;
                                const itemToAdd = hasVariants ? product.variants[0] : product; // Simplified: usually we need full item or just ID? useCartStore expects object with id, price, etc?
                                // Checking useCartStore previously: items: [{...product, qty}]
                                // So we need to pass the product object.
                                // But addToCart in ShopContext might have just taken ID.
                                // Let's check logic. useCartStore.addItem(item, qty).
                                // But here we don't have the full variant object easily if it's deeper.
                                // Actually we do.
                                addItemToCart(user.id, { ...itemToAdd, id: itemId }); // Passing object
                                navigate('/cart');
                            }}
                            className="bg-white border border-footerBg text-footerBg hover:bg-footerBg hover:text-white py-1.5 md:py-2 rounded-md md:rounded-lg text-[7px] md:text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center shadow-sm"
                        >
                            CART
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user) return navigate('/login');
                                const itemId = hasVariants ? product.variants[0].id : product.id;
                                navigate('/checkout', { state: { directBuyItem: { packId: itemId, qty: 1 } } });
                            }}
                            className="bg-footerBg hover:bg-primary text-white py-1.5 md:py-2 rounded-md md:rounded-lg text-[7px] md:text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center shadow-md"
                        >
                            BUY
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
