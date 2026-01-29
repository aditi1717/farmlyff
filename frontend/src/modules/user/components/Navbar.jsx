import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, LayoutGrid, Bookmark } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
// import { useShop } from '../../../context/ShopContext'; // Deprecated
import useCartStore from '../../../store/useCartStore';
import useUserStore from '../../../store/useUserStore';
import { useCategories, useSubCategories } from '../../../hooks/useProducts';

import logo from '../../../assets/logo.png';

const Navbar = () => {
    const { user } = useAuth();
    
    // Zustand Stores
    const cartItemsMap = useCartStore(state => state.cartItems);
    const wishlistMap = useUserStore(state => state.wishlist);
    const savedItemsMap = useUserStore(state => state.saveForLater);

    const cartItems = cartItemsMap[user?.id] || [];
    const wishlist = wishlistMap[user?.id] || [];
    const savedItems = savedItemsMap[user?.id] || [];

    // React Query
    const { data: categories = [] } = useCategories();
    const { data: subCategories = [] } = useSubCategories();

    const [showCategories, setShowCategories] = React.useState(false);

    const savedItemsCount = savedItems.length;
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const wishlistCount = wishlist.length;

    return (
        <nav className="bg-background sticky top-0 md:relative z-40 border-b border-gray-100 py-3 md:py-4 px-4 md:px-12">
            <div className="flex justify-between items-center gap-4 md:gap-8">
                {/* Logo */}
                <Link to="/" className="flex-shrink-0 flex items-center gap-1.5">
                    <img src={logo} alt="FarmLyf" className="h-7 md:h-9 w-auto object-contain" />
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-2xl relative group z-50">
                    <div className="flex w-full items-center border border-gray-300 rounded-full bg-white transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 hover:border-gray-400 relative">
                        <div className="relative">
                            <button 
                                onClick={() => setShowCategories(!showCategories)}
                                onBlur={() => setTimeout(() => setShowCategories(false), 200)}
                                className="px-4 py-2.5 text-textSecondary text-sm font-medium border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1 rounded-l-full h-full"
                            >
                                All Categories
                                <svg className={`w-3 h-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showCategories && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    {categories.filter(c => c.status === 'Active').length > 0 ? (
                                        categories.filter(c => c.status === 'Active').map(cat => (
                                            <Link 
                                                key={cat.id || cat._id} 
                                                to={`/category/${cat.slug}`}
                                                className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors font-medium border-b border-gray-50 last:border-0"
                                                onClick={() => setShowCategories(false)}
                                            >
                                                {cat.name}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-400 italic">No categories found</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Search for Raisin, Almonds..."
                            className="flex-1 px-4 py-2.5 text-textPrimary placeholder-gray-400 outline-none w-full bg-transparent"
                        />
                        <button className="px-5 py-2.5 text-gray-500 hover:text-primary transition-colors rounded-r-full">
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
                            <span className="text-[10px] font-medium hidden md:block">Shop</span>
                        </Link>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full pt-4 hidden group-hover:block w-[600px] z-50">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                                {categories.filter(c => c.status === 'Active').map(cat => (
                                    <div key={cat._id || cat.id} className="space-y-3">
                                        <Link 
                                            to={`/category/${cat.slug}`}
                                            className="font-black text-footerBg text-sm hover:text-primary transition-colors block border-b border-gray-100 pb-2 uppercase tracking-wide"
                                        >
                                            {cat.name}
                                        </Link>
                                        <div className="space-y-2 flex flex-col">
                                            {subCategories.filter(sub => (sub.parent === cat.id || sub.parent === cat._id || sub.parent?._id === cat.id || sub.parent?._id === cat._id) && sub.status === 'Active').map(sub => (
                                                <Link 
                                                    key={sub._id || sub.id}
                                                    to={`/category/${cat.slug}/${sub.slug}`} // Assuming route structure
                                                    className="text-xs text-gray-500 hover:text-primary transition-colors font-medium hover:translate-x-1 duration-200"
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                            {subCategories.filter(sub => (sub.parent === cat.id || sub.parent === cat._id || sub.parent?._id === cat.id || sub.parent?._id === cat._id)).length === 0 && (
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
