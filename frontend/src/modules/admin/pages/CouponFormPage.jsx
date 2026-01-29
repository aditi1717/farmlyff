import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Calendar,
    Settings,
    ShieldCheck,
    Info,
    CheckCircle2
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import toast from 'react-hot-toast';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CouponFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    // Fetch Products
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
             const res = await fetch('http://localhost:5000/api/products');
             return res.json();
        }
    });

    // Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
             const res = await fetch('http://localhost:5000/api/categories');
             return res.json();
        }
    });

    // Fetch SubCategories
    const { data: subCategories = [] } = useQuery({
        queryKey: ['subcategories'],
        queryFn: async () => {
             const res = await fetch('http://localhost:5000/api/subcategories');
             return res.json();
        }
    });

    // Fetch Single Coupon (if Edit)
    const { data: editingCoupon } = useQuery({
        queryKey: ['coupon', id],
        queryFn: async () => {
             if (!isEdit) return null;
             const res = await fetch(`http://localhost:5000/api/coupons/${id}`);
             if (!res.ok) throw new Error('Failed to fetch coupon');
             return res.json();
        },
        enabled: isEdit
    });

    // Add Mutation
    const addMutation = useMutation({
        mutationFn: async (payload) => {
             const res = await fetch('http://localhost:5000/api/coupons', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(payload)
             });
             if (!res.ok) {
                 const err = await res.json();
                 throw new Error(err.message || 'Failed');
             }
             return res.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries(['coupons']);
             toast.success('Coupon created!');
             navigate('/admin/coupons');
        },
        onError: (err) => toast.error(err.message)
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
             const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(payload)
             });
             if (!res.ok) {
                 const err = await res.json();
                 throw new Error(err.message || 'Failed');
             }
             return res.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries(['coupons']);
             toast.success('Coupon updated!');
             navigate('/admin/coupons');
        },
        onError: (err) => toast.error(err.message)
    });

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        type: 'flat',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: '',
        perUserLimit: 1,
        active: true,
        userEligibility: 'all',
        description: '',
        applicabilityType: 'all', // 'all', 'category', 'subcategory', 'product'
        targetItems: [] // Array of IDs or Names
    });

    useEffect(() => {
        if (isEdit && editingCoupon) {
            setFormData({
                ...editingCoupon,
                validFrom: editingCoupon.validFrom ? new Date(editingCoupon.validFrom).toISOString().split('T')[0] : '',
                validUntil: editingCoupon.validUntil ? new Date(editingCoupon.validUntil).toISOString().split('T')[0] : '',
                applicabilityType: editingCoupon.applicabilityType || 'all',
                targetItems: editingCoupon.targetItems || []
            });
        }
    }, [isEdit, editingCoupon]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleTargetItem = (itemValue) => {
        setFormData(prev => {
            const current = prev.targetItems || [];
            if (current.includes(itemValue)) {
                return { ...prev, targetItems: current.filter(i => i !== itemValue) };
            } else {
                return { ...prev, targetItems: [...current, itemValue] };
            }
        });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            value: Number(formData.value),
            minOrderValue: Number(formData.minOrderValue),
            maxDiscount: Number(formData.maxDiscount) || null,
            usageLimit: Number(formData.usageLimit) || 1000,
            perUserLimit: Number(formData.perUserLimit) || 1
        };

        if (isEdit) {
            updateMutation.mutate({ id, payload }, {
                onSettled: () => setLoading(false)
            });
        } else {
            addMutation.mutate(payload, {
                onSettled: () => setLoading(false)
            });
        }
    };

    return (
        <div className="space-y-10 pb-20 text-left">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/coupons')}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-footerBg hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">
                            {isEdit ? 'Configure Coupon' : 'New Promo Campaign'}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">
                            {isEdit ? `Modifying settings for ${formData.code}` : 'Design a new high-conversion discount code'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-footerBg text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-footerBg/20 disabled:opacity-70"
                >
                    <Save size={18} /> {loading ? 'Saving...' : (isEdit ? 'Update Coupon' : 'Deploy Coupon')}
                </button>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Core Logic */}
                <div className="lg:col-span-8 space-y-8">
                    {/* 1. Core Settings */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <Info size={18} className="text-gray-400" />
                            Core Settings
                        </h3>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Promotional Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g., WELCOME50"
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-black tracking-widest outline-none focus:bg-white focus:border-footerBg transition-all uppercase"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-footerBg font-black text-[10px] uppercase tracking-widest hover:underline"
                                        onClick={() => setFormData({ ...formData, code: `SALE${Math.floor(Math.random() * 900) + 100}` })}
                                    >
                                        Auto-Generate
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-footerBg transition-all cursor-pointer"
                                    >
                                        <option value="flat">Flat Amount (₹)</option>
                                        <option value="percent">Percentage (%)</option>
                                        <option value="free_shipping">Free Shipping</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Value</label>
                                    <input
                                        type="number"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleChange}
                                        disabled={formData.type === 'free_shipping'}
                                        placeholder={formData.type === 'percent' ? 'e.g., 20' : 'e.g., 500'}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Campaign Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Explain the offer to customers..."
                                    className="w-full bg-gray-50 border border-transparent rounded-3xl p-6 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* 2. Coupon Scope (Unified) */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={18} className="text-gray-400" />
                                Coupon Scope
                            </h3>
                            {formData.targetItems.length > 0 && (
                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                                    {formData.targetItems.length} items selected
                                </span>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Scope Tabs */}
                            <div className="flex p-1 bg-gray-50 rounded-2xl space-x-1 overflow-x-auto">
                                {[
                                    { id: 'all', label: 'All Orders' },
                                    { id: 'new_user', label: 'New Users' },
                                    { id: 'category', label: 'Category' },
                                    { id: 'subcategory', label: 'Sub-Category' },
                                    { id: 'product', label: 'Product' }
                                ].map(scope => {
                                    const isActive = (scope.id === 'new_user' && formData.userEligibility === 'new') ||
                                        (scope.id !== 'new_user' && formData.applicabilityType === scope.id && formData.userEligibility !== 'new');

                                    return (
                                        <button
                                            key={scope.id}
                                            type="button"
                                            onClick={() => {
                                                if (scope.id === 'new_user') {
                                                    setFormData({ ...formData, applicabilityType: 'all', userEligibility: 'new', targetItems: [] });
                                                } else {
                                                    setFormData({ ...formData, applicabilityType: scope.id, userEligibility: 'all', targetItems: [] });
                                                }
                                            }}
                                            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${isActive
                                                    ? 'bg-white text-footerBg shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            {scope.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Scope Content */}
                            <div className="border border-gray-100 rounded-2xl overflow-hidden min-h-[150px] max-h-[400px] overflow-y-auto p-4 bg-gray-50/50">
                                {formData.userEligibility === 'new' && (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-2">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-footerBg">New Users Only</p>
                                        <p className="text-xs text-gray-400 max-w-xs">This coupon will only work for customers placing their first order.</p>
                                    </div>
                                )}

                                {formData.applicabilityType === 'all' && formData.userEligibility !== 'new' && (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-2">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-footerBg">Entire Order</p>
                                        <p className="text-xs text-gray-400 max-w-xs">This coupon applies to the total cart value for all users.</p>
                                    </div>
                                )}

                                {formData.applicabilityType === 'category' && formData.userEligibility !== 'new' && (
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat.id || cat._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 transition-all">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.targetItems.includes(cat.id || cat._id) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                    {formData.targetItems.includes(cat.id || cat._id) && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.targetItems.includes(cat.id || cat._id)}
                                                    onChange={() => toggleTargetItem(cat.id || cat._id)}
                                                />
                                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {formData.applicabilityType === 'subcategory' && formData.userEligibility !== 'new' && (
                                    <div className="space-y-2">
                                        {subCategories.map(sub => (
                                            <label key={sub.id || sub._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 transition-all">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.targetItems.includes(sub.name) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                    {formData.targetItems.includes(sub.name) && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.targetItems.includes(sub.name)}
                                                    onChange={() => toggleTargetItem(sub.name)}
                                                />
                                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">{sub.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {formData.applicabilityType === 'product' && formData.userEligibility !== 'new' && (
                                    <div className="space-y-2">
                                        {products.length > 0 ? products.map(p => (
                                            <label key={p.id} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-primary/30 transition-all">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${formData.targetItems.includes(p.id) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                    {formData.targetItems.includes(p.id) && <CheckCircle2 size={12} className="text-white" />}
                                                </div>
                                                {p.image && <img src={p.image} className="w-8 h-8 object-contain mix-blend-multiply" alt="" />}
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.targetItems.includes(p.id)}
                                                    onChange={() => toggleTargetItem(p.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-gray-700 truncate">{p.name}</div>
                                                    <div className="text-[9px] text-gray-400">{p.id} • {p.category}</div>
                                                </div>
                                            </label>
                                        )) : (
                                            <div className="text-center p-4 text-sm text-gray-400">No products found.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Validity & Targets */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" />
                            Validity Period
                        </h3>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Start Date</label>
                                <input
                                    type="date"
                                    name="validFrom"
                                    value={formData.validFrom}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Expiry Date</label>
                                <input
                                    type="date"
                                    name="validUntil"
                                    value={formData.validUntil}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Usage Restraints (Moved to Right Column) */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 text-left">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <Settings size={18} className="text-gray-400" />
                            Limits & Caps
                        </h3>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Order (₹)</label>
                                <input
                                    type="number"
                                    name="minOrderValue"
                                    value={formData.minOrderValue}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Discount (₹)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    disabled={formData.type === 'flat'}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all disabled:opacity-50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Limit</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">User Limit</label>
                                    <input
                                        type="number"
                                        name="perUserLimit"
                                        value={formData.perUserLimit}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-50 my-6"></div>

                        <div className="flex items-center justify-between p-2">
                            <span className="text-[10px] font-black text-footerBg uppercase tracking-widest">Coupon Active</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, active: !formData.active })}
                                className={`w-12 h-6 rounded-full transition-all relative ${formData.active ? 'bg-footerBg' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CouponFormPage;
