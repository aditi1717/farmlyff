import React, { useMemo } from 'react';
import {
    Users,
    ShoppingBag,
    Clock,
    Banknote,
    Box,
    FileWarning,
    History,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import { useAllOrders, useAllReturns } from '../../../hooks/useOrders';
import { useProducts } from '../../../hooks/useProducts';

const DashboardPage = () => {
    const { data: orders = [] } = useAllOrders();
    const { data: returns = [] } = useAllReturns();
    const { data: products = [] } = useProducts();

    // Calculate Stats
    const stats = useMemo(() => {
        const storedUsers = JSON.parse(localStorage.getItem('farmlyf_users')) || [];

        // Data is already flat from API
        const allOrders = orders;
        const allReturns = returns;

        const totalRevenue = allOrders.reduce((acc, order) => acc + (order.amount || 0), 0);
        const activeOrders = allOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
        const outOfStock = products.filter(p => p.variants && p.variants.every(v => v.stock === 0)).length;
        const pendingReturns = allReturns.filter(r => r.status === 'Pending').length;

        return [
            { label: 'Total Users', value: storedUsers.length, icon: Users, color: 'text-footerBg', bg: '', trend: '+12%' },
            { label: 'Total Orders', value: allOrders.length, icon: ShoppingBag, color: 'text-footerBg', bg: '', trend: '+18%' },
            { label: 'Active Orders', value: activeOrders, icon: Clock, color: 'text-footerBg', bg: '', trend: 'Live' },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-footerBg', bg: '', trend: '+24%' },
            { label: 'Total Products', value: products.length, icon: Box, color: 'text-footerBg', bg: '', trend: 'Stable' },
            { label: 'Out of Stock', value: outOfStock, icon: FileWarning, color: 'text-footerBg', bg: '', trend: 'Critical' },
            { label: 'Pending Returns', value: pendingReturns, icon: History, color: 'text-footerBg', bg: '', trend: 'Action Needed' },
        ];
    }, [orders, products, returns]);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Analytics Dashboard</h1>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Real-time performance overview of FarmLyf</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-gray-200 transition-all group relative text-left">
                        <div className="flex items-center justify-between mb-6">
                            <stat.icon size={22} className={stat.color} strokeWidth={2.5} />
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'
                                } uppercase tracking-tight`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-footerBg mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Widgets Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Recent Orders Widget */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-black text-footerBg uppercase tracking-tight">Recent Fulfillment Queue</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Last 5 customer orders requiring attention</p>
                        </div>
                        <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline">View All Orders</button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-footerBg text-xs">#{order.id.slice(-8)}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">{(new Date(order.date)).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-8 py-4">
                                            <p className="font-bold text-footerBg text-xs">{order.userName || order.shippingAddress?.fullName || 'Guest User'}</p>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <p className="font-black text-footerBg text-xs">₹{order.amount}</p>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alerts Widget */}
                <div className="lg:col-span-4 bg-footerBg p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-footerBg/20 text-white flex flex-col relative overflow-hidden text-left">
                    <div className="flex items-center gap-3 mb-8">
                        <AlertTriangle size={20} className="text-red-400" strokeWidth={2.5} />
                        <h4 className="text-lg font-black uppercase tracking-tight">Stock Alerts</h4>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {products.filter(p => !p.variants || p.variants.some(v => (v.stock || 0) < 15)).slice(0, 4).map((item, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] font-black text-white uppercase tracking-tight line-clamp-1 w-2/3">{item.name}</p>
                                    <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter shrink-0">Low</span>
                                </div>
                                {item.variants ? item.variants.filter(v => (v.stock || 0) < 15).map((v, vIdx) => (
                                    <div key={vIdx} className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                                        <span>Size: {v.weight}</span>
                                        <span className="text-white bg-red-500/20 px-1.5 py-0.5 rounded">{(v.stock || 0)} left</span>
                                    </div>
                                )) : (
                                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                                        <span>Default</span>
                                        <span className="text-white bg-red-500/20 px-1.5 py-0.5 rounded">Low</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
