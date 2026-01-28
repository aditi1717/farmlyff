import React from 'react';
import { Search, User, Heart, ShoppingCart, LayoutGrid, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopContext';
import logo from '../../../assets/logo.png';

const Navbar = () => {
    const { user } = useAuth();
    const { getCart, getWishlist, saveForLater } = useShop();
    const savedItemsCount = user ? saveForLater(user.id).length : 0;

    const cartCount = user ? getCart(user.id).reduce((acc, item) => acc + item.qty, 0) : 0;
    const wishlistCount = user ? getWishlist(user.id).length : 0;

    return (
        <nav className="bg-background sticky top-0 md:relative z-40 border-b border-gray-100 py-3 md:py-4 px-4 md:px-12">
            <div className="flex justify-between items-center gap-4 md:gap-8">
                {/* Logo */}
                <Link to="/" className="flex-shrink-0 flex items-center gap-1.5">
                    <img src={logo} alt="FarmLyf" className="h-7 md:h-9 w-auto object-contain" />
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex flex-1 max-w-2xl relative group">
                    <div className="flex w-full items-center border border-gray-300 rounded-full bg-white overflow-hidden transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 hover:border-gray-400">
                        <button className="px-4 py-2.5 text-textSecondary text-sm font-medium border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1">
                            All Categories
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <input
                            type="text"
                            placeholder="Search for Raisin, Almonds..."
                            className="flex-1 px-4 py-2.5 text-textPrimary placeholder-gray-400 outline-none w-full"
                        />
                        <button className="px-5 py-2.5 text-gray-500 hover:text-primary transition-colors">
                            <Search size={22} />
                        </button>
                    </div>
                </div>

                {/* Icons */}
                <div className="flex items-center gap-4 md:gap-7 lg:gap-8 shrink-0">
                    {/* Industry Standard Order: Shop | Profile | Wishlist | Vault | Cart */}
                    <Link to="/catalog" className="flex flex-col items-center gap-0.5 text-textPrimary hover:text-primary transition-colors group">
                        <LayoutGrid size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium hidden md:block">Shop</span>
                    </Link>

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
