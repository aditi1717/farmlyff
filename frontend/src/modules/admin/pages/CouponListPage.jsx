import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Ticket,
    Calendar,
    Users,
    Activity,
    Clock,
    Percent
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

const CouponListPage = () => {
    const navigate = useNavigate();
    const { coupons, deleteCoupon, fetchCoupons } = useShop();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredCoupons = useMemo(() => {
        return coupons
            .filter(c =>
                c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => b.createdAt?.localeCompare(a.createdAt) || 0);
    }, [coupons, searchTerm]);

    const paginatedCoupons = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCoupons.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCoupons, currentPage]);

    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            const result = await deleteCoupon(id);
            if (result.success) {
                // Toast or notification?
            } else {
                toast.error('Failed to delete coupon');
            }
        }
    };

    const getCouponStatus = (coupon) => {
        const now = new Date();
        if (!coupon.active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-400 border-gray-200' };
        if (new Date(coupon.validUntil) < now) return { label: 'Expired', color: 'bg-red-50 text-red-600 border-red-100' };
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { label: 'Limit Reached', color: 'bg-amber-50 text-amber-600 border-amber-100' };
        return { label: 'Active', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    };

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Marketing & Coupons</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Create and manage high-conversion discount codes</p>
                </div>
                <button
                    onClick={() => navigate('/admin/coupons/add')}
                    className="bg-footerBg text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-footerBg/20"
                >
                    <Plus size={18} strokeWidth={3} /> Create Coupon
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Coupons', value: coupons.length, icon: Ticket },
                    { label: 'Active Now', value: coupons.filter(c => c.active && new Date(c.validUntil) > new Date()).length, icon: Activity },
                    { label: 'Total Redemptions', value: coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0), icon: Users },
                    {
                        label: 'Upcoming Expiry', value: coupons.filter(c => {
                            const daysLeft = (new Date(c.validUntil) - new Date()) / (1000 * 60 * 60 * 24);
                            return daysLeft > 0 && daysLeft < 7;
                        }).length, icon: Clock
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left">
                        <div className={`bg-gray-50 text-footerBg w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border border-gray-100`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none text-left">{stat.label}</p>
                        <p className="text-xl font-black text-footerBg mt-1 text-left">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by coupon code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Coupon Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Discount Value</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Redemptions</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Validity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 text-sm">
                                        No coupons found
                                    </td>
                                </tr>
                            ) : (
                                paginatedCoupons.map((coupon) => {
                                    const status = getCouponStatus(coupon);
                                    return (
                                        <tr key={coupon.id || coupon._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center font-black text-xs border border-primary/10">
                                                        <Ticket size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-footerBg text-sm tracking-widest">{coupon.code}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-1 max-w-[200px] line-clamp-1">{coupon.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg shrink-0">
                                                        <Percent size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-footerBg">{coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`} OFF</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Min Order: ₹{coupon.minOrderValue}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-full max-w-[100px] space-y-1.5">
                                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                                        <span className="text-footerBg">{coupon.usageCount} Used</span>
                                                        <span className="text-gray-400">{coupon.usageLimit || '∞'} Max</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${Math.min((coupon.usageCount / (coupon.usageLimit || 1)) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-footerBg uppercase">Ends {new Date(coupon.validUntil).toLocaleDateString()}</p>
                                                        {coupon.createdAt && (
                                                            <p className="text-[9px] text-gray-400 font-medium">Created {new Date(coupon.createdAt).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/coupons/edit/${coupon.id || coupon._id}`)}
                                                        className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                                        title="Edit Coupon"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id || coupon._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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
                    totalItems={filteredCoupons.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default CouponListPage;
