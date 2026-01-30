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
    MessageSquare
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

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Layers, label: 'Categories', path: '/admin/categories' },
        { icon: Layers, label: 'Sub-categories', path: '/admin/sub-categories' },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: Monitor, label: 'Banners', path: '/admin/banners' },
        { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
        { icon: RefreshCcw, label: 'Returns', path: '/admin/returns' },
        { icon: TicketPercent, label: 'Coupons', path: '/admin/coupons' },
        { icon: Video, label: 'Reels', path: '/admin/reels' },
        { icon: Share2, label: 'Referrals', path: '/admin/referrals' },
    ];

    const isActive = (path) => location.pathname.startsWith(path);
    const isCombosActive = location.pathname.startsWith('/admin/combo');

    return (
        <div className="w-64 h-screen bg-footerBg text-white flex flex-col fixed left-0 top-0 z-50">
            {/* Logo Section */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <img src={logo} alt="FarmLyf" className="h-8 w-auto object-contain" />
                <span className="font-brand font-bold text-xl tracking-tight">Admin</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Main Menu</p>

                {/* Items Before Combos (Dashboard to Products) */}
                {menuItems.slice(0, 5).map((item) => (
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

                {/* Combos Section w/ Double Nesting - Moved Here */}
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

                    {/* First Level Nested Menu */}
                    {combosExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            {/* Combo Categories */}
                            <Link
                                to="/admin/combo-categories"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/combo-categories'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Combo Categories</span>
                            </Link>

                            {/* Combo Products - Second Level Expandable */}
                            <div>
                                <button
                                    onClick={() => setComboProductsExpanded(!comboProductsExpanded)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname.startsWith('/admin/combo-products')
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Package size={16} />
                                    <span className="font-semibold flex-1 text-left">Combo Products</span>
                                    {comboProductsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {/* Second Level Nested Menu */}
                                {comboProductsExpanded && (
                                    <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                                        <Link
                                            to="/admin/combo-products"
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-xs ${location.pathname === '/admin/combo-products'
                                                ? 'bg-primary/10 text-white'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <List size={14} />
                                            <span className="font-semibold">Product List</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Items After Combos (Banners to Referrals) */}
                {menuItems.slice(5).map((item) => (
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
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 space-y-1">
                <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all">
                    <Settings size={20} />
                    <span className="font-bold text-sm">Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-left"
                >
                    <LogOut size={20} />
                    <span className="font-bold text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
