import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Layers,
    Package,
    Boxes,
    ShoppingBag,
    RefreshCcw,
    TicketPercent,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Plus,
    List,
    Share2,
    Monitor,
    Video,
    MessageSquare,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [combosExpanded, setCombosExpanded] = useState(false);
    const [comboProductsExpanded, setComboProductsExpanded] = useState(false);
    const [productsExpanded, setProductsExpanded] = useState(false);
    const [bannersExpanded, setBannersExpanded] = useState(false);
    const [reviewsExpanded, setReviewsExpanded] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Layers, label: 'Categories', path: '/admin/categories' },
        { icon: Layers, label: 'Sub-categories', path: '/admin/sub-categories' },
        // Products and Banners moved to manual handling
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
        { icon: RefreshCcw, label: 'Returns', path: '/admin/returns' },
        { icon: TicketPercent, label: 'Coupons', path: '/admin/coupons' },
        { icon: Share2, label: 'Referrals', path: '/admin/referrals' },
    ];

    const isActive = (path) => location.pathname.startsWith(path);
    const isCombosActive = location.pathname.startsWith('/admin/combo');
    const isProductsActive = location.pathname.startsWith('/admin/products');
    const isBannersActive = location.pathname.startsWith('/admin/banners');

    return (
        <div className="w-72 h-screen bg-footerBg text-white flex flex-col fixed left-0 top-0 z-50 overflow-hidden" style={{ overscrollBehavior: 'contain' }} data-lenis-prevent>
            {/* Logo Section */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3 shrink-0">
                <img src={logo} alt="FarmLyf" className="h-8 w-auto object-contain" />
                <span className="font-brand font-bold text-xl tracking-tight">Admin</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar" style={{ overscrollBehavior: 'contain' }} data-lenis-prevent>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-2 tracking-widest">Main Menu</p>

                {/* Items Before Products (Dashboard to Sub-categories) */}
                {menuItems.slice(0, 4).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive(item.path)
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                        <span className="font-bold text-sm">{item.label}</span>
                    </Link>
                ))}

                {/* Products Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => setProductsExpanded(!productsExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isProductsActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Package size={20} strokeWidth={isProductsActive ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Products</span>
                        {productsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {productsExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/products/add"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/products/add'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Add Product</span>
                            </Link>
                            <Link
                                to="/admin/products"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/products'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Product List</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Combos Section - Updated to 3 Sub-items */}
                <div className="mt-1">
                    <button
                        onClick={() => setCombosExpanded(!combosExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isCombosActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Boxes size={20} strokeWidth={isCombosActive ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Combos</span>
                        {combosExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {combosExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            {/* 1. Combo Categories */}
                            <Link
                                to="/admin/combo-categories"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/combo-categories'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Layers size={16} />
                                <span className="font-semibold">Combo Categories</span>
                            </Link>

                            {/* 2. Add Combo Product */}
                            <Link
                                to="/admin/combo-products/add"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/combo-products/add'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Add Combo</span>
                            </Link>

                            {/* 3. Combo Product List */}
                            <Link
                                to="/admin/combo-products"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/combo-products'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Combo List</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Banners Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => setBannersExpanded(!bannersExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isBannersActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Monitor size={20} strokeWidth={isBannersActive ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Banners</span>
                        {bannersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {bannersExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/banners"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/banners'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Homepage Banners</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Reviews Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => setReviewsExpanded(!reviewsExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/reviews')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <MessageSquare size={20} strokeWidth={location.pathname.startsWith('/admin/reviews') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Reviews</span>
                        {reviewsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {reviewsExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/reviews?tab=user"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/reviews' && new URLSearchParams(location.search).get('tab') !== 'admin'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">User Reviews</span>
                            </Link>
                            <Link
                                to="/admin/reviews?tab=admin"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${new URLSearchParams(location.search).get('tab') === 'admin'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <ShieldCheck size={16} />
                                <span className="font-semibold">Admin Reviews</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Items After Reviews (Orders to Referrals) */}
                {menuItems.slice(4).map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive(item.path)
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                        <span className="font-bold text-sm">{item.label}</span>
                    </Link>
                ))}
                {/* Footer Actions - Now part of scrollable nav as requested */}
                <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
                    <Link
                        to="/admin/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${location.pathname === '/admin/settings'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Settings size={20} strokeWidth={location.pathname === '/admin/settings' ? 2.5 : 2} />
                        <span className="font-bold text-sm">Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-left group"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                    <div className="h-8" /> {/* Extra bottom padding for comfortable scrolling */}
                </div>
            </nav>
        </div>
    );
};

export default AdminSidebar;
