import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    Eye,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpDown,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../components/Pagination';

const OrderListPage = () => {
    const navigate = useNavigate();
    // Fetch Orders - Force Refresh 2024
    console.log('OrderListPage rendering');
    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Orders are already a flat list from API
    const allOrders = useMemo(() => {
        return [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [orders]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const matchesSearch =
                order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userName?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [allOrders, searchTerm, statusFilter]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const stats = [
        { label: 'Total Orders', value: allOrders.length, icon: Package },
        { label: 'Pending', value: allOrders.filter(o => o.status === 'Processing').length, icon: Clock },
        { label: 'Completed', value: allOrders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2 }
    ];

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Order Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Monitor and fulfill customer dryfruit orders</p>
                </div>
                <button className="bg-footerBg text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-footerBg/20">
                    <Download size={18} /> Export Reports
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gray-50 text-footerBg rounded-2xl flex items-center justify-center border border-gray-100`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-footerBg">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 text-left">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'
                                    }`}
                            >
                                {s === 'Processing' ? 'Pending' : s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Detail</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <div>
                                            <p className="font-bold text-footerBg text-sm">#{order.id?.slice(-10)}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1">{(new Date(order.date)).toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-50 text-footerBg border border-gray-100 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                                                {order.userName?.charAt(0) || 'C'}
                                            </div>
                                            <span className="text-sm font-bold text-footerBg">{order.userName || 'Customer'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-footerBg">₹{order.amount?.toLocaleString()}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{order.items?.length || 0} Items</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                        No orders found matching requirements
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredOrders.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default OrderListPage;
