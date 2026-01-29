import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
// import { useShop } from '../../../context/ShopContext'; // Removed
import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useProducts } from '../../../hooks/useProducts';
import { useActiveCoupons } from '../../../hooks/useCoupons';

// import { PACKS } from '../../../mockData/data'; // Removed if unused

import {
    Star,
    ArrowLeft,
    Minus,
    Plus,
    PlusCircle,
    Heart,
    Share2,
    Truck,
    RotateCcw,
    ChevronRight,
    ShoppingBag,
    CheckCircle2,
    Leaf,
    WheatOff,
    Activity,
    Award,
    Tag,
    Percent,
    Bookmark,
    Package,
    Gift
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Hooks
    const { addToCart } = useCartStore();
    const { toggleWishlist, addToRecentlyViewed, addToSaved, getWishlist, getRecentlyViewed } = useUserStore();
    const { data: products = [] } = useProducts();
    const activeCoupons = useActiveCoupons();

    // Helpers
    const getProductById = (pid) => products.find(p => p.id === pid);
    const getPackById = (pid) => products.find(p => p.id === pid); // Assuming generic structure now
    const getActiveCoupons = () => activeCoupons;
    const isInWishlist = (userId, pid) => getWishlist(userId).includes(pid);
    const getRecommendations = (userId, limit) => products.slice(0, limit); // Simple mock

    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [pincode, setPincode] = useState('');
    const [activeTab, setActiveTab] = useState('Description');
    const [copiedCouponId, setCopiedCouponId] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, title: '', text: '' });
    const [reviewsList, setReviewsList] = useState([
        { name: 'Vinod Kumar', date: '01/19/2024', rating: 5, title: 'Walnuts', text: 'Excellent product although a little expensive' },
        { name: 'chunduru nageswara r.', date: '09/08/2023', rating: 4, title: 'SMALL AND BIG PICES CAME', text: '' },
        { name: 'SAIRAM V.', date: '09/02/2023', rating: 5, title: 'Nice quality', text: '' }
    ]);

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        const review = {
            ...newReview,
            name: user?.name || 'Anonymous User',
            date: new Date().toLocaleDateString(),
        };
        setReviewsList([review, ...reviewsList]);
        setShowReviewForm(false);
        setNewReview({ rating: 5, title: '', text: '' });
    };

    useEffect(() => {
        // Try to find in group products first
        const foundProduct = getProductById(id);
        if (foundProduct) {
            setProduct(foundProduct);
            setSelectedVariant(foundProduct.variants[0]);

            // Track view
            if (user) {
                addToRecentlyViewed(user.id, foundProduct.id);
            }
        } else {
            // Fallback for legacy packs
            const foundPack = getPackById(id);
            if (foundPack) {
                setProduct(foundPack);
                if (user && foundPack.productId) {
                    addToRecentlyViewed(user.id, foundPack.productId);
                }
            }
        }
        window.scrollTo(0, 0);
    }, [id, user, products]); // Added products to dependency

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-300">Loading Product...</h2>
                </div>
            </div>
        );
    }

    const isGroupProduct = !!product.variants;
    const currentPrice = isGroupProduct ? selectedVariant.price : product.price;
    const currentMrp = isGroupProduct ? selectedVariant.mrp : product.mrp;
    const currentDiscount = isGroupProduct ? selectedVariant.discount : product.discount;
    const currentUnitPrice = isGroupProduct ? selectedVariant.unitPrice : product.unitPrice;

    const discountPercentage = Math.round(((currentMrp - currentPrice) / currentMrp) * 100);
    const saveAmount = currentMrp - currentPrice;

    const baseTabs = ['Description', 'Benefits', 'Specifications', 'Reviews', 'FAQ', 'Nutrition Info'];
    const tabs = product.contents ? ['Pack Includes', ...baseTabs] : baseTabs;

    const isCombo = product.category === 'combos-packs' || product.category === 'Combos';

    if (isCombo) {
        return (
            <div className="bg-white min-h-screen font-['Inter'] pb-8">
                {/* Breadcrumb - Compact */}
                <div className="container mx-auto px-4 md:px-12 py-3 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center text-[10px] md:text-[12px] font-medium text-gray-400 gap-1.5 overflow-hidden">
                        <Link to="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
                        <ChevronRight size={12} className="shrink-0" />
                        <span className="text-gray-400 shrink-0">Combos</span>
                        <ChevronRight size={12} className="shrink-0" />
                        <span className="text-footerBg font-bold truncate">{product.name}</span>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-12 space-y-6 mt-1">

                    {/* SECTION A & B: Header & Images */}
                    <div className="">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-[#2A2A2A]">
                            {/* Left: Images */}
                            <div className="lg:col-span-5 space-y-3">
                                <div className="bg-white rounded-xl border border-gray-100 p-3 relative group overflow-hidden shadow-sm h-[320px] md:h-[400px] flex items-center justify-center">
                                    <motion.img
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {product.tag && (
                                        <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                                            {product.tag}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => toggleWishlist(user.id, product.id)}
                                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <Heart size={18} fill={user && isInWishlist(user.id, product.id) ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>

                            {/* Right: Info & Actions */}
                            <div className="lg:col-span-7 flex flex-col justify-center">
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                                            {product.brand || 'FARMLYF COMBOS'}
                                        </span>
                                        <div className="flex items-center gap-1 text-yellow-500 text-[10px] md:text-xs font-bold">
                                            <span>{product.rating || 4.8}</span>
                                            <Star size={10} fill="currentColor" />
                                        </div>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-footerBg mb-2 leading-tight">
                                        {product.name}
                                    </h1>
                                    <p className="text-gray-400 font-medium text-[11px] md:text-xs leading-relaxed max-w-xl">
                                        {product.shortDescription || product.description?.substring(0, 120) + '...'}
                                    </p>
                                </div>

                                {/* Pricing Card */}
                                <div className="bg-[#F8F9FA] rounded-xl p-4 md:p-5 border border-gray-100 mb-6 max-w-sm">
                                    <div className="flex items-end gap-2.5 mb-1.5">
                                        <span className="text-3xl font-black text-footerBg">₹{product.price}</span>
                                        {product.individualTotal && (
                                            <span className="text-base text-gray-300 line-through font-bold mb-0.5">₹{product.individualTotal}</span>
                                        )}
                                        {product.discountPercentage > 0 && (
                                            <span className="bg-green-100 text-green-700 text-[10px] font-black px-1.5 py-0.5 rounded mb-1.5">
                                                {product.discountPercentage}% OFF
                                            </span>
                                        )}
                                    </div>
                                    {product.savings > 0 && (
                                        <p className="text-[10px] font-black text-green-600 flex items-center gap-1">
                                            <CheckCircle2 size={12} />
                                            SAVE ₹{product.savings}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                                    <button
                                        onClick={() => {
                                            if (!user) return navigate('/login');
                                            addToCart(user.id, product.id, 1);
                                            navigate('/cart');
                                        }}
                                        className="flex-1 bg-footerBg text-white py-3.5 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-footerBg/20 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={16} /> CART
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!user) return navigate('/login');
                                            addToCart(user.id, product.id, 1);
                                            navigate('/cart');
                                        }}
                                        className="flex-1 bg-primary text-white py-3.5 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                                    >
                                        BUY NOW
                                    </button>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Truck size={12} /> Free Delivery</span>
                                    <span className="flex items-center gap-1.5"><RotateCcw size={12} /> Easy Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION C: What's Inside (Most Important) */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-footerBg uppercase tracking-tight flex items-center gap-3">
                            <Package className="text-primary" strokeWidth={2.5} />
                            What's Inside This Pack?
                        </h3>
                        <div className="space-y-3">
                            {product.contents?.map((item, idx) => {
                                const itemProduct = products.find(p => p.id === item.productId);
                                const itemImage = itemProduct?.image || product.image;

                                return (
                                    <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center p-1 shrink-0">
                                            <img src={itemImage} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-footerBg">{item.productName || item.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Quantity: <span className="text-gray-800">{item.quantity}</span></p>
                                        </div>
                                        <div className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                            {item.variant || 'Standard'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION D & E: Comparison & Benefits */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Price Transparency */}
                        <div className="md:col-span-7 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-footerBg uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-gray-400" /> Price Transparency
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium text-gray-500 pb-4 border-b border-gray-200">
                                    <span>Individual Items Total Cost</span>
                                    <span className="line-through">₹{product.individualTotal || (product.mrp || product.price * 1.2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-black text-footerBg">
                                    <span>Combo Deal Price</span>
                                    <span className="text-primary">₹{product.price}</span>
                                </div>
                                <div className="flex justify-between items-center bg-green-100 p-3 rounded-xl text-green-800 text-sm font-bold">
                                    <span>Your Total Savings</span>
                                    <span>₹{product.savings || (product.mrp - product.price)}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium mt-4 text-center">
                                * Buying this combo is {Math.round((product.savings / product.individualTotal) * 100)}% cheaper than buying items individually.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="md:col-span-5 bg-footerBg text-white rounded-[32px] p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-fullblur-3xl -mr-10 -mt-10"></div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                                <Gift size={18} className="text-primary" /> Why Choose This?
                            </h3>
                            <ul className="space-y-4 relative z-10">
                                {(product.benefits || ['Perfect for Gifting', 'Premium Quality', 'Value for Money']).map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-300">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* SECTION F: Description */}
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-footerBg uppercase tracking-widest mb-4">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {product.description}
                        </p>
                    </div>

                    {/* SECTION H: Related Combos */}
                    <div className="pt-8">
                        <h3 className="text-xl font-black text-footerBg uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Package size={20} className="text-primary" /> You Might Also Like
                        </h3>
                        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
                            {products
                                .filter(p => (p.category === 'combos-packs' || p.category === 'Combos') && p.id !== product.id)
                                .slice(0, 5)
                                .map(item => (
                                    <div key={item.id} className="min-w-[280px]">
                                        <ProductCard product={item} />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-white min-h-screen font-['Inter'] pb-8">
            {/* Breadcrumb - Compact */}
            <div className="container mx-auto px-4 md:px-12 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
                    aria-label="Go back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center text-[10px] md:text-[12px] font-medium text-gray-400 gap-1.5 overflow-hidden">
                    <Link to="/" className="hover:text-primary transition-colors shrink-0">Home</Link>
                    <ChevronRight size={12} className="shrink-0" />
                    <Link to="/catalog" className="hover:text-primary transition-colors shrink-0">Shop</Link>
                    <ChevronRight size={12} className="shrink-0" />
                    <span className="text-footerBg font-semibold truncate">{product.name}</span>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-[#2A2A2A]">

                    {/* LEFT COLUMN - IMAGE */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="bg-white rounded-xl border border-gray-100 p-3 relative overflow-hidden group shadow-sm flex items-center justify-center h-[300px] md:h-[420px]">
                            <motion.img
                                key={isGroupProduct ? selectedVariant.id : product.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain max-h-full mx-auto mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                            />
                            {product.tag && (
                                <span className="absolute top-3 left-0 bg-[#A0522D] text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-r w-fit shadow-md">
                                    {product.tag}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    if (!user) return navigate('/login');
                                    toggleWishlist(user.id, product.id);
                                }}
                                className={`absolute top-2 right-2 p-2 bg-white rounded-full border shadow-sm transition-all z-20 ${user && isInWishlist(user.id, product.id)
                                    ? 'text-red-500 border-red-100 bg-red-50'
                                    : 'text-gray-400 border-gray-100 hover:text-red-500 hover:border-red-100 hover:bg-red-50'
                                    }`}
                            >
                                <Heart size={16} fill={user && isInWishlist(user.id, product.id) ? "currentColor" : "none"} />
                            </button>
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none justify-center">
                            {[product.image, product.image, product.image, product.image].map((img, idx) => (
                                <button key={idx} className={`shrink-0 w-12 h-12 md:w-16 md:h-16 bg-white border-2 ${idx === 0 ? 'border-primary' : 'border-gray-50'} rounded-lg p-1 hover:border-primary transition-all`}>
                                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - DETAILS */}
                    <div className="lg:col-span-7 lg:pl-4">
                        <div className="mb-3 border-b border-gray-100 pb-3">
                            {/* Brand Name */}
                            <div className="mb-1">
                                <span className="text-[10px] md:text-xs font-black text-gray-400 font-brand uppercase tracking-[0.2em]">
                                    {product.brand}
                                </span>
                            </div>

                            <h1 className="text-xl md:text-2xl font-bold text-[#222] leading-tight mb-1.5 font-['Poppins'] tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-3 mb-2.5">
                                <div className="flex items-center gap-1 bg-primary text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-bold shadow-sm">
                                    <span>{product.rating}</span>
                                    <Star size={8} md:size={10} fill="currentColor" />
                                </div>
                                <span className="text-[10px] md:text-xs text-gray-400 font-medium">11 reviews</span>
                                <button className="text-gray-300 hover:text-primary transition-colors">
                                    <Share2 size={14} />
                                </button>
                            </div>

                            <div className="space-y-0.5">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-xl md:text-2xl font-black text-primary">₹{currentPrice}</span>
                                    <span className="text-sm md:text-base text-gray-300 line-through font-medium">₹{currentMrp}</span>
                                    <span className="bg-[#E63946] text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                        {currentDiscount || `${discountPercentage}% OFF`}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium ml-1">({currentUnitPrice})</span>
                                </div>
                                <p className="text-[10px] md:text-xs font-bold text-green-600">Save ₹{saveAmount} instantly</p>
                            </div>
                        </div>

                        {/* Variant Selection */}
                        {isGroupProduct && (
                            <div className="mb-4">
                                <h3 className="text-[10px] font-black text-footerBg/40 mb-2 uppercase tracking-widest">Select Pack Size</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`border-2 rounded-lg px-3 py-1.5 cursor-pointer transition-all min-w-[80px] text-center relative shadow-sm ${selectedVariant.id === variant.id
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary/10'
                                                : 'border-gray-100 bg-white hover:border-gray-200'
                                                }`}
                                        >
                                            <div className={`text-xs font-black ${selectedVariant.id === variant.id ? 'text-primary' : 'text-footerBg'}`}>
                                                {variant.weight}
                                            </div>
                                            <div className={`text-[10px] font-bold ${selectedVariant.id === variant.id ? 'text-footerBg' : 'text-gray-400'}`}>
                                                ₹{variant.price}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isGroupProduct && (
                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Pack Size</h3>
                                <div className="flex flex-wrap gap-3">
                                    <div className="border-2 border-primary bg-primary/5 rounded-lg px-3 py-1.5 cursor-pointer transition-all min-w-[90px] text-center relative shadow-sm">
                                        <div className="text-sm font-bold text-primary">Default</div>
                                        <div className="text-[10px] text-gray-400 line-through">₹{product.mrp}</div>
                                        <div className="text-xs font-bold text-[#222]">₹{product.price}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Available Offers - Industry Standard Discovery */}
                        <div className="mb-6 bg-[#FDFCF0] border border-[#F5E6A3] rounded-xl p-4">
                            <h3 className="text-xs font-black text-[#856404] mb-3 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} />
                                Available Offers
                            </h3>
                            <div className="space-y-3">
                                {getActiveCoupons().slice(0, 3).map((coupon) => (
                                    <div key={coupon.id} className="flex items-start gap-3 border-b border-[#F5E6A3]/50 pb-3 last:border-0 last:pb-0">
                                        <div className="mt-1 bg-white p-1 rounded border border-[#F5E6A3]">
                                            <Percent size={12} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-footerBg tracking-tight font-mono border-2 border-dashed border-primary/30 px-2 py-0.5 rounded bg-white">
                                                    {coupon.code}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(coupon.code);
                                                        setCopiedCouponId(coupon.id);
                                                        setTimeout(() => setCopiedCouponId(null), 2000);
                                                    }}
                                                    className="text-[10px] font-bold text-primary hover:underline transition-all"
                                                >
                                                    {copiedCouponId === coupon.id ? 'COPIED!' : 'COPY'}
                                                </button>
                                            </div>
                                            <p className="text-[11px] text-gray-600 font-medium mt-1">
                                                {coupon.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch">
                            <div className="flex items-center border border-gray-200 rounded-lg w-full sm:w-fit h-[42px] bg-white shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 border-r border-gray-200 transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="px-4 text-sm font-black text-footerBg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 border-l border-gray-200 transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="flex-1 flex gap-2">
                                <button
                                    onClick={() => {
                                        if (!user) return navigate('/login');
                                        const skuId = isGroupProduct ? selectedVariant.id : product.id;
                                        addToCart(user.id, skuId, quantity);
                                        navigate('/cart');
                                    }}
                                    className="flex-[2] bg-primary text-white h-[42px] rounded-lg font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primaryHover transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={16} /> CART
                                </button>
                                <button
                                    onClick={() => {
                                        if (!user) return navigate('/login');
                                        const skuId = isGroupProduct ? selectedVariant.id : product.id;
                                        addToCart(user.id, skuId, quantity);
                                        navigate('/cart');
                                    }}
                                    className="flex-[2] bg-footerBg text-white h-[42px] rounded-lg font-black text-[11px] uppercase tracking-widest shadow-lg shadow-footerBg/20 hover:bg-black transition-all"
                                >
                                    BUY NOW
                                </button>
                            </div>
                        </div>

                        {/* Pincode Check */}
                        <div className="border border-gray-200 rounded-lg p-1 max-w-sm mb-6 flex shadow-sm">
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                className="flex-1 px-3 text-sm outline-none bg-transparent placeholder-gray-400"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                            />
                            <button className="bg-[#222] text-white px-4 py-1.5 rounded text-xs font-bold uppercase hover:bg-black transition-colors">
                                Check
                            </button>
                        </div>

                        <div className="flex items-center gap-5 text-xs text-gray-600 font-medium mb-8">
                            <div className="flex items-center gap-1.5">
                                <Truck size={16} className="text-primary" />
                                <span>Estimate delivery time</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <RotateCcw size={14} className="text-primary" />
                                <span className="font-bold text-gray-700">COD AVAILABLE</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* BOTTOM SECTION - Tabs */}
                <div className="mt-10">
                    {/* Benefits Icons Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 border-b border-gray-100 pb-6">
                        {(product.benefits || ['Heart-Healthy', 'Gluten Free', 'Powerful Nutrition', 'Cholesterol Free']).slice(0, 4).map((b, i) => {
                            const iconMap = {
                                'Heart': <Heart size={20} strokeWidth={2} />,
                                'Gluten': <WheatOff size={20} strokeWidth={2} />,
                                'Nutrition': <Award size={20} strokeWidth={2} />,
                                'Fat': <Activity size={20} strokeWidth={2} />,
                                'Cholesterol': <Activity size={20} strokeWidth={2} />
                            };
                            const icon = Object.keys(iconMap).find(key => b.includes(key)) ? iconMap[Object.keys(iconMap).find(key => b.includes(key))] : <Leaf size={20} />;

                            return (
                                <div key={i} className="text-center flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                                        {icon}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">{b}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tab Navigation - Now Scrollable on Mobile */}
                    <div className="flex items-center gap-0 border-b border-gray-100 mb-5 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 md:mx-0 md:px-0 md:justify-center">
                        {tabs.map((tab, index) => (
                            <React.Fragment key={tab}>
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 md:px-6 py-2 md:py-2.5 text-[10px] md:text-xs font-bold tracking-wider transition-all relative uppercase shrink-0
                                        ${activeTab === tab
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-gray-400 hover:text-footerBg'
                                        }
                                    `}
                                >
                                    {tab}
                                </button>
                                {index < tabs.length - 1 && (
                                    <span className="h-3 w-[1px] bg-gray-100 self-center"></span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            {activeTab === 'Pack Includes' && product.contents && (
                                <div className="text-left max-w-xl mx-auto bg-[#FDFCF0] p-5 md:p-6 rounded-xl border border-[#F5E6A3]">
                                    <h3 className="text-base font-bold text-footerBg mb-4 flex items-center gap-2">
                                        <Package size={18} className="text-primary" />
                                        Pack Contents
                                    </h3>
                                    <div className="space-y-3">
                                        {product.contents.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-primary font-black text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-white bg-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Description' && (
                                <div className="space-y-4">
                                    <p className="text-[11px] md:text-xs text-gray-400 leading-6 text-justify px-2">
                                        {product.description || `Nutraj brings a premium assortment of walnut kernels to your plate in the form of ${product.name}. As the name says, these Anmol walnut kernels are nothing short of precious treats as they come from 1% of the Rarest Crop, grown worldwide. Since the crop is handpicked from the best, these walnut kernels are jumbo-sized, extra crunchier in taste, and contain exceptional nutritional value.`}
                                    </p>
                                    <div className="flex justify-center">
                                        <img src={product.image} className="w-40 md:w-60 h-auto object-contain rounded-xl opacity-90 mix-blend-multiply" alt="" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Benefits' && (
                                <div className="text-left space-y-4">
                                    <h3 className="text-lg font-bold text-gray-800">Health Benefits</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 leading-relaxed">
                                        {(product.benefits || [
                                            'Rich in Antioxidants: Walnuts have higher antioxidant activity than any other common nut.',
                                            'Super Plant Source of Omega-3s: Significantly higher omega-3 fat content than any other nut.'
                                        ]).map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeTab === 'Specifications' && (
                                <div className="text-left border border-gray-200 rounded-lg overflow-hidden">
                                    {(product.specifications || [
                                        { label: 'Brand Name', value: product.brand },
                                        { label: 'Shelf Life', value: '6 Months' }
                                    ]).map((spec, idx) => (
                                        <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 p-4 text-sm ${idx !== (product.specifications?.length - 1) ? 'border-b border-gray-200' : ''}`}>
                                            <div className="font-bold text-primary">{spec.label}</div>
                                            <div className="text-gray-600">{spec.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'Reviews' && (
                                <div className="text-left max-w-7xl mx-auto">
                                    <div className="flex flex-col md:flex-row items-center justify-between mb-6 border-b border-gray-100 pb-6 gap-4">
                                        <div className="text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                <div className="flex text-primary">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill={i <= 4.8 ? "currentColor" : "none"} />)}
                                                </div>
                                                <span className="text-lg font-black text-footerBg tracking-tight">4.82</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Based on {reviewsList.length} reviews</p>
                                        </div>
                                        <button
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="w-full md:w-auto bg-footerBg text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-md active:scale-95"
                                        >
                                            {showReviewForm ? 'Cancel' : 'Write a review'}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {showReviewForm && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden mb-8"
                                            >
                                                <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                                                    <div className="flex flex-col items-center gap-2 mb-2">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate this product</span>
                                                        <div className="flex gap-1 text-primary">
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => setNewReview({ ...newReview, rating: i })}
                                                                >
                                                                    <Star size={24} fill={i <= newReview.rating ? "currentColor" : "none"} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Review Title (e.g. Great taste!)"
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-300"
                                                            required
                                                            value={newReview.title}
                                                            onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                                        />
                                                        <textarea
                                                            placeholder="Share your experience with this product..."
                                                            rows="4"
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-gray-300 resize-none"
                                                            required
                                                            value={newReview.text}
                                                            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                                                        ></textarea>
                                                        <button
                                                            type="submit"
                                                            className="w-full bg-primary text-white py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                        >
                                                            Submit Review
                                                        </button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                                        {reviewsList.map((review, idx) => (
                                            <div key={idx} className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-50 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 flex flex-col justify-between h-full">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2.5">
                                                        <div className="flex text-primary">
                                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-300">{review.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-black text-footerBg text-sm">{review.name}</span>
                                                    </div>
                                                    {review.title && <h4 className="font-bold text-[15px] text-footerBg mb-2 leading-tight">{review.title}</h4>}
                                                    {review.text && <p className="text-xs text-gray-500 leading-relaxed">{review.text}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'FAQ' && (
                                <div className="text-left space-y-4">
                                    {(product.faqs || [
                                        { q: 'How to store?', a: 'Store in a cool, dry place away from sunlight.' }
                                    ]).map((item, idx) => (
                                        <div key={idx} className="pb-4 border-b border-gray-50 last:border-0">
                                            <h4 className="text-primary font-medium text-sm mb-2">{item.q}</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'Nutrition Info' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left p-6 bg-gray-50 rounded-xl">
                                    {[
                                        { label: 'Energy', value: product.nutrition?.energy || 'N/A' },
                                        { label: 'Protein', value: product.nutrition?.protein || 'N/A' },
                                        { label: 'Total Fat', value: product.nutrition?.fat || 'N/A' },
                                        { label: 'Carbs', value: product.nutrition?.carbs || 'N/A' }
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
                                            <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                                            <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Recently Viewed Section */}
                {/* Recently Viewed Section */}
                {
                    user && getRecentlyViewed(user.id).length > 0 && (
                        <div className="mt-12 pt-10 bg-[#FDFCF6] -mx-4 md:-mx-12 px-4 md:px-12 pb-6 rounded-t-[32px] border-x border-t border-orange-100/30">
                            <div className="mb-6 text-center">
                                <h3 className="text-lg font-bold text-footerBg font-['Poppins']">Recently Viewed</h3>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none">
                                {getRecentlyViewed(user.id)
                                    .map(pid => getProductById(pid))
                                    .filter(p => p && p.id !== product.id)
                                    .map((item) => (
                                    <div key={item.id} className="min-w-[160px] md:min-w-[260px] w-[160px] md:w-[260px]">
                                        <ProductCard product={item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Recommendations Section */}
                {
                    user && (
                        <div className="mt-0 pt-6 font-['Inter'] bg-[#F4F9F6] -mx-4 md:-mx-12 px-4 md:px-12 pb-12 rounded-b-[32px] border-x border-b border-green-100/30">
                            <div className="mb-6 text-center">
                                <h3 className="text-lg font-black text-footerBg uppercase tracking-tight">Picked for You</h3>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none">
                                {getRecommendations(user.id, 10).map((item) => (
                                    <div key={item.id} className="min-w-[160px] md:min-w-[260px] w-[160px] md:w-[260px]">
                                        <ProductCard product={item} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
};

export default ProductDetailPage;
