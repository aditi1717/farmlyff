import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, LayoutGrid, Bookmark } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
// import { useShop } from '../../../context/ShopContext'; // Deprecated
import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useCategories, useSubCategories, useProducts } from '../../../hooks/useProducts';

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

    const { filteredProducts, filteredCats, filteredSubs } = React.useMemo(() => {
        if (!searchQuery) return { filteredProducts: [], filteredCats: [], filteredSubs: [] };
        
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

        return { filteredProducts: fp, filteredCats: fc, filteredSubs: fs };
    }, [searchQuery, products, categories, subCategories, selectedCategory]);

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
        <nav className="bg-background sticky top-0 md:relative border-b border-gray-100 py-3 md:py-4 px-4 md:px-12" style={{ zIndex: 10005 }}>
            <div className="flex justify-between items-center gap-4 md:gap-8">
                {/* Logo */}
                <Link to="/" className="flex-shrink-0 flex items-center gap-1.5">
                    <img src={logo} alt="FarmLyf" className="h-7 md:h-9 w-auto object-contain" />
                </Link>

                {/* Search Bar - Functional */}
                <div className="hidden md:flex flex-1 max-w-2xl relative group z-50">
                    <div className="flex w-full items-center border border-gray-300 rounded-full bg-white transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 hover:border-gray-400 relative">
                        <div className="relative">
                            <button 
                                onClick={() => setShowCategories(!showCategories)}
                                onBlur={() => setTimeout(() => setShowCategories(false), 200)}
                                className="px-4 py-2.5 text-textSecondary text-sm font-medium border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1 rounded-l-full h-full whitespace-nowrap"
                            >
                                {selectedCategory ? selectedCategory.name : 'All Categories'}
                                <svg className={`w-3 h-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showCategories && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2" style={{ zIndex: 10006 }}>
                                    <button
                                        onClick={() => { setSelectedCategory(null); setShowCategories(false); }}
                                        className={`block w-full text-left px-4 py-2.5 text-sm transition-colors font-medium border-b border-gray-50 ${!selectedCategory ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.filter(c => c.status === 'Active').length > 0 ? (
                                        categories.filter(c => c.status === 'Active').map(cat => (
                                            <button 
                                                key={cat.id || cat._id} 
                                                onClick={() => { setSelectedCategory(cat); setShowCategories(false); }}
                                                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors font-medium border-b border-gray-50 last:border-0 ${selectedCategory && (selectedCategory.id === cat.id || selectedCategory._id === cat._id) ? 'text-primary bg-primary/5' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-400 italic">No categories found</div>
                                    )}
                                </div>
                            )}
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
                            
                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && searchQuery.length > 0 && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2" style={{ zIndex: 10006 }}>
                                    
                                    {/* Products */}
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
                                                    <img src={p.image} className="w-8 h-8 object-contain mix-blend-multiply" alt=""/>
                                                    <div>
                                                        <div className="text-sm font-bold text-footerBg">{p.name}</div>
                                                        <div className="text-[10px] text-gray-400">₹{p.price}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Categories */}
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

                                    {/* Subcategories */}
                                    {filteredSubs.length > 0 && (
                                        <div className="mb-1">
                                             <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50">Collections</div>
                                             {filteredSubs.map(s => (
                                                 <Link
                                                    key={s.id || s._id}
                                                    to={getSubLink(s)}
                                                    onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                                                    className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50"
                                                 >
                                                     {s.name}
                                                 </Link>
                                             ))}
                                        </div>
                                    )}

                                    {filteredProducts.length === 0 && filteredCats.length === 0 && filteredSubs.length === 0 && (
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
                    {/* Industry Standard Order: Shop | Profile | Wishlist | Vault | Cart */}
                    {/* Shop Dropdown */}
                    <div className="relative group z-30">
                        <Link to="/catalog" className="flex flex-col items-center gap-0.5 text-textPrimary hover:text-primary transition-colors">
                            <LayoutGrid size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-medium hidden md:block">Shop ({categories.filter(c => c.status === 'Active' && c.showInNavbar !== false).length})</span>
                        </Link>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full pt-4 hidden group-hover:block w-[600px] z-50">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                {categories
                                    .filter(c => c.status === 'Active' && (c.showInNavbar !== false))
                                    .map(cat => (
                                    <div key={cat._id || cat.id} className="space-y-3">
                                        <Link 
                                            to={`/category/${cat.slug}`}
                                            className="font-black text-footerBg text-sm hover:text-primary transition-colors block border-b border-gray-100 pb-2 uppercase tracking-wide"
                                        >
                                            {cat.name}
                                        </Link>
                                        <div className="space-y-2 flex flex-col">
                                            {subCategories.filter(sub => {
                                                const subParentId = sub.parent?._id || sub.parent;
                                                const catId = cat._id || cat.id;
                                                // Strict check: IDs must exist and match
                                                return subParentId && catId && String(subParentId) === String(catId) && sub.status === 'Active';
                                            }).map(sub => (
                                                <Link 
                                                    key={sub._id || sub.id}
                                                    to={`/category/${cat.slug}/${sub.slug}`} // Assuming route structure
                                                    className="text-xs text-gray-500 hover:text-primary transition-colors font-medium hover:translate-x-1 duration-200"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                            {subCategories.filter(sub => {
                                                const subParentId = sub.parent?._id || sub.parent;
                                                const catId = cat._id || cat.id;
                                                return subParentId && catId && String(subParentId) === String(catId);
                                            }).length === 0 && (
                                               <Link to={`/category/${cat.slug}`} className="text-[10px] text-gray-400 italic hover:text-primary">
                                                  View all {cat.name}
                                               </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>

                    <Link to={user ? "/profile" : "/login"} className="flex flex-col items-center gap-0.5 text-textPrimary hover:text-primary transition-colors group border-l border-gray-100 pl-4 md:pl-7">
                        <User size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium hidden md:block">
                            {user ? user.name.split(' ')[0] : 'Profile'}
                        </span>
                    </Link>

                    <Link to="/wishlist" className="relative flex flex-col items-center gap-0.5 text-textPrimary hover:text-primary transition-colors group">
                        <div className="relative">
                            <Heart size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
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

            {/* Mobile Search (Visible only on mobile) */}
            <div className="mt-3 md:hidden relative">
                <input
                    type="text"
                    placeholder="Search for amazing dry fruits..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm outline-none focus:border-primary"
                />
                <Search size={18} className="absolute right-3 top-2.5 text-gray-400" />
            </div>
        </nav>
    );
};

export default Navbar;
