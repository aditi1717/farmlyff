import React, { useState } from 'react';
import {
    Search, Plus, Edit2, Trash2, Users, CheckCircle2, XCircle,
    Copy, ExternalLink, Calendar, DollarSign, Percent, MoreHorizontal,
    Twitter, Instagram, Youtube, Filter, Eye, ArrowRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useReferrals, useCreateReferral, useUpdateReferral, useDeleteReferral, useAddPayout } from '../../../hooks/useReferrals';

const InfluencerReferralPage = () => {
    const { data: influencers = [], isLoading } = useReferrals();
    const createReferralMutation = useCreateReferral();
    const updateReferralMutation = useUpdateReferral();
    const deleteReferralMutation = useDeleteReferral();
    const addPayoutMutation = useAddPayout();

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Detail View State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailItem, setDetailItem] = useState(null);
    const [usageHistory, setUsageHistory] = useState([]);
    const [isAddingPayout, setIsAddingPayout] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        platform: 'Instagram',
        code: '',
        type: 'percentage',
        value: '',
        commissionRate: 5,
        validFrom: '',
        validTo: '',
        active: true
    });

    const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

    const filteredList = influencers.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm)
    );

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                ...item,
                validFrom: item.validFrom ? new Date(item.validFrom).toISOString().split('T')[0] : '',
                validTo: item.validTo ? new Date(item.validTo).toISOString().split('T')[0] : ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                platform: 'Instagram',
                code: '',
                type: 'percentage',
                value: '',
                commissionRate: 5,
                validFrom: new Date().toISOString().split('T')[0],
                validTo: '',
                active: true,
                totalPaid: 0
            });
        }
        setShowModal(true);
    };

    const openDetailModal = (item) => {
        setDetailItem(item);
        setIsAddingPayout(false);
        setPayoutAmount('');
        // Generate dummy history for visualization (keeping this as is for now)
        const history = Array.from({ length: Math.min(item.usageCount || 0, 8) }).map((_, i) => {
            const amount = Math.floor(Math.random() * 5000) + 500;
            return {
                id: i + 1,
                user: `User ${Math.floor(Math.random() * 10000)}`,
                date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
                orderId: `#ORD-${Math.floor(Math.random() * 90000) + 10000}`,
                amount: amount,
                commission: Math.floor(amount * (item.commissionRate / 100))
            };
        });
        setUsageHistory(history);
        setShowDetailModal(true);
    };

    const calculateEarnings = (item) => {
        return Math.floor((item.totalSales || 0) * (item.commissionRate / 100));
    };

    const handleAddPayout = () => {
        const amount = Number(payoutAmount);
        if (!amount || amount <= 0) return;

        addPayoutMutation.mutate({ id: detailItem._id || detailItem.id, amount }, {
            onSuccess: (updatedItem) => {
                 setDetailItem(prev => ({
                    ...prev,
                    totalPaid: (prev.totalPaid || 0) + amount
                }));
                setIsAddingPayout(false);
                setPayoutAmount('');
            }
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            value: Number(formData.value),
            commissionRate: Number(formData.commissionRate)
        };
        
        if (editingItem) {
            updateReferralMutation.mutate({ id: editingItem._id || editingItem.id, ...submissionData }, {
                onSuccess: () => {
                   setShowModal(false);
                   toast.success('Influencer updated successfully!');
                }
            });
        } else {
            createReferralMutation.mutate(submissionData, {
                onSuccess: () => {
                    setShowModal(false);
                     toast.success('Influencer added successfully!');
                }
            });
        }
    };

    const toggleStatus = (item) => {
        updateReferralMutation.mutate({ id: item._id || item.id, active: !item.active });
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this influencer code?')) {
            deleteReferralMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-8 font-['Inter']">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">Influencer & Referral Codes</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage partner campaigns and commissions</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#1a1a1a] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 group"
                >
                    <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                    Add New Influencer
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Influencers', value: influencers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Campaigns', value: influencers.filter(i => i.active).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Revenue Generated', value: `₹${(influencers.reduce((acc, curr) => acc + (curr.totalSales || 0), 0) / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100/50 shadow-sm flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-[#1a1a1a] mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolkit Bar */}
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search influencers or codes..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Influencer</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Referral Code</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Discount</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Performance</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Validity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredList.map((item) => (
                                <tr key={item._id || item.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs uppercase shadow-inner">
                                                {item.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1a1a1a] text-sm">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                        {item.platform === 'Instagram' && <Instagram size={10} />}
                                                        {item.platform === 'Youtube' && <Youtube size={10} />}
                                                        {item.platform === 'Twitter' && <Twitter size={10} />}
                                                        {item.platform}
                                                    </div>
                                                    <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                                        {item.commissionRate}% Comm.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 group/code cursor-pointer" onClick={() => navigator.clipboard.writeText(item.code)}>
                                            <span className="font-black text-[#1a1a1a] text-xs bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 uppercase tracking-wider group-hover/code:bg-[#1a1a1a] group-hover/code:text-white transition-colors">
                                                {item.code}
                                            </span>
                                            <Copy size={12} className="text-gray-300 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-xs font-bold text-gray-600">
                                            {item.type === 'percentage' ? `${item.value}% OFF` : `₹${item.value} OFF`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                                <Users size={12} /> {item.usageCount} Uses
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                                                <DollarSign size={12} /> ₹{item.totalSales.toLocaleString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <div className={`w-1.5 h-1.5 rounded-full ${new Date(item.validTo) < new Date() ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                                            {item.validTo ? new Date(item.validTo).toLocaleDateString() : 'Lifetime'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button
                                            onClick={() => toggleStatus(item)}
                                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${item.active
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                                }`}>
                                            {item.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openDetailModal(item)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => openModal(item)}
                                                className="p-2 text-gray-400 hover:text-[#1a1a1a] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id || item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredList.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-bold">No results found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">
                                    {editingItem ? 'Edit Influencer Code' : 'New Partner Code'}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Configuring referral discounts & commissions</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-red-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Influencer Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Rahul Fitness"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#1a1a1a]/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Platform</label>
                                    <select
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#1a1a1a]/5 transition-all cursor-pointer appearance-none"
                                    >
                                        <option value="Instagram">Instagram</option>
                                        <option value="Youtube">Youtube</option>
                                        <option value="Twitter">Twitter/X</option>
                                        <option value="Blog">Blog/Website</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Referral Code</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        placeholder="RAHULFIT20"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-wider outline-none focus:bg-white focus:ring-2 focus:ring-[#1a1a1a]/5 transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                        {formData.code.length}/20
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div className="p-6 bg-gray-50 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-100">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Type</label>
                                    <div className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-500">
                                        Percentage (%)
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Value</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="20"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest pl-1">Commission (%)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="10"
                                        value={formData.commissionRate}
                                        onChange={e => setFormData({ ...formData, commissionRate: e.target.value })}
                                        className="w-full bg-white border border-purple-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-purple-300 text-purple-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Valid From</label>
                                    <input
                                        type="date"
                                        value={formData.validFrom}
                                        onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#1a1a1a]/5 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Valid To (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.validTo}
                                        onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#1a1a1a]/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                                        className={`w-12 h-6 rounded-full transition-all relative ${formData.active ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                    <span className="text-xs font-bold text-gray-600">
                                        {formData.active ? 'Status: Active' : 'Status: Inactive'}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-[#1a1a1a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailModal && detailItem && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] w-full max-w-4xl p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight flex items-center gap-2">
                                    {detailItem.name} <span className="text-gray-300">/</span> {detailItem.code}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Detailed Performance Report</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-red-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Payout Status Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
                            <div className="bg-purple-50 p-6 rounded-[24px] border border-purple-100">
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Total Earnings ({detailItem.commissionRate}%)</p>
                                <p className="text-3xl font-black text-purple-600 mt-1">₹{calculateEarnings(detailItem).toLocaleString()}</p>
                                <p className="text-xs text-purple-500/60 font-bold mt-2">Based on ₹{detailItem.totalSales.toLocaleString()} sales</p>
                            </div>
                            <div className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Paid</p>
                                <p className="text-3xl font-black text-emerald-600 mt-1">₹{detailItem.totalPaid?.toLocaleString() || 0}</p>
                                {isAddingPayout ? (
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            autoFocus
                                            type="number"
                                            placeholder="Amount"
                                            value={payoutAmount}
                                            onChange={e => setPayoutAmount(e.target.value)}
                                            className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1 text-xs font-bold outline-none focus:border-emerald-400 text-emerald-800"
                                        />
                                        <button onClick={handleAddPayout} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700">✓</button>
                                        <button onClick={() => setIsAddingPayout(false)} className="bg-gray-200 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-300">✕</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingPayout(true)}
                                        className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg mt-2 uppercase tracking-wider hover:bg-emerald-200 transition-colors"
                                    >
                                        + Add Payout
                                    </button>
                                )}
                            </div>
                            <div className="bg-orange-50 p-6 rounded-[24px] border border-orange-100">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Pending Payout</p>
                                <p className="text-3xl font-black text-orange-600 mt-1">₹{(calculateEarnings(detailItem) - (detailItem.totalPaid || 0)).toLocaleString()}</p>
                                <p className="text-xs text-orange-500/60 font-bold mt-2">Due amount</p>
                            </div>
                        </div>

                        {/* Usage History Table */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} /> Usage History
                                </h3>
                                <div className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-lg">
                                    Last {usageHistory.length} Referrals
                                </div>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 sticky top-0 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Order</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Value</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {usageHistory.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-700 text-xs">{record.user}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{record.orderId}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium text-gray-500">{record.date}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-700 text-xs">₹{record.amount.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-purple-600 text-xs bg-purple-50 px-2 py-1 rounded">₹{record.commission.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfluencerReferralPage;
