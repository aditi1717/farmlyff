import React, { useState, useEffect } from 'react';
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
    ShieldCheck,
    ShoppingCart,
    Clock,
    FileText,
    MapPin,
    XCircle,
    CheckCircle,
    Truck,
    CheckCircle2,
    ArrowLeftRight,
    AlertTriangle,
    Upload,
    Activity,
    Star,
    Info,
    Layout,
    HelpCircle,
    User,
    Bell,
    Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import logo from '../../../assets/logo.png';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    // Fetch Order Stats
    const { data: orderStats = {} } = useQuery({
        queryKey: ['orderStats'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/orders/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },
        refetchInterval: 30000 // Refetch every 30 seconds
    });

    const [combosExpanded, setCombosExpanded] = useState(false);
    const [comboProductsExpanded, setComboProductsExpanded] = useState(false);
    const [productsExpanded, setProductsExpanded] = useState(false);
    const [bannersExpanded, setBannersExpanded] = useState(false);
    const [reviewsExpanded, setReviewsExpanded] = useState(false);
    const [ordersExpanded, setOrdersExpanded] = useState(true);
    const [inventoryExpanded, setInventoryExpanded] = useState(false);
    const [pagesExpanded, setPagesExpanded] = useState(false);
    const [settingsExpanded, setSettingsExpanded] = useState(false);
    const [notificationsExpanded, setNotificationsExpanded] = useState(false);
    const [blogsExpanded, setBlogsExpanded] = useState(false);

    // Auto-expand sections based on active route
    useEffect(() => {
        if (location.pathname.startsWith('/admin/orders')) setOrdersExpanded(true);
        if (location.pathname.startsWith('/admin/products')) setProductsExpanded(true);
        if (location.pathname.startsWith('/admin/combo')) setCombosExpanded(true);
        if (location.pathname.startsWith('/admin/inventory')) setInventoryExpanded(true);
        if (location.pathname.startsWith('/admin/banners') || location.pathname.startsWith('/admin/sections') || location.pathname.startsWith('/admin/manage')) setBannersExpanded(true);
        if (location.pathname.startsWith('/admin/pages')) setPagesExpanded(true);
        if (location.pathname.startsWith('/admin/blogs')) setBlogsExpanded(true);
    }, [location.pathname]);

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
        // Orders moved to manual handling
        { icon: RefreshCcw, label: 'Returns', path: '/admin/returns' },
        { icon: ArrowLeftRight, label: 'Replacements', path: '/admin/replacements' },
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

                {/* Homepage Sections - NEW */}
                <div className="mt-1">
                    <button
                        onClick={() => setBannersExpanded(!bannersExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isBannersActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Monitor size={20} strokeWidth={isBannersActive ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Homepage Sections</span>
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
                                <span className="font-semibold">Banners</span>
                            </Link>
                            <Link
                                to="/admin/manage-header"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/manage-header'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Layout size={16} />
                                <span className="font-semibold">Top Bar & Marquee</span>
                            </Link>
                            <Link
                                to="/admin/manage-header-categories"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/manage-header-categories'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Layers size={16} />
                                <span className="font-semibold">Header Categories</span>
                            </Link>
                            <Link
                                to="/admin/sections/top-selling"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/sections/top-selling'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Activity size={16} />
                                <span className="font-semibold">Top Selling Products</span>
                            </Link>
                            <Link
                                to="/admin/sections/why-choose-us"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/sections/why-choose-us'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Star size={16} />
                                <span className="font-semibold">Why Choose Us</span>
                            </Link>

                            <Link
                                to="/admin/sections/health-benefits"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/sections/health-benefits'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Activity size={16} />
                                <span className="font-semibold">Health Benefits</span>
                            </Link>
                            <Link
                                to="/admin/manage-faq"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/manage-faq'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <HelpCircle size={16} />
                                <span className="font-semibold">FAQ</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Website Pages - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => setPagesExpanded(!pagesExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/pages')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <FileText size={20} strokeWidth={location.pathname.startsWith('/admin/pages') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Website Pages</span>
                        {pagesExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {pagesExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-4 py-2">
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2 pl-2 tracking-wider">Pages</h4>
                                <div className="space-y-1">
                                    {[
                                        { name: 'About Us', id: 'about-us', icon: Info },
                                        { name: 'Contact Us', id: 'contact-us', icon: Info },
                                        { name: 'How to Order', id: 'how-to-order', icon: Info },
                                        { name: 'Size Guide', id: 'size-guide', icon: Info },
                                        { name: 'Payment Methods', id: 'payment-methods', icon: Info },
                                        { name: 'Privacy Policy', id: 'privacy-policy', icon: ShieldCheck },
                                        { name: 'Terms & Conditions', id: 'terms-conditions', icon: ShieldCheck },
                                        { name: 'Return Policy', id: 'refund-policy', icon: ShieldCheck },
                                        { name: 'Shipping Policy', id: 'shipping-policy', icon: ShieldCheck },
                                        { name: 'Cookie Policy', id: 'cookie-policy', icon: ShieldCheck },
                                        { name: 'Cancellation Policy', id: 'cancellation-policy', icon: ShieldCheck },
                                        { name: 'Disclaimer', id: 'disclaimer', icon: ShieldCheck }
                                    ].map(page => (
                                        <Link
                                            key={page.id}
                                            to={`/admin/pages/${page.id}`}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${location.pathname === `/admin/pages/${page.id}`
                                                ? 'bg-primary/20 text-white'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <page.icon size={14} />
                                            <span className="font-medium text-xs">{page.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Blogs Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => setBlogsExpanded(!blogsExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/blogs')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <FileText size={20} strokeWidth={location.pathname.startsWith('/admin/blogs') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Blogs</span>
                        {blogsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {blogsExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/blogs"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/blogs'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <List size={16} />
                                <span className="font-semibold">Blog List</span>
                            </Link>
                            <Link
                                to="/admin/blogs/add"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/blogs/add'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Add Blog</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer Management */}
                <Link
                    to="/admin/manage-footer"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-1 ${location.pathname === '/admin/manage-footer'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Layout size={20} strokeWidth={location.pathname === '/admin/manage-footer' ? 2.5 : 2} />
                    <span className="font-bold text-sm">Footer</span>
                </Link>

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

                {/* ORDER SECTION */}
                <div className="mt-6 mb-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 px-2 tracking-widest">Order Section</p>
                    <button
                        onClick={() => setOrdersExpanded(!ordersExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/orders')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <ShoppingCart size={20} strokeWidth={location.pathname.startsWith('/admin/orders') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Order List</span>
                        {ordersExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {ordersExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            {[
                                { label: 'All Order', count: orderStats.All || 0, color: 'bg-pink-500', icon: ShoppingCart, path: '/admin/orders?status=All' },
                                { label: 'Pending Order', count: orderStats.Processing || 0, color: 'bg-orange-500', icon: Clock, path: '/admin/orders?status=Processing' },
                                { label: 'Received Order', count: orderStats.Received || 0, color: 'bg-blue-500', icon: CheckCircle, path: '/admin/orders?status=Received' },
                                { label: 'Processed Order', count: orderStats.Processed || 0, color: 'bg-teal-500', icon: FileText, path: '/admin/orders?status=Processed' },
                                { label: 'Shipped Order', count: orderStats.Shipped || 0, color: 'bg-gray-500', icon: Truck, path: '/admin/orders?status=Shipped' },
                                { label: 'Out For Delivery', count: orderStats.OutForDelivery || 0, color: 'bg-white text-footerBg', icon: MapPin, path: '/admin/orders?status=OutForDelivery' },
                                { label: 'Delivered Order', count: orderStats.Delivered || 0, color: 'bg-orange-600', icon: CheckCircle2, path: '/admin/orders?status=Delivered' },
                                { label: 'Cancelled Order', count: orderStats.Cancelled || 0, color: 'bg-red-500', icon: XCircle, path: '/admin/orders?status=Cancelled' },
                            ].map((item, idx) => (
                                <Link
                                    key={idx}
                                    to={item.path}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm group ${location.search.includes(item.path.split('?')[1]) || (item.label === 'All Order' && location.pathname === '/admin/orders' && !location.search)
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} />
                                        <span className="font-semibold text-xs">{item.label}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.color} ${item.color.includes('text-') ? '' : 'text-white'}`}>
                                        {item.count}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                </div>

                {/* Items After Reviews (Returns and Replacements) */}
                {
                    menuItems.slice(4, 6).map((item) => (
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
                    ))
                }

                {/* Inventory Management Section - Expandable */}
                <div className="mt-1">
                    <button
                        onClick={() => setInventoryExpanded(!inventoryExpanded)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/inventory')
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Package size={20} strokeWidth={location.pathname.startsWith('/admin/inventory') ? 2.5 : 2} />
                        <span className="font-bold text-sm flex-1 text-left">Inventory Management</span>
                        {inventoryExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {inventoryExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link
                                to="/admin/inventory/adjust"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/adjust'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Plus size={16} />
                                <span className="font-semibold">Stock Adjustments</span>
                            </Link>
                            <Link
                                to="/admin/inventory/history"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/history'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Clock size={16} />
                                <span className="font-semibold">Stock History</span>
                            </Link>
                            <Link
                                to="/admin/inventory/alerts"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/alerts'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <AlertTriangle size={16} />
                                <span className="font-semibold">Low Stock Alerts</span>
                            </Link>

                            <Link
                                to="/admin/inventory/reports"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/inventory/reports'
                                    ? 'bg-primary/20 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <FileText size={16} />
                                <span className="font-semibold">Reports & Export</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Remaining Menu Items (Coupons, Referrals) */}
                {
                    menuItems.slice(6).map((item) => (
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
                    ))
                }
                {/* Footer Actions - Now part of scrollable nav as requested */}
                <div className="pt-6 mt-6 border-t border-white/5 space-y-1">
                    {/* Push Notifications Section - Expandable */}
                    <div className="mt-1">
                        <button
                            onClick={() => setNotificationsExpanded(!notificationsExpanded)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/notifications')
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Bell size={20} strokeWidth={location.pathname.startsWith('/admin/notifications') ? 2.5 : 2} />
                            <span className="font-bold text-sm flex-1 text-left">Push Notifications</span>
                            {notificationsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {notificationsExpanded && (
                            <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                                <Link
                                    to="/admin/notifications?tab=list"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/notifications' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'list')
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <List size={16} />
                                    <span className="font-semibold">Notification List</span>
                                </Link>
                                <Link
                                    to="/admin/notifications?tab=add"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/notifications' && new URLSearchParams(location.search).get('tab') === 'add'
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Plus size={16} />
                                    <span className="font-semibold">Add Notification</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Settings Section - Expandable */}
                    <div className="mt-1">
                        <button
                            onClick={() => setSettingsExpanded(!settingsExpanded)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin/settings')
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Settings size={20} strokeWidth={location.pathname.startsWith('/admin/settings') ? 2.5 : 2} />
                            <span className="font-bold text-sm flex-1 text-left">Settings</span>
                            {settingsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {settingsExpanded && (
                            <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                                <Link
                                    to="/admin/settings?tab=profile"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/settings' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'profile')
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <User size={16} />
                                    <span className="font-semibold">My Profile</span>
                                </Link>
                                <Link
                                    to="/admin/settings?tab=general"
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === '/admin/settings' && new URLSearchParams(location.search).get('tab') === 'general'
                                        ? 'bg-primary/20 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Globe size={16} />
                                    <span className="font-semibold">Store General</span>
                                </Link>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-left group"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                    <div className="h-8" /> {/* Extra bottom padding for comfortable scrolling */}
                </div>
            </nav >
        </div >
    );
};

export default AdminSidebar;
