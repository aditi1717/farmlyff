import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    IndianRupee, Users, Plus, X, ArrowLeft, Calendar,
    TrendingUp, Award, Download, Filter, Search, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useReferrals, useAddPayout } from '../../../hooks/useReferrals';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

// Move fallback data outside to prevent reference changes on every render
const DUMMY_INFLUENCERS = [
    { _id: '1', name: 'Rahul Sharma', platform: 'Instagram', code: 'RAHULFIT20', type: 'percentage', value: 20, commissionRate: 10, usageCount: 145, totalSales: 285000, totalPaid: 15000, active: true },
    { _id: '2', name: 'Priya Verma', platform: 'Youtube', code: 'PRIYAFRY15', type: 'percentage', value: 15, commissionRate: 8, usageCount: 89, totalSales: 154000, totalPaid: 5000, active: true },
    { _id: '3', name: 'Vikram Singh', platform: 'Instagram', code: 'VIKDRY10', type: 'percentage', value: 10, commissionRate: 5, usageCount: 34, totalSales: 42000, totalPaid: 0, active: false },
];

const InfluencerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: referrals = [], isLoading } = useReferrals();
    const addPayoutMutation = useAddPayout();

    const [isAddingPayout, setIsAddingPayout] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [usageHistory, setUsageHistory] = useState([]);

    const influencer = (referrals?.length > 0 ? referrals : DUMMY_INFLUENCERS).find(
        inf => (inf._id || inf.id) === id
    );

    useEffect(() => {
        if (influencer) {
            // Generate dummy history
            const history = Array.from({ length: 8 }).map((_, i) => {
                const amount = Math.floor(Math.random() * 5000) + 500;
                return {
                    id: i + 1,
                    user: `User ${Math.floor(Math.random() * 10000)}`,
                    date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    orderId: `#ORD-${Math.floor(Math.random() * 90000) + 10000}`,
                    amount: amount,
                    commission: Math.floor(amount * (influencer.commissionRate / 100))
                };
            });
            setUsageHistory(history);
        }
    }, [id, influencer?.usageCount]);

    if (isLoading) return <div className="p-10 text-center font-black animate-pulse uppercase tracking-widest text-gray-400">Loading Performance Data...</div>;
    if (!influencer) return <div className="p-10 text-center font-black uppercase tracking-widest text-gray-400">Influencer Not Found</div>;

    const calculateEarnings = (item) => {
        return Math.floor((item.totalSales || 0) * (item.commissionRate / 100));
    };

    const handleAddPayout = () => {
        const amount = Number(payoutAmount);
        if (!amount || amount <= 0) return;

        addPayoutMutation.mutate({ id: influencer._id || influencer.id, amount }, {
            onSuccess: () => {
                setIsAddingPayout(false);
                setPayoutAmount('');
                toast.success('Payout record updated!');
            }
        });
    };

    return (
        <div className="space-y-8 font-['Inter']">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/referrals')}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight flex items-center gap-3">
                            {influencer.name}
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400">{influencer.code}</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Partner Performance Analytics & History</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1a1a1a] hover:border-gray-300 transition-all flex items-center gap-2">
                        <Download size={14} strokeWidth={2.5} /> Export Report
                    </button>
                    <button
                        onClick={() => setIsAddingPayout(true)}
                        className="px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-black/10"
                    >
                        <Plus size={14} strokeWidth={2.5} /> Register Payout
                    </button>
                </div>
            </div>

            {/* Stats Cards - Unified with other pages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Total Earnings',
                        value: `₹${calculateEarnings(influencer).toLocaleString()}`,
                        icon: TrendingUp,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50',
                        sub: `Based on ₹${(influencer.totalSales || 0).toLocaleString()} sales`
                    },
                    {
                        label: 'Amount Paid',
                        value: `₹${(influencer.totalPaid || 0).toLocaleString()}`,
                        icon: IndianRupee,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        sub: `${((influencer.totalPaid || 0) / calculateEarnings(influencer) * 100 || 0).toFixed(0)}% of total cleared`
                    },
                    {
                        label: 'Pending Dues',
                        value: `₹${(calculateEarnings(influencer) - (influencer.totalPaid || 0)).toLocaleString()}`,
                        icon: Calendar,
                        color: 'text-orange-600',
                        bg: 'bg-orange-50',
                        sub: 'Awaiting next payout cycle'
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                        <div className="space-y-1 text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight">{stat.value}</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{stat.sub}</p>
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                            <stat.icon size={22} strokeWidth={2.5} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Payout Input Section (Only when adding) */}
            {isAddingPayout && (
                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <IndianRupee size={24} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Register New Payout</h3>
                            <p className="text-[9px] font-bold text-emerald-600/60 uppercase">Deduct from pending balance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input
                            autoFocus
                            type="number"
                            placeholder="Enter Amount"
                            value={payoutAmount}
                            onChange={e => setPayoutAmount(e.target.value)}
                            className="bg-white border border-emerald-200 rounded-xl px-5 py-3 text-sm font-black outline-none focus:border-emerald-400 text-[#1a1a1a] w-full md:w-64 shadow-sm"
                        />
                        <button
                            onClick={handleAddPayout}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setIsAddingPayout(false)}
                            className="p-3 bg-white border border-emerald-100 text-emerald-300 hover:text-red-400 rounded-xl transition-all"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

            {/* Table Area - Unified using AdminTable */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                            <Activity size={16} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-[11px] font-black text-[#1a1a1a] uppercase tracking-[0.2em]">Usage History</h3>
                    </div>
                    <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                        Performance History
                    </div>
                </div>

                <div className="p-4">
                    <AdminTable>
                        <AdminTableHeader>
                            <AdminTableHead>Customer</AdminTableHead>
                            <AdminTableHead>Order ID</AdminTableHead>
                            <AdminTableHead>Date</AdminTableHead>
                            <AdminTableHead>Value</AdminTableHead>
                            <AdminTableHead className="text-right">Commission</AdminTableHead>
                        </AdminTableHeader>
                        <AdminTableBody>
                            {usageHistory.map((record) => (
                                <AdminTableRow key={record.id}>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                {record.user.charAt(0)}
                                            </div>
                                            <span className="font-black text-[#1a1a1a] text-xs uppercase tracking-tight">{record.user}</span>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="font-black text-[10px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-widest font-mono">
                                            {record.orderId}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{record.date}</span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-1.5 font-black text-[#1a1a1a] text-xs">
                                            <IndianRupee size={12} strokeWidth={3} className="text-gray-300" />
                                            {record.amount.toLocaleString()}
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell className="text-right">
                                        <div className="inline-flex items-center gap-1.5 font-black text-purple-600 text-[11px] bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 uppercase tracking-widest">
                                            <IndianRupee size={12} strokeWidth={3} />
                                            {record.commission.toLocaleString()}
                                        </div>
                                    </AdminTableCell>
                                </AdminTableRow>
                            ))}
                        </AdminTableBody>
                    </AdminTable>
                    {usageHistory.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No usage history recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfluencerDetailPage;
