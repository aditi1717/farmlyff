import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    MessageSquare,
    IndianRupee,
    Truck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ReturnRequestsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Fetch Returns
    const { data: returnsData = [] } = useQuery({
        queryKey: ['returns'],
        queryFn: async () => {
             const res = await fetch('http://localhost:5000/api/returns');
             if (!res.ok) throw new Error('Failed to fetch returns');
             return res.json();
        }
    });

    // Fetch Products (to lookup names)
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
             const res = await fetch('http://localhost:5000/api/products');
             return res.json();
        }
    });

    // Update Status Mutation
    const updateReturnStatus = useMutation({
        mutationFn: async ({ id, status }) => {
             const res = await fetch(`http://localhost:5000/api/returns/${id}`, {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ status })
             });
             if (!res.ok) throw new Error('Failed to update return status');
             return res.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries(['returns']);
             toast.success('Return status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Flatten all returns if they come as struct, or use directly if array
    // Assuming API returns array of returns
    const allReturns = useMemo(() => {
        if (Array.isArray(returnsData)) {
            return returnsData.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        }
        return [];
    }, [returnsData]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredReturns = useMemo(() => {
        return allReturns.filter(ret => {
            const matchesSearch =
                ret.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ret.userName?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || ret.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [allReturns, searchTerm, statusFilter]);

    const paginatedReturns = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredReturns.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReturns, currentPage]);

    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed':
            case 'Refunded': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Approved': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const handleAction = (retId, action) => {
        updateReturnStatus.mutate({ id: retId, status: action });
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">RMA Desk</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage Returns, Replacements and Refunds</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span className="text-[10px] font-bold text-footerBg uppercase tracking-widest">{allReturns.filter(r => r.status === 'Pending').length} Pending Requests</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Requests', value: allReturns.length, icon: RefreshCw },
                    { label: 'Pending Review', value: allReturns.filter(r => r.status === 'Pending').length, icon: Clock },
                    { label: 'Refunds Issued', value: allReturns.filter(r => r.status === 'Refunded').length, icon: IndianRupee },
                    { label: 'Replacement Shipped', value: allReturns.filter(r => r.type === 'replacement' && r.status === 'Approved').length, icon: Truck },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className={`bg-gray-50 text-footerBg w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border border-gray-100`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                        <p className="text-xl font-black text-footerBg mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 text-left">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or User..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto max-w-full">
                    {['All', 'Pending', 'Approved', 'Refunded', 'Rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Return Requests Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Request Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reason</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedReturns.map((ret) => {
                                const prod = products.find(p => p.id === ret.packId || p._id === ret.packId);
                                return (
                                    <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="space-y-1">
                                                <p className="font-bold text-footerBg text-sm uppercase tracking-tighter">#{ret.orderId?.slice(-8)}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Req Date: {(new Date(ret.requestDate)).toLocaleDateString()}</p>
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ret.type === 'refund' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {ret.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center font-bold text-xs">
                                                    {ret.userName?.charAt(0)}
                                                </div>
                                                <p className="text-sm font-bold text-footerBg">{ret.userName}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 p-1 shrink-0">
                                                    <img src={prod?.image} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="max-w-[150px]">
                                                    <p className="text-xs font-bold text-footerBg truncate">{prod?.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">Variant: {ret.variant?.weight}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1 text-left">
                                                <p className="text-xs font-bold text-gray-600 leading-tight">"{ret.reason}"</p>
                                                {ret.subReason && <p className="text-[10px] text-gray-400">Sub: {ret.subReason}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(ret.status)}`}>
                                                {ret.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {ret.status === 'Pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(ret.id, 'Approved')}
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-100 transition-all"
                                                            title="Approve Request"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(ret.id, 'Rejected')}
                                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                                            title="Reject Request"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button className="p-2 text-gray-400 hover:text-primary transition-all">
                                                        <Eye size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredReturns.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                        No return requests found
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
                    totalItems={filteredReturns.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default ReturnRequestsPage;
