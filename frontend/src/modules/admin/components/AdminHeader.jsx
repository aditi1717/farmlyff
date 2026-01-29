import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, Package, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopContext';
import { Link } from 'react-router-dom';

const AdminHeader = () => {
    const { user } = useAuth();
    const { orders, returns } = useShop();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Aggregate Notifications
    const allNotifications = [];

    // 1. Pending Orders
    Object.values(orders || {}).flat().forEach(order => {
        if (order && order.status === 'Processing') {
            allNotifications.push({
                type: 'order',
                id: order.id,
                title: 'New Order Received',
                message: `Order #${order.id} is waiting for processing.`,
                time: order.date,
                link: `/admin/orders/${order.id}`
            });
        }
    });

    // 2. Pending Returns
    Object.values(returns || {}).flat().forEach(ret => {
        if (ret && ret.status === 'Pending') {
            allNotifications.push({
                type: 'return',
                id: ret.id,
                title: 'New Return Request',
                message: `Return #${ret.id} needs approval.`,
                time: ret.requestDate,
                link: `/admin/returns`
            });
        }
    });

    // Sort by newest
    allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
    const unreadCount = allNotifications.length;

    return (
        <header className="h-20 bg-footerBg border-b border-white/5 flex items-center justify-end sticky top-0 z-40 text-left">


            {/* Right Actions with Dark Background */}
            <div className="h-full bg-white/5 px-8 flex items-center gap-6 border-l border-white/5" ref={dropdownRef}>
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2.5 bg-white/5 text-gray-400 rounded-xl hover:text-white border border-white/10 shadow-sm transition-all focus:ring-2 focus:ring-primary/10 ${showNotifications ? 'text-white bg-white/10' : ''}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-footerBg shadow-sm animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-[#1e293b] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {allNotifications.length > 0 ? (
                                    allNotifications.map((notif, idx) => (
                                        <Link 
                                            key={idx} 
                                            to={notif.link} 
                                            className="block p-4 border-b border-white/5 hover:bg-white/5 transition-colors group"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'order' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    {notif.type === 'order' ? <Package size={18} /> : <RotateCcw size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{notif.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-500 mt-2">{new Date(notif.time).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                )}
                            </div>
                            
                            {allNotifications.length > 0 && (
                                <div className="p-3 border-t border-white/10 bg-white/5 text-center">
                                    <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:text-primaryHover" onClick={() => setShowNotifications(false)}>View All Activity</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-white/10 mx-1" />

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right">
                        <p className="text-sm font-black text-white leading-none">{user?.name || 'Admin User'}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">Staff Account</p>
                    </div>
                    <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
