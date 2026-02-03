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
    const toggleWishlist = useUserStore(state => state.toggleWishlist);
    const wishlistMap = useUserStore(state => state.wishlist);
    const userWishlist = user ? (wishlistMap[user.id] || []) : [];

    // Handle products with variants (Flipkart style)
    const hasVariants = product.variants && product.variants.length > 0;

    // Helper to check wishlist
    const itemId = hasVariants ? product.variants[0].id : product.id;
    const isWishlisted = userWishlist.includes(itemId);

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
            onClick={() => navigate(`/product/${product.slug || product.id}`)}
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
                        <span className="font-brand font-bold text-[7px] md:text-[10px] uppercase tracking-wide text-footerBg line-clamp-1">
                            PREMIUM
                        </span>
                    </div>
                </div>

                <h3 className="text-[9px] md:text-[12px] font-bold text-[#4A4A4A] leading-tight mb-2 md:mb-3 line-clamp-2 h-7 md:h-8">
                    {product.name}
                </h3>

                <div className="mt-auto space-y-2 md:space-y-4">
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] md:text-sm font-black text-footerBg tracking-tight">₹{displayPrice}</span>
                            <span className="text-[8px] md:text-[10px] text-gray-300 line-through">₹{displayMrp}</span>
                            {displayUnitPrice && (
                                <span className="text-[8px] md:text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                    (₹{displayUnitPrice}/kg)
                                </span>
                            )}
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <div className="bg-footerBg text-white flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] md:text-[9px] font-bold shrink-0">
                                <Star size={7} md:size={9} fill="currentColor" />
                                <span>{product.rating}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!user) {
                                        // Optionally show toast
                                        return navigate('/login');
                                    }
                                    toggleWishlist(user.id, itemId);
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors p-0.5 active:scale-95"
                            >
                                <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} className={isWishlisted ? "text-red-500" : ""} />
                            </button>
                        </div>
                    </div>

                    <div className="w-full">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!user) return navigate('/login');
                                const itemId = hasVariants ? product.variants[0].id : product.id;
                                const itemToAdd = hasVariants ? product.variants[0] : product;
                                addItemToCart(user.id, { ...itemToAdd, id: itemId });
                            }}
                            className="w-full bg-footerBg hover:bg-primary text-white py-2 md:py-2.5 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center shadow-md"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
