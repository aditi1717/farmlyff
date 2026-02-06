import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Package,
    Heart,
    ShieldOff,
    ShieldCheck,
    ChevronRight,
    IndianRupee,
    User as UserIcon,
    ShoppingBag,
    Wallet,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showAllOrders, setShowAllOrders] = useState(false);

    // Premium Dummy Data
    const DUMMY_USERS = [
        {
            id: 'u1',
            name: 'Kabir Singh',
            email: 'kabir.s@example.com',
            phone: '+91 98765 43210',
            isBlocked: false,
            totalOrders: 12,
            totalSpend: 45200,
            since: 'January 2024',
            addresses: [
                { type: 'Home', fullName: 'Kabir Singh', address: 'Apartment 402, Sky High Towers, Worli Sea Face', city: 'Mumbai', state: 'Maharashtra', pincode: '400018', isDefault: true },
                { type: 'Office', fullName: 'Kabir Singh', address: 'Tech Park South, Level 15, BKC', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', isDefault: false }
            ]
        },
        { id: 'u2', name: 'Ananya Sharma', email: 'ananya.sh@gmail.com', phone: '+91 91234 56789', isBlocked: false, totalOrders: 5, totalSpend: 15600, since: 'March 2024', addresses: [] },
        { id: 'u3', name: 'Rahul Malhotra', email: 'rahul.m@outlook.com', phone: '+91 88888 77777', isBlocked: true, totalOrders: 0, totalSpend: 0, since: 'May 2024', addresses: [] },
        { id: 'u4', name: 'Priya Verma', email: 'p.verma@example.com', phone: '+91 77776 55555', isBlocked: false, totalOrders: 28, totalSpend: 125400, since: 'December 2023', addresses: [] },
        { id: 'u5', name: 'Ishaan Gupta', email: 'ishaan.g@gmail.com', phone: '+91 99900 11122', isBlocked: false, totalOrders: 8, totalSpend: 24300, since: 'June 2024', addresses: [] },
        { id: 'u6', name: 'Meera Rajput', email: 'meera.r@tata.com', phone: '+91 95555 44433', isBlocked: false, totalOrders: 15, totalSpend: 56900, since: 'February 2024', addresses: [] },
        { id: 'u7', name: 'Aditya Das', email: 'aditya.d@yahoo.com', phone: '+91 82222 33311', isBlocked: false, totalOrders: 3, totalSpend: 8900, since: 'July 2024', addresses: [] },
        { id: 'u8', name: 'Sanya Mirza', email: 'sanya.m@company.in', phone: '+91 70000 12345', isBlocked: true, totalOrders: 1, totalSpend: 2100, since: 'August 2024', addresses: [] },
        { id: 'u9', name: 'Vikram Seth', email: 'v.seth@reliance.com', phone: '+91 91111 22233', isBlocked: false, totalOrders: 10, totalSpend: 31200, since: 'April 2024', addresses: [] },
        { id: 'u10', name: 'Zoya Khan', email: 'zoya.k@gmail.com', phone: '+91 90000 00001', isBlocked: false, totalOrders: 6, totalSpend: 18400, since: 'September 2024', addresses: [] }
    ];

    const user = DUMMY_USERS.find(u => u.id === id) || DUMMY_USERS[0];

    // Simple Order History for u1
    const allDummyOrders = [
        { id: 'ORD-8821', date: '24 Oct 2024', amount: 12400, status: 'Delivered', method: 'Prepaid' },
        { id: 'ORD-8755', date: '12 Oct 2024', amount: 3500, status: 'Delivered', method: 'COD' },
        { id: 'ORD-8610', date: '05 Sep 2024', amount: 8200, status: 'Cancelled', method: 'Prepaid' },
        { id: 'ORD-8502', date: '15 Aug 2024', amount: 15600, status: 'Delivered', method: 'Prepaid' },
        { id: 'ORD-8411', date: '10 Aug 2024', amount: 2100, status: 'Delivered', method: 'COD' },
        { id: 'ORD-8390', date: '01 Jul 2024', amount: 5400, status: 'Delivered', method: 'Prepaid' },
    ];

    const orderHistory = user?.id === 'u1' ? allDummyOrders : [];
    const displayedOrders = showAllOrders ? orderHistory : orderHistory.slice(0, 4);

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-white">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <UserIcon size={40} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-footerBg mb-2 uppercase tracking-tighter">User Not Found</h2>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 px-6 py-3 bg-footerBg text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest"
                >
                    <ArrowLeft size={18} /> Back to Users
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-['Inter'] text-footerBg animate-in fade-in duration-500">
            {/* Simple Top Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 text-gray-500 hover:text-footerBg font-black text-[10px] uppercase tracking-[0.2em] transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to CRM
                </button>
                <div className="flex items-center gap-3">
                    <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${user.isBlocked
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-red-50 text-red-500 border-red-100'
                        }`}>
                        {user.isBlocked ? 'Unlock User' : 'Restrict Account'}
                    </button>
                </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 text-footerBg rounded-2xl flex items-center justify-center font-black text-2xl border border-gray-100">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-footerBg tracking-tight">{user.name}</h1>
                            <span className={`w-fit mx-auto md:mx-0 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${user.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-[#2c5336]'
                                }`}>
                                {user.isBlocked ? 'Restricted' : 'Verified Resident'}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-1">
                            <div className="flex items-center gap-1.5 text-footerBg text-xs font-bold">
                                <Mail size={14} className="text-gray-400" />
                                <span className="underline decoration-gray-100 underline-offset-4">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-footerBg text-xs font-bold">
                                <Phone size={14} className="text-gray-400" />
                                {user.phone}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-[8px] font-black uppercase tracking-widest">
                                <Calendar size={12} />
                                Member since {user.since}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Addresses */}
                <div className="space-y-6">
                    {/* Compact Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 bg-gray-50 text-footerBg rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                                <ShoppingBag size={20} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                            <p className="text-2xl font-black text-footerBg tabular-nums">{user.totalOrders}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="w-10 h-10 bg-gray-50 text-footerBg rounded-xl flex items-center justify-center mb-4 border border-gray-100">
                                <Wallet size={20} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spend</p>
                            <p className="text-2xl font-black text-footerBg tabular-nums">₹{user.totalSpend.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Address Book */}
                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                        <h3 className="font-black text-footerBg text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                            <MapPin size={16} className="text-gray-400" />
                            Registered Addresses
                        </h3>
                        <div className="space-y-3">
                            {user.addresses.length > 0 ? (
                                user.addresses.map((addr, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-colors hover:bg-white hover:border-gray-200 group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-footerBg text-white px-2 py-0.5 rounded-lg">
                                                {addr.type}
                                            </span>
                                            {addr.isDefault && <span className="text-[8px] font-black text-emerald-600 uppercase flex items-center gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div> Primary</span>}
                                        </div>
                                        <p className="text-xs font-black text-footerBg mb-1">{addr.fullName}</p>
                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tighter">
                                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-gray-300 text-[10px] font-black uppercase tracking-widest border border-dashed border-gray-100 rounded-2xl">No data found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Order History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-fit">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                            <h3 className="font-black text-footerBg text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Package size={16} className="text-gray-400" />
                                Order History
                            </h3>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{orderHistory.length} Total Logs</span>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {displayedOrders.length > 0 ? (
                                displayedOrders.map((order) => (
                                    <div key={order.id} className="p-4 md:p-5 hover:bg-gray-50 transition-all flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-footerBg group-hover:border-footerBg transition-all">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-footerBg uppercase tracking-tighter">{order.id}</p>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{order.date} • {order.method}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-footerBg mb-1 tabular-nums">₹{order.amount.toLocaleString()}</p>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-footerBg group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                        <ShoppingBag size={24} className="text-gray-200" />
                                    </div>
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Profile has no order history</p>
                                </div>
                            )}
                        </div>

                        {orderHistory.length > 4 && (
                            <button
                                onClick={() => setShowAllOrders(!showAllOrders)}
                                className="w-full py-4 bg-gray-50/30 border-t border-gray-50 text-[10px] font-black text-gray-400 hover:text-footerBg hover:bg-gray-50 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                            >
                                {showAllOrders ? (
                                    <>Show Less <ChevronUp size={14} /></>
                                ) : (
                                    <>View All {orderHistory.length} Orders <ChevronDown size={14} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
