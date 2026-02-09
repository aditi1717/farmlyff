import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Heart, User, LayoutGrid, Bookmark, ChevronDown, Menu, Home, Package } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useCategories, useSubCategories, useProducts, useComboCategories } from '../../../hooks/useProducts';
import { useQuery } from '@tanstack/react-query';

import logo from '../../../assets/logo.png';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Zustand Stores
    const cartItemsMap = useCartStore(state => state.cartItems);
    const wishlistMap = useUserStore(state => state.wishlist);
    const savedItemsMap = useUserStore(state => state.saveForLater);

    const cartItems = cartItemsMap[user?.id] || [];
    const wishlist = wishlistMap[user?.id] || [];
    const savedItems = savedItemsMap[user?.id] || [];

    // React Query
    const { data: rawCategories = [] } = useCategories();
    const { data: rawSubCategories = [] } = useSubCategories();
    const { data: products = [] } = useProducts();

    // Fetch Combo Categories from centralized hook
    const { data: comboCategories = [] } = useComboCategories();

    const categories = React.useMemo(() => {
        const unique = [];
        const seen = new Set();
        for (const cat of rawCategories) {
            const id = cat._id || cat.id;
            if (id && !seen.has(id)) {
                seen.add(id);
                unique.push(cat);
            }
        }
        return unique;
    }, [rawCategories]);

    const subCategories = React.useMemo(() => {
        const unique = [];
        const seen = new Set();
        for (const sub of rawSubCategories) {
            const id = sub._id || sub.id;
            if (id && !seen.has(id)) {
                seen.add(id);
                unique.push(sub);
            }
        }
        return unique;
    }, [rawSubCategories]);

    const [showCategories, setShowCategories] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [hoveredCategoryInMenu, setHoveredCategoryInMenu] = React.useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [expandedMenu, setExpandedMenu] = React.useState(null); // Accordion State

    const { filteredProducts, filteredCats, filteredSubs, filteredCombos } = React.useMemo(() => {
        if (!searchQuery) return { filteredProducts: [], filteredCats: [], filteredSubs: [], filteredCombos: [] };

        const q = searchQuery.toLowerCase();

        let fp = products.filter(p =>
            (p.name?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.id?.toLowerCase().includes(q)) &&
            p.status !== 'Inactive'
        );

        // Filter by selected category if applicable
        if (selectedCategory) {
            fp = fp.filter(p => {
                const pCatId = p.category?._id || p.category; // Handle populated/ref
                const selCatId = selectedCategory._id || selectedCategory.id;
                // Try matching by ID or Name if ID fails (legacy data support)
                return (pCatId && String(pCatId) === String(selCatId)) || (p.category === selectedCategory.name);
            });
        }

        // Only show matching categories if NO category is selected (otherwise it's redundant)
        const fc = !selectedCategory ? categories.filter(c =>
            c.name?.toLowerCase().includes(q) && c.status === 'Active'
        ) : [];

        const fs = subCategories.filter(s =>
            s.name?.toLowerCase().includes(q) && s.status === 'Active'
        );

        const fcom = comboCategories.filter(c =>
            c.name?.toLowerCase().includes(q) && c.status === 'Active'
        );

        return { filteredProducts: fp, filteredCats: fc, filteredSubs: fs, filteredCombos: fcom };
    }, [searchQuery, products, categories, subCategories, selectedCategory, comboCategories]);

    const getSubLink = React.useCallback((sub) => {
        const parentId = sub.parent?._id || sub.parent;
        const parent = categories.find(c => String(c._id || c.id) === String(parentId));
        const parentSlug = parent?.slug || 'all';
        return `/category/${parentSlug}/${sub.slug}`;
    }, [categories]);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
        }
    };

    const savedItemsCount = savedItems.length;
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const wishlistCount = wishlist.length;

    return (
        <nav className="bg-white sticky top-0 md:relative border-b border-gray-100 py-2.5 md:py-4 px-4 md:px-12" style={{ zIndex: 10005 }}>
            {/* Desktop View Header */}
            <div className="hidden md:flex justify-between items-center gap-4 md:gap-8">
                {/* Logo */}
                <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 relative">
                    <img src={logo} alt="FarmLyf" className="h-7 md:h-9 w-auto object-contain" />
                    {user?.accountType === 'Business' && (
                        <span className="absolute -top-1 -right-8 bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Business</span>
                    )}
                </Link>

                {/* Search Bar - Functional */}
                <div className="flex flex-1 max-w-2xl relative group z-50">
                    <div className="flex w-full items-center border border-gray-300 rounded-full bg-white transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 hover:border-gray-400 relative">
                        <div
                            className="relative h-full"
                            onMouseEnter={() => setShowCategories(true)}
                            onMouseLeave={() => setShowCategories(false)}
                        >
                            <button
                                className="px-5 py-2.5 text-textSecondary text-sm font-bold bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-l-full h-full whitespace-nowrap min-w-[160px] border-r border-gray-200"
                            >
                                {selectedCategory ? selectedCategory.name : 'All Categories'}
                                <ChevronDown size={14} className={`transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`} />
                            </button>

                            {/* MEGA MENU POPUP */}
                            <AnimatePresence>
                                {showCategories && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-[1px] w-[650px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex min-h-[280px]"
                                        style={{ zIndex: 10006 }}
                                    >
                                        <div className="w-[180px] bg-white py-2 border-r border-black">
                                            <div className="flex flex-col">
                                                {categories.filter(c => c.status === 'Active').map(cat => (
                                                    <button
                                                        key={cat.id || cat._id}
                                                        onMouseEnter={() => setHoveredCategoryInMenu(cat)}
                                                        onClick={() => { setSelectedCategory(cat); setShowCategories(false); }}
                                                        className={`w-full text-left px-6 py-2 text-[13px] font-bold transition-all relative group
                                                            ${(hoveredCategoryInMenu?.id === cat.id || hoveredCategoryInMenu?._id === cat._id)
                                                                ? 'text-black'
                                                                : 'text-gray-500 hover:text-black'}`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-white py-4 px-7 border-r border-gray-50">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                {(hoveredCategoryInMenu || (categories.filter(c => c.status === 'Active')[0])) && (
                                                    (subCategories.filter(s => {
                                                        const hoveredId = hoveredCategoryInMenu?._id || hoveredCategoryInMenu?.id;
                                                        const firstId = categories.filter(c => c.status === 'Active')[0]?.id || categories.filter(c => c.status === 'Active')[0]?._id;
                                                        const targetId = hoveredId || firstId;
                                                        const parentId = s.parent?._id || s.parent;
                                                        return String(parentId) === String(targetId);
                                                    }).map(sub => (
                                                        <Link
                                                            key={sub.id || sub._id}
                                                            to={getSubLink(sub)}
                                                            onClick={() => setShowCategories(false)}
                                                            className="text-[13px] font-medium text-gray-700 hover:text-black transition-colors"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    )))
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-[220px] p-3 flex items-center justify-center bg-white">
                                            <div className="relative w-full h-[220px] rounded-lg overflow-hidden group shadow-sm">
                                                <img
                                                    src="https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=1000&auto=format&fit=crop"
                                                    alt="Featured"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search for products, categories..."
                                className="w-full px-4 py-2.5 text-textPrimary placeholder-gray-400 outline-none bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />

                            {showSuggestions && searchQuery.length > 0 && (
                                <div
                                    className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2"
                                    style={{ zIndex: 10006 }}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {filteredProducts.length > 0 && (
                                        <div className="mb-2">
                                            <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Products</div>
                                            {filteredProducts.slice(0, 5).map(p => (
                                                <Link
                                                    key={p.id}
                                                    to={`/product/${p.slug || p.id}`}
                                                    onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                                >
                                                    <img src={p.image} className="w-8 h-8 object-contain mix-blend-multiply" alt="" />
                                                    <div>
                                                        <div className="text-sm font-bold text-footerBg">{p.name}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {filteredCats.length > 0 && (
                                        <div className="mb-2">
                                            <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Categories</div>
                                            {filteredCats.map(c => (
                                                <Link
                                                    key={c.id || c._id}
                                                    to={`/category/${c.slug}`}
                                                    onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                                                    className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50"
                                                >
                                                    {c.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {filteredCombos.length > 0 && (
                                        <div className="mb-1">
                                            <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Combo Packs</div>
                                            {filteredCombos.map(c => (
                                                <Link
                                                    key={c.id || c._id}
                                                    to={`/category/combos-packs/${c.slug}`}
                                                    onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                                                    className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50"
                                                >
                                                    {c.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {filteredProducts.length === 0 && filteredCats.length === 0 && filteredSubs.length === 0 && filteredCombos.length === 0 && (
                                        <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                            No results found for "<span className="font-bold text-gray-600">{searchQuery}</span>"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            className="px-5 py-2.5 text-gray-500 hover:text-primary transition-colors rounded-r-full"
                        >
                            <Search size={22} />
                        </button>
                    </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 md:gap-7 lg:gap-8 shrink-0">
                    <Link to={user ? "/profile" : "/login"} className="flex flex-col items-center gap-0.5 text-textPrimary hover:text-primary transition-colors group border-l border-gray-100 pl-4 md:pl-7">
                        <User size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium hidden md:block">
                            {user ? user.name.split(' ')[0] : 'Profile'}
                        </span>
                    </Link>

                    <Link to="/wishlist" className="relative flex flex-col items-center gap-0.5 text-textPrimary hover:text-red-500 transition-colors group">
                        <div className="relative">
                            <Heart size={22} strokeWidth={1.5} className="group-hover:scale-110 group-hover:fill-current transition-transform" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium hidden md:block">Wishlist</span>
                    </Link>

                    <Link to="/vault" className="relative flex flex-col items-center gap-0.5 text-textPrimary hover:text-primary transition-colors group">
                        <div className="relative">
                            <Bookmark size={22} strokeWidth={1.5} fill={savedItemsCount > 0 ? "currentColor" : "none"} className="group-hover:scale-110 transition-transform" />
                            {savedItemsCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                                    {savedItemsCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium hidden md:block">Vault</span>
                    </Link>

                    <Link to="/cart" className="relative flex flex-col items-center gap-0.5 text-textPrimary hover:text-primary transition-colors group">
                        <div className="relative">
                            <ShoppingCart size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium hidden md:block">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Mobile View Header - Matched to Screenshot */}
            <div className="flex md:hidden items-center justify-between w-full h-10">
                {/* Hamburger */}
                <button
                    className="p-1 text-black"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu size={24} strokeWidth={2.5} />
                </button>

                {/* Centered Logo */}
                <Link to="/" className="flex-shrink-0 absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
                    <img src={logo} alt="FarmLyf" className="h-6 w-auto object-contain" />
                    {user?.accountType === 'Business' && (
                        <span className="bg-black text-white text-[7px] font-black px-1 py-0.5 rounded uppercase leading-none">Business</span>
                    )}
                </Link>

                {/* Right Icons */}
                <div className="flex items-center gap-4">
                    <button className="p-1 text-black">
                        <Search size={22} strokeWidth={2.5} />
                    </button>
                    <Link to="/cart" className="relative p-1 text-black">
                        <ShoppingCart size={22} strokeWidth={2.5} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#8B0000] text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Mobile Menu Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[10010] md:hidden"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed top-0 left-0 h-full w-[85%] bg-[#0B1221] z-[10011] shadow-2xl md:hidden overflow-y-auto"
                        >
                            <div className="flex flex-col h-full text-white">
                                {/* Header */}
                                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                                    <img src={logo} alt="FarmLyf" className="h-6 w-auto object-contain brightness-0 invert" />
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors text-white"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto py-4">
                                    <div className="flex flex-col gap-1 px-3">
                                        {/* Home */}
                                        <Link
                                            to="/"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-[#25D366]">
                                                <Home size={22} />
                                            </span>
                                            <span className="font-bold tracking-wide text-sm">HOME</span>
                                        </Link>

                                        {/* Shop */}
                                        <Link
                                            to="/catalog"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-[#25D366]">
                                                <LayoutGrid size={22} />
                                            </span>
                                            <span className="font-bold tracking-wide text-sm">SHOP</span>
                                        </Link>

                                        {/* Combos & Packs */}
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => {
                                                    setExpandedMenu(expandedMenu === 'combos' ? null : 'combos');
                                                }}
                                                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[#25D366]">
                                                        <Package size={22} />
                                                    </span>
                                                    <span className="font-bold tracking-wide text-sm uppercase">COMBOS & PACKS</span>
                                                </div>
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-400 transition-transform duration-300 ${expandedMenu === 'combos' ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            <AnimatePresence>
                                                {expandedMenu === 'combos' && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden bg-black/20 rounded-lg mx-2"
                                                    >
                                                        <div className="flex flex-col py-2">
                                                            <Link
                                                                to="/category/combos-packs"
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="px-11 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                                            >
                                                                <span>View All Combos</span>
                                                            </Link>
                                                            {comboCategories.filter(c => c.status === 'Active').map(combo => (
                                                                <Link
                                                                    key={combo.id || combo._id}
                                                                    to={`/category/combos-packs/${combo.slug}`}
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                    className="px-11 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                                                >
                                                                    {combo.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Categories */}
                                        {categories.filter(c => c.status === 'Active' && c.slug !== 'combos-packs').map((category) => {
                                            const isExpanded = expandedMenu === (category.id || category._id);
                                            const catSubs = subCategories.filter(s => {
                                                const parentId = s.parent?._id || s.parent;
                                                return String(parentId) === String(category.id || category._id) && s.status === 'Active';
                                            });
                                            const hasSubs = catSubs.length > 0;

                                            return (
                                                <div key={category.id || category._id} className="flex flex-col">
                                                    <button
                                                        onClick={() => {
                                                            if (hasSubs) {
                                                                setExpandedMenu(isExpanded ? null : (category.id || category._id));
                                                            } else {
                                                                navigate(`/category/${category.slug}`);
                                                                setIsMobileMenuOpen(false);
                                                            }
                                                        }}
                                                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[#25D366]">
                                                                <LayoutGrid size={22} />
                                                            </span>
                                                            <span className="font-bold tracking-wide text-sm uppercase">{category.name}</span>
                                                        </div>
                                                        {hasSubs && (
                                                            <ChevronDown
                                                                size={16}
                                                                className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                            />
                                                        )}
                                                    </button>

                                                    {/* Subcategories Dropdown */}
                                                    <AnimatePresence>
                                                        {isExpanded && hasSubs && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden bg-black/20 rounded-lg mx-2"
                                                            >
                                                                <div className="flex flex-col py-2">
                                                                    <Link
                                                                        to={`/category/${category.slug}`}
                                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                                        className="px-11 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <span>View All {category.name}</span>
                                                                    </Link>
                                                                    {catSubs.map(sub => (
                                                                        <Link
                                                                            key={sub.id || sub._id}
                                                                            to={getSubLink(sub)}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="px-11 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                                                                        >
                                                                            {sub.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
