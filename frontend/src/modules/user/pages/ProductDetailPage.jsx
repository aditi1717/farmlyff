import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
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
    Gift,
    Ban,
    ArrowRight,
    HeartHandshake,
    FileText
} from 'lucide-react';

const DUMMY_IMAGES = [
    "https://images.unsplash.com/photo-1508061263366-c7bb3cc29475?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1533616688419-b7a585564566?q=80&w=1000&auto=format&fit=crop"
];
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailPage = () => {
    const scrollRef = useRef(null);
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Hooks
    const { addToCart } = useCartStore();
    const { toggleWishlist, addToRecentlyViewed, addToSaved, getWishlist, getRecentlyViewed } = useUserStore();
    const { data: products = [] } = useProducts();
    const activeCoupons = useActiveCoupons();

    // Helpers
    const getProductById = (id) => products.find(p => p.id === id);
    const getProductBySlug = (s) => products.find(p => p.slug === s || p.id === s);
    const getActiveCoupons = () => {
        if (!product || !activeCoupons) return [];
        return activeCoupons.filter(coupon => {
            if (coupon.applicabilityType === 'all') return true;
            if (coupon.applicabilityType === 'product') {
                return coupon.targetItems.includes(product.id) || coupon.targetItems.includes(product.slug);
            }
            if (coupon.applicabilityType === 'category') {
                return coupon.targetItems.includes(product.category);
            }
            if (coupon.applicabilityType === 'subcategory') {
                return coupon.targetItems.includes(product.subcategory);
            }
            return false;
        });
    };
    const isInWishlist = (userId, pid) => getWishlist(userId).includes(pid);
    const getRecommendations = (userId, limit) => products.slice(0, limit); // Simple mock

    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [pincode, setPincode] = useState('');
    const [activeTab, setActiveTab] = useState('Description');
    const [copiedCouponId, setCopiedCouponId] = useState(null);
    const [previewCouponCode, setPreviewCouponCode] = useState('');
    const [previewDiscount, setPreviewDiscount] = useState(0);
    const [previewError, setPreviewError] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, title: '', text: '' });
    const [reviewsList, setReviewsList] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageLightbox, setShowImageLightbox] = useState(false);
    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const [imageZoomPosition, setImageZoomPosition] = useState({ x: 0, y: 0 });
    const [isImageHovered, setIsImageHovered] = useState(false);
    const [showStickyBar, setShowStickyBar] = useState(false);


    const fetchReviews = async () => {
        if (!product) return;
        try {
            setReviewsLoading(true);
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}/reviews/product/${product.id}`);
            if (res.ok) {
                const data = await res.json();
                setReviewsList(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to write a review');
            navigate('/login');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    rating: newReview.rating,
                    title: newReview.title,
                    comment: newReview.text
                }),
                credentials: 'include'
            });

            if (res.ok) {
                toast.success('Review submitted for approval!');
                setNewReview({ rating: 5, title: '', text: '' });
                setShowReviewForm(false);
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    useEffect(() => {
        // Try to find in group products first
        const foundProduct = getProductBySlug(slug);
        if (foundProduct) {
            setProduct(foundProduct);
            setSelectedVariant(foundProduct.variants?.[0]);
            setSelectedImage(foundProduct.image || foundProduct.images?.[0] || DUMMY_IMAGES[0]);

            // Track view
            if (user) {
                addToRecentlyViewed(user.id, foundProduct.id);
            }
        }
    }, [slug, user, products]);

    useEffect(() => {
        if (product) {
            fetchReviews();
        }
    }, [product]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showShareDropdown && !e.target.closest('.share-dropdown-container')) {
                setShowShareDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showShareDropdown]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 800) {
                setShowStickyBar(true);
            } else {
                setShowStickyBar(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper Functions
    const handleImageMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setImageZoomPosition({ x, y });
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `Check out ${product.name}`;

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
                break;
        }
        setShowShareDropdown(false);
    };

    const checkPincode = () => {
        if (!pincode || pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return;
        }
        // Mock pincode check - replace with actual API call
        toast.success('Delivery available! Expected by ' + new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString());
    };

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

    const tabs = ['Description', 'Benefits', 'Specifications', 'Reviews', 'FAQ', 'Nutrition Info'];

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
                        <Link to="/" className="text-primary hover:underline transition-colors shrink-0">Home</Link>
                        <ChevronRight size={12} className="shrink-0" />
                        <span className="text-gray-400 shrink-0">Combos</span>
                        <ChevronRight size={12} className="shrink-0" />
                        <span className="text-black font-bold truncate">{product.name}</span>
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
                                        key={selectedImage || product.image}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={selectedImage || product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {product.tag && (
                                        <span className="absolute top-0 left-0 bg-[#A35D33] text-white text-[8px] md:text-[10px] font-bold uppercase px-3 py-1.5 rounded-br-lg shadow-sm z-10">
                                            {product.tag}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => toggleWishlist(user.id, product.id)}
                                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"
                                    >
                                        <Heart size={18} className="group-hover:fill-current" fill={user && isInWishlist(user.id, product.id) ? "currentColor" : "none"} />
                                    </button>
                                </div>
                                {/* Thumbnails for Combos */}
                                {product.images && product.images.length > 0 && (
                                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none justify-center">
                                        {[product.image, ...product.images].map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`shrink-0 w-12 h-12 md:w-16 md:h-16 bg-white border-2 ${(selectedImage || product.image) === img ? 'border-primary' : 'border-gray-50'} rounded-lg p-1 hover:border-primary transition-all`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Info & Actions */}
                            <div className="lg:col-span-7 flex flex-col justify-center">
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                                            {product.brand || 'FARMLYF COMBOS'}
                                        </span>
                                        <div className="flex items-center gap-1 text-primary text-[10px] md:text-xs font-bold">
                                            <span>{product.rating || 4.8}</span>
                                            <Star size={10} fill="currentColor" />
                                        </div>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-black mb-2 leading-tight">
                                        {product.name}
                                    </h1>
                                    <p className="text-gray-400 font-medium text-[11px] md:text-xs leading-relaxed max-w-xl">
                                        {product.shortDescription || product.description?.substring(0, 120) + '...'}
                                    </p>
                                </div>

                                {/* Pricing Card */}
                                <div className="bg-[#F8F9FA] rounded-xl p-4 md:p-5 border border-gray-100 mb-6 max-w-sm">
                                    <div className="flex items-end gap-2.5 mb-1.5">
                                        <span className="text-3xl font-black text-black">₹{product.price}</span>
                                        {product.individualTotal && (
                                            <span className="text-base text-gray-300 line-through font-bold mb-0.5">₹{product.individualTotal}</span>
                                        )}
                                        {product.discountPercentage > 0 && (
                                            <span className="bg-[#E63946] text-white text-[10px] font-bold px-1.5 py-0.5 rounded mb-1.5 lowercase">
                                                {product.discountPercentage}% off
                                            </span>
                                        )}
                                    </div>
                                    {product.savings > 0 && (
                                        <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                                            Save ₹{product.savings} instantly
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 max-w-sm">
                                    <button
                                        onClick={() => {
                                            addToCart(user?.id, product.id, 1);
                                        }}
                                        className="flex-1 bg-primaryDeep text-white py-3.5 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-primaryHover transition-all shadow-lg shadow-primaryDeep/20 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={16} /> CART
                                    </button>
                                    <button
                                        onClick={() => {
                                            addToCart(user?.id, product.id, 1);
                                            navigate('/checkout');
                                        }}
                                        className="flex-1 bg-primary text-white py-3.5 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-primaryHover transition-all shadow-lg shadow-primary/20"
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
                        <h3 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
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
                                            <h4 className="text-sm font-bold text-black">{item.productName || item.name}</h4>
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
                            <h3 className="text-lg font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity size={18} className="text-gray-400" /> Price Transparency
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium text-gray-500 pb-4 border-b border-gray-200">
                                    <span>Individual Items Total Cost</span>
                                    <span className="line-through">₹{product.individualTotal || (product.mrp || product.price * 1.2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-black text-black">
                                    <span>Combo Deal Price</span>
                                    <span className="text-primary">₹{product.price}</span>
                                </div>
                                <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl text-green-700 text-sm font-bold">
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
                        <h3 className="text-lg font-black text-black uppercase tracking-widest mb-4">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {product.description}
                        </p>
                    </div>

                    {/* SECTION H: Related Combos */}
                    <div className="pt-8">
                        <h3 className="text-xl font-black text-black uppercase tracking-tight mb-6 flex items-center gap-2">
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
                    <Link to="/" className="text-primary hover:underline transition-colors shrink-0">Home</Link>
                    <ChevronRight size={12} className="shrink-0" />
                    <Link to="/catalog" className="hover:text-primary transition-colors shrink-0">Shop</Link>
                    <ChevronRight size={12} className="shrink-0" />
                    <span className="text-black font-semibold truncate">{product.name}</span>
                </div>
            </div>

            <main className="container mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-[#2A2A2A]">
                    {/* LEFT COLUMN - IMAGE */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-4">
                        {/* Main Image with Zoom */}
                        <div
                            className="bg-white rounded-2xl border border-gray-200 py-6 relative overflow-hidden cursor-zoom-in"
                            onMouseMove={handleImageMouseMove}
                            onMouseEnter={() => setIsImageHovered(true)}
                            onMouseLeave={() => setIsImageHovered(false)}
                            onClick={() => setShowImageLightbox(true)}
                        >
                            {/* Tag Badge */}
                            {product.tag && (
                                <span className="absolute top-6 left-0 bg-[#A35D33] text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-r shadow-sm z-20">
                                    {product.tag}
                                </span>
                            )}

                            {/* Wishlist Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!user) return navigate('/login');
                                    toggleWishlist(user.id, product.id);
                                }}
                                className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center transition-all z-20 hover:scale-110 border border-gray-100"
                            >
                                <Heart
                                    size={20}
                                    className={user && isInWishlist(user.id, product.id) ? 'text-red-500' : 'text-gray-400'}
                                    fill={user && isInWishlist(user.id, product.id) ? "currentColor" : "none"}
                                    strokeWidth={1.5}
                                />
                            </button>
                            <div className="relative h-[350px] md:h-[500px] flex items-center justify-center">
                                <motion.img
                                    key={selectedImage || DUMMY_IMAGES[0]}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    src={selectedImage || DUMMY_IMAGES[0]}
                                    alt={product.name}
                                    className="w-full h-full object-contain max-h-full mx-auto mix-blend-multiply"
                                    style={isImageHovered ? {
                                        transformOrigin: `${imageZoomPosition.x}% ${imageZoomPosition.y}%`,
                                        transform: 'scale(1.5)'
                                    } : {}}
                                />

                                {/* Tag Badge */}


                                {/* Zoom Hint */}
                                {!isImageHovered && (
                                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                                        Click to enlarge
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Thumbnails */}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => scrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
                                className="hidden md:flex w-8 h-8 rounded-full border border-black items-center justify-center hover:bg-gray-50 shrink-0 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div
                                ref={scrollRef}
                                className="flex gap-4 overflow-x-auto scrollbar-none items-center scroll-smooth py-1 px-1"
                            >
                                {DUMMY_IMAGES.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`shrink-0 w-20 h-20 md:w-24 md:h-24 bg-white border rounded-xl overflow-hidden p-2 transition-all
                                                    ${(selectedImage || DUMMY_IMAGES[0]) === img
                                                ? 'border-primary border-2 shadow-md scale-105'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => scrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
                                className="hidden md:flex w-8 h-8 rounded-full border border-black items-center justify-center hover:bg-gray-50 shrink-0 transition-colors"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        {/* Benefits Icons Row - Styled to match screenshot */}
                        <div className="grid grid-cols-4 items-center py-6 border-t border-b border-gray-100 mt-8">
                            {[
                                { label: 'Heart-Healthy', icon: HeartHandshake },
                                { label: 'Gluten Free', icon: WheatOff },
                                { label: 'Powerful Nutrition', icon: FileText },
                                { label: 'Cholesterol Free', icon: Ban }
                            ].map((item, i, arr) => (
                                <div key={i} className={`flex flex-col items-center gap-2.5 px-1 ${i !== arr.length - 1 ? 'border-r border-gray-200' : ''}`}>
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <item.icon size={28} strokeWidth={1.2} className="text-gray-800" />
                                    </div>
                                    <span className="text-[10px] md:text-[11px] text-gray-800 font-bold text-center leading-tight whitespace-nowrap">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - DETAILS */}
                    <div className="lg:col-span-7 lg:pl-8">
                        {/* Title & Share */}
                        <div className="flex justify-between items-start gap-4 mb-3 relative">
                            <h1 className="text-xl md:text-2xl font-semibold text-[#222] leading-tight">
                                {product.name}
                            </h1>
                            <div className="relative share-dropdown-container">
                                <button
                                    onClick={() => setShowShareDropdown(!showShareDropdown)}
                                    className="p-2 text-gray-500 hover:text-primary hover:bg-gray-50 rounded-full transition-colors shrink-0"
                                    aria-label="Share product"
                                >
                                    <Share2 size={20} />
                                </button>

                                {/* Share Dropdown */}
                                <AnimatePresence>
                                    {showShareDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-48 z-50"
                                        >
                                            <button
                                                onClick={() => handleShare('facebook')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                Facebook
                                            </button>
                                            <button
                                                onClick={() => handleShare('twitter')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                </svg>
                                                Twitter
                                            </button>
                                            <button
                                                onClick={() => handleShare('whatsapp')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                                            >
                                                <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                </svg>
                                                WhatsApp
                                            </button>
                                            <button
                                                onClick={() => handleShare('copy')}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
                                            >
                                                <Share2 size={18} className="text-gray-600" />
                                                Copy Link
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1 bg-primary text-white px-2 py-0.5 rounded text-xs font-bold">
                                <span>{product.rating || 4.8}</span>
                                <Star size={10} fill="white" stroke="white" />
                            </div>
                            <span className="text-xs text-gray-500">25 review / Write a review</span>
                        </div>

                        {/* Pricing */}
                        <div className="mb-1 flex items-baseline flex-wrap gap-2.5">
                            <span className="text-sm text-gray-500">MRP: <span className="line-through">₹{currentMrp}</span></span>
                            <span className="text-2xl font-bold text-primary">₹{currentPrice}</span>
                            <span className="text-xs text-gray-500">incl. of all taxes</span>
                            <span className="bg-[#E63946] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm lowercase">
                                {discountPercentage}% off
                            </span>
                            <span className="text-sm text-gray-800">({currentUnitPrice || '₹157.20/100g'})</span>
                        </div>
                        {saveAmount > 0 && (
                            <div className="text-primary text-sm font-bold mb-5 flex items-center gap-1.5">
                                Save ₹{saveAmount} instantly
                            </div>
                        )}

                        <div className="h-px bg-gray-200 w-full mb-6"></div>

                        {/* Selection Area */}
                        <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-8">
                            {/* Quantity */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm text-gray-600 font-medium">Quantity</span>
                                <div className="flex items-center border border-gray-200 rounded h-[42px] bg-white">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black text-xl transition-colors"
                                    >
                                        −
                                    </button>
                                    <div className="w-10 flex items-center justify-center font-bold text-gray-800 text-sm">
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black text-xl transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Divider Line (Visible on larger screens if needed, otherwise gap handles it) */}
                            <div className="hidden md:block w-px h-12 bg-gray-300 self-center"></div>

                            {/* Pack Sizes */}
                            {isGroupProduct ? (
                                <div className="flex gap-3">
                                    {product.variants.map((variant) => (
                                        <div
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`border rounded-lg px-4 py-2 cursor-pointer transition-all min-w-[100px] text-center relative ${selectedVariant.id === variant.id
                                                ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                                }`}
                                        >
                                            <div className="text-sm font-bold mb-0.5">{variant.weight}</div>
                                            <div className="text-xs font-bold">₹{variant.price}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border border-primary bg-primary/10 text-primary rounded-lg px-4 py-2 min-w-[100px] text-center shadow-sm">
                                    <div className="text-sm font-bold mb-0.5">{product.weight || '500g'}</div>
                                    <div className="text-xs font-bold">₹{product.price}</div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={() => {
                                    const skuId = isGroupProduct ? selectedVariant.id : product.id;
                                    addToCart(user?.id, skuId, quantity);
                                }}
                                className="flex-[1.2] bg-primary text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primaryHover transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} /> CART
                            </button>
                            <button
                                onClick={() => {
                                    const skuId = isGroupProduct ? selectedVariant.id : product.id;
                                    addToCart(user?.id, skuId, quantity);
                                    navigate('/checkout');
                                }}
                                className="flex-1 bg-[#111827] text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-black transition-colors"
                            >
                                BUY NOW
                            </button>
                        </div>

                        {/* Pincode & Service Area */}
                        <div className="mb-6">
                            <div className="flex items-center bg-white border border-gray-100 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-1.5 max-w-[350px]">
                                <input
                                    type="text"
                                    placeholder="Enter Pincode"
                                    className="flex-1 px-3 text-sm outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && checkPincode()}
                                />
                                <button
                                    onClick={checkPincode}
                                    className="bg-[#212121] text-white px-6 py-2 rounded-md font-bold text-[10px] hover:bg-black transition-all uppercase tracking-wider ml-2"
                                >
                                    CHECK
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-8 mt-5">
                            <div className="flex items-center gap-2 text-[#374151] font-bold text-[11px] uppercase tracking-wide">
                                <Truck size={17} className="text-primary" />
                                <span>Estimate delivery time</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#374151] font-bold text-[11px] uppercase tracking-wide">
                                <RotateCcw size={17} className="text-primary" />
                                <span>COD AVAILABLE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION - Tabs */}
                <div className="mt-10">
                    {/* Tab Navigation */}
                    <div className="flex items-center justify-between w-full mb-8 border-b border-gray-200 pb-0 px-4 md:px-0">
                        {tabs.map((tab, index) => (
                            <React.Fragment key={tab}>
                                <button
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 md:py-4 text-sm md:text-base transition-all relative text-center
                                        ${activeTab === tab
                                            ? 'font-semibold text-black'
                                            : 'font-medium text-gray-500 hover:text-black'
                                        }
                                    `}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        />
                                    )}
                                </button>
                                {index < tabs.length - 1 && (
                                    <span className="hidden md:inline-block text-gray-200 font-extralight">|</span>
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
                            className="max-w-4xl mx-auto text-left"
                        >
                            {activeTab === 'Description' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-black font-semibold">Product Description</h3>
                                    <p className="text-sm md:text-base text-gray-600 leading-relaxed text-justify px-2">
                                        {product.description || `Nutraj brings a premium assortment of walnut kernels to your plate in the form of ${product.name}. As the name says, these Anmol walnut kernels are nothing short of precious treats as they come from 1% of the Rarest Crop, grown worldwide. Since the crop is handpicked from the best, these walnut kernels are jumbo-sized, extra crunchier in taste, and contain exceptional nutritional value.`}
                                    </p>
                                    <div className="flex justify-center">
                                        <img src={product.image} className="w-40 md:w-60 h-auto object-contain rounded-xl opacity-90 mix-blend-multiply" alt="" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Benefits' && (
                                <div className="text-left space-y-4">
                                    <h3 className="text-xl font-bold text-black font-semibold">Health Benefits</h3>
                                    <ul className="list-disc pl-5 space-y-4 text-sm md:text-base text-gray-600 leading-relaxed">
                                        {[
                                            'Rich in Antioxidants: Almonds are a fantastic source of antioxidants, which help protect your cells from oxidative damage.',
                                            'High in Vitamin E: They are among the world\'s best sources of vitamin E, which is linked to numerous health benefits.',
                                            'Assists with Blood Sugar Control: Nuts are low in carbs but high in healthy fats, protein, and fiber, making them a perfect choice for people with diabetes.',
                                            'Magnesium Benefits: Almonds are incredibly high in magnesium, a mineral that many people don\'t get enough of.',
                                            'Can Lower Cholesterol Levels: High levels of LDL lipoproteins in your blood — also known as "bad" cholesterol — is a well-known risk factor for heart disease.',
                                            'Prevents Harmful Oxidation of LDL Cholesterol: Almonds do more than just lower LDL levels in your blood. They also protect LDL from oxidation.'
                                        ].map((b, i) => (
                                            <li key={i} className="pl-2">
                                                <span className="font-bold text-primary">{b.split(':')[0]}:</span>
                                                {b.split(':')[1]}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeTab === 'Specifications' && (
                                <div className="text-left border border-gray-200 rounded-lg overflow-hidden">
                                    {[
                                        { label: 'Brand Name', value: 'Nutraj' },
                                        { label: 'Shelf Life', value: '6 Months' },
                                        { label: 'Container Type', value: 'Pouch' },
                                        { label: 'Net Weight', value: '500g' },
                                        { label: 'Ingredients', value: 'Sonora Almonds' },
                                        { label: 'Country of Origin', value: 'USA' }
                                    ].map((spec, idx, arr) => (
                                        <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 p-4 text-sm ${idx !== (arr.length - 1) ? 'border-b border-gray-200' : ''}`}>
                                            <div className="font-bold text-black font-semibold">{spec.label}</div>
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
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <Star key={i} size={16} fill={i <= 5 ? "currentColor" : "none"} />
                                                    ))}
                                                </div>
                                                <span className="text-lg font-black text-black tracking-tight">5.0</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Based on 6 reviews</p>
                                        </div>
                                        <button
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="w-full md:w-auto bg-primary text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primaryHover transition-all shadow-md active:scale-95"
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
                                                        <div className="flex gap-1 text-[#842A35]">
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
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#842A35]/20 outline-none transition-all placeholder-gray-300"
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
                                        {[
                                            { name: 'Aditi Sharma', rating: 5, date: '12/01/2024', title: 'Excellent quality', comment: 'The almonds are jumbo-sized and very fresh. Highly recommended!' },
                                            { name: 'Rahul Gupta', rating: 5, date: '05/01/2024', title: 'Best badam ever', comment: 'Quality is superior to local markets. Crunchy and sweet.' },
                                            { name: 'Priya Verma', rating: 5, date: '28/12/2023', title: 'Great packaging', comment: 'Arrived on time. The vacuum seal was intact.' },
                                            { name: 'Amit Kumar', rating: 5, date: '15/12/2023', title: 'Premium product', comment: 'Worth every penny. Nutraj maintains great standards.' },
                                            { name: 'Sneh Lata', rating: 5, date: '10/12/2023', title: 'Crunchy and delicious', comment: 'Perfect for my morning routine. Will buy again.' },
                                            { name: 'Vijay Singh', rating: 5, date: '01/12/2023', title: 'Good value', comment: 'Great discount on the price. Happy with the purchase.' }
                                        ].map((review, idx) => (
                                            <div key={idx} className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-50 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 flex flex-col justify-between h-full">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2.5">
                                                        <div className="flex text-primary">
                                                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-300">{review.date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-black text-black text-sm">{review.name}</span>
                                                    </div>
                                                    <h4 className="font-bold text-[15px] text-black mb-2 leading-tight">{review.title}</h4>
                                                    <p className="text-xs text-gray-500 leading-relaxed">{review.comment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'FAQ' && (
                                <div className="text-left space-y-4">
                                    {[
                                        { q: 'How should I store these almonds?', a: 'Store them in a cool, dry place. For longer freshness, preserve them in an airtight container or refrigerate them.' },
                                        { q: 'What is the shelf life of the product?', a: 'The shelf life is approximately 6 months from the date of packaging.' },
                                        { q: 'Are these almonds chemically treated?', a: 'No, these almonds are processed using the Bactopure process which makes them 99.9% bacteria-free without any harmful chemicals.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="pb-4 border-b border-gray-50 last:border-0">
                                            <h4 className="text-primary font-bold text-sm mb-2">Q: {item.q}</h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">A: {item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'Nutrition Info' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left p-6 bg-gray-50 rounded-xl">
                                    {[
                                        { label: 'Energy', value: '579 kcal' },
                                        { label: 'Protein', value: '21.15 g' },
                                        { label: 'Total Fat', value: '49.93 g' },
                                        { label: 'Carbs', value: '21.55 g' }
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
                                            <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                                            <div className="text-lg font-bold text-primary">{stat.value}</div>
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
                                <h3 className="text-lg font-bold text-black font-semibold">Recently Viewed</h3>
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
                                <h3 className="text-lg font-bold text-black font-semibold">Picked for You</h3>
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

            {/* Image Lightbox Modal */}
            < AnimatePresence >
                {showImageLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowImageLightbox(false)}
                    >
                        <button
                            onClick={() => setShowImageLightbox(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black/50 backdrop-blur-sm transition-colors z-10"
                            aria-label="Close lightbox"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={selectedImage || product.image}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence >

            {/* Sticky Mobile Add to Cart Bar */}
            < AnimatePresence >
                {showStickyBar && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
                    >
                        <div className="flex items-center gap-4">
                            <img src={selectedImage || product.image} alt="" className="w-12 h-12 object-contain bg-gray-50 rounded" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-gray-800 truncate">{product.name}</h4>
                                <div className="text-[#842A35] font-bold text-sm">₹{currentPrice}</div>
                            </div>
                            <button
                                onClick={() => {
                                    if (!user) return navigate('/login');
                                    const skuId = isGroupProduct ? selectedVariant.id : product.id;
                                    addToCart(user.id, skuId, quantity);
                                }}
                                className="bg-[#6B242E] text-white px-6 py-2.5 rounded font-bold text-sm"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </div >
    );
};

export default ProductDetailPage;
