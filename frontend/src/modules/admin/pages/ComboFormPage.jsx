import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ImageIcon,
    Package,
    Info,
    Tag as TagIcon,
    Gift,
    Eye,
    EyeOff
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const ComboFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    // Fetch Products (for selection and finding current combo)
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

    // Add Mutation
    const addMutation = useMutation({
        mutationFn: async (newCombo) => {
            const res = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCombo)
            });
            if (!res.ok) throw new Error('Failed to create combo');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Combo created successfully!');
            navigate('/admin/combo-products');
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update combo');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Combo updated successfully!');
            navigate('/admin/combo-products');
        }
    });

    // Get Combo Parent ID
    const comboParentId = useMemo(() => {
        const parent = categories.find(c => c.slug === 'combos-packs' || c.name === 'Combos & Packs');
        return parent?._id || parent?.id;
    }, [categories]);

    // Get Available Combo Categories (SubCategories of Combos)
    const comboCategories = useMemo(() => {
        if (!comboParentId) return [];
        return subCategories.filter(s => {
             if (!s.parent) return false;
             const pId = typeof s.parent === 'object' ? s.parent._id || s.parent.id : s.parent;
             return pId === comboParentId;
        });
    }, [subCategories, comboParentId]);

    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        // General Information
        name: '',
        badge: '',
        shortDescription: '',
        description: '',

        // Classification
        category: 'combos-packs',
        subcategory: 'Festival Combos',
        occasionTag: '',

        // Combo Contents
        contents: [],

        // Pricing (auto-calculated)
        individualTotal: 0,
        comboPrice: '',
        savings: 0,
        discountPercentage: 0,

        // Benefits
        benefits: ['Perfect for gifting', 'Value for money'],

        // Stock & Visibility
        stockStatus: 'In Stock',
        stock: 100,
        isVisible: true,

        // Media
        image: '',
        galleryImages: [],
        rating: 4.5
    });

    useEffect(() => {
        if (isEdit && products.length > 0) {
            const combo = products.find(p => p.id === id || p._id === id);
            if (combo) {
                setFormData({
                    ...formData,
                    ...combo,
                    contents: combo.contents || [],
                    benefits: combo.benefits || ['Perfect for gifting'],
                    isVisible: combo.isVisible !== false,
                    stockStatus: combo.stockStatus || 'In Stock',
                    stock: combo.stock || 100,
                    galleryImages: combo.galleryImages || []
                });
            }
        }
    }, [id, isEdit, products]);

    // Auto-calculate pricing
    const calculatedPricing = useMemo(() => {
        let total = 0;
        formData.contents.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product && product.variants) {
                const variant = product.variants.find(v => v.weight === item.variant);
                if (variant) {
                    total += parseFloat(variant.price || 0);
                }
            }
        });

        const comboPrice = parseFloat(formData.comboPrice) || 0;
        const savings = total - comboPrice;
        const discountPercentage = total > 0 ? Math.round((savings / total) * 100) : 0;

        return {
            individualTotal: total,
            savings: savings > 0 ? savings : 0,
            discountPercentage: discountPercentage > 0 ? discountPercentage : 0
        };
    }, [formData.contents, formData.comboPrice, products]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    const handleGalleryImagesChange = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({
            ...prev,
            galleryImages: [...prev.galleryImages, ...imageUrls]
        }));
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            galleryImages: prev.galleryImages.filter((_, i) => i !== index)
        }));
    };

    // Combo Contents Management
    const addProduct = () => {
        setFormData(prev => ({
            ...prev,
            contents: [...prev.contents, { productId: '', productName: '', variant: '', quantity: 1 }]
        }));
    };

    const removeProduct = (index) => {
        setFormData(prev => ({
            ...prev,
            contents: prev.contents.filter((_, i) => i !== index)
        }));
    };

    const updateProduct = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            contents: prev.contents.map((item, i) => {
                if (i !== index) return item;

                if (field === 'productId') {
                    const selectedProduct = products.find(p => p.id === value);
                    return {
                        ...item,
                        productId: value,
                        productName: selectedProduct ? selectedProduct.name : '',
                        variant: selectedProduct?.variants?.[0]?.weight || ''
                    };
                }

                return { ...item, [field]: value };
            })
        }));
    };

    // Benefits Management
    const addBenefit = () => {
        setFormData(prev => ({
            ...prev,
            benefits: [...prev.benefits, '']
        }));
    };

    const removeBenefit = (index) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index)
        }));
    };

    const updateBenefit = (index, value) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.map((item, i) => i === index ? value : item)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const comboData = {
            id: isEdit ? id : `combo_${Date.now()}`,
            ...formData,
            brand: 'FARMLYF PACKS',
            price: parseFloat(formData.comboPrice),
            mrp: calculatedPricing.individualTotal,
            discount: `${calculatedPricing.discountPercentage}%`,
            tag: formData.badge || 'COMBO',
            individualTotal: calculatedPricing.individualTotal,
            savings: calculatedPricing.savings,
            discountPercentage: calculatedPricing.discountPercentage,
            createdAt: isEdit ? formData.createdAt : Date.now(),
            updatedAt: Date.now()
        };

        if (isEdit) {
            updateMutation.mutate({ id, data: comboData });
        } else {
            addMutation.mutate(comboData);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/combo-products')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">
                            {isEdit ? 'Edit Combo Product' : 'Create New Combo'}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">
                            {isEdit ? 'Update combo details and contents' : 'Build a premium product combo'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Save size={18} strokeWidth={3} /> Save Combo
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column - Main Content */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. General Combo Information */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <Info size={18} className="text-gray-400" />
                            General Information
                        </h3>

                        <div className="space-y-5">
                            {/* Combo Name */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Combo Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Grand Festival Special Pack"
                                    required
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                />
                            </div>

                            {/* Combo Badge */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Combo Badge</label>
                                <select
                                    name="badge"
                                    value={formData.badge}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all cursor-pointer"
                                >
                                    <option value="">None</option>
                                    <option value="FESTIVAL SPECIAL">Festival Special</option>
                                    <option value="BESTSELLER">Bestseller</option>
                                    <option value="LIMITED EDITION">Limited Edition</option>
                                    <option value="PREMIUM GIFT">Premium Gift</option>
                                </select>
                            </div>

                            {/* Short Description */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Short Description</label>
                                <input
                                    type="text"
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    placeholder="One-line catchy description"
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                />
                            </div>

                            {/* Detailed Description */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Detailed Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Detailed combo description, occasion-based info, etc."
                                    required
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Category & Classification */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <TagIcon size={18} className="text-gray-400" />
                            Classification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Category (Fixed) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Category</label>
                                <input
                                    type="text"
                                    value="Combos"
                                    disabled
                                    className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                                />
                            </div>

                            {/* Subcategory */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Subcategory *</label>
                                <select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    {comboCategories.length > 0 ? (
                                        comboCategories.map(cat => (
                                            <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No Categories Found</option>
                                    )}
                                </select>
                            </div>

                            {/* Occasion Tag */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Occasion Tag (Optional)</label>
                                <input
                                    type="text"
                                    name="occasionTag"
                                    value={formData.occasionTag}
                                    onChange={handleChange}
                                    placeholder="e.g., Diwali, Holi, New Year"
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Combo Contents (Most Important) */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <Package size={18} className="text-gray-400" />
                                What's Inside This Combo
                            </h3>
                            <button
                                type="button"
                                onClick={addProduct}
                                className="text-[9px] font-black text-primary uppercase flex items-center gap-2 hover:underline"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Product
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.contents.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <Package className="mx-auto mb-3 text-gray-300" size={40} />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No products added</p>
                                    <p className="text-[9px] text-gray-400 mt-1">Click "Add Product" to build your combo</p>
                                </div>
                            ) : (
                                formData.contents.map((item, idx) => {
                                    const selectedProduct = products.find(p => p.id === item.productId);

                                    return (
                                        <div key={idx} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">Product #{idx + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(idx)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                {/* Product Selector */}
                                                <div className="md:col-span-6">
                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Select Product</label>
                                                    <select
                                                        value={item.productId}
                                                        onChange={(e) => updateProduct(idx, 'productId', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                                        required
                                                    >
                                                        <option value="">-- Select Product --</option>
                                                        {products.filter(p => p.category !== 'combos-packs').map(product => (
                                                            <option key={product.id} value={product.id}>{product.name}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Variant Selector */}
                                                <div className="md:col-span-4">
                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Variant</label>
                                                    <select
                                                        value={item.variant}
                                                        onChange={(e) => updateProduct(idx, 'variant', e.target.value)}
                                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                                        required
                                                        disabled={!selectedProduct}
                                                    >
                                                        <option value="">Select Size</option>
                                                        {selectedProduct?.variants?.map((v, vIdx) => (
                                                            <option key={vIdx} value={v.weight}>{v.weight} - ₹{v.price}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Quantity */}
                                                <div className="md:col-span-2">
                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Qty</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateProduct(idx, 'quantity', parseInt(e.target.value))}
                                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 4. Combo Pricing */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest">Pricing & Savings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Individual Items Total (Auto) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Individual Items Total</label>
                                <div className="w-full bg-gray-100 border border-gray-200 rounded-xl p-4 text-sm font-black text-gray-600">
                                    ₹{calculatedPricing.individualTotal.toFixed(2)}
                                </div>
                            </div>

                            {/* Combo Selling Price */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Combo Selling Price *</label>
                                <input
                                    type="number"
                                    name="comboPrice"
                                    value={formData.comboPrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                />
                            </div>

                            {/* Savings (Auto) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">You Save</label>
                                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm font-black text-emerald-700">
                                    ₹{calculatedPricing.savings.toFixed(2)}
                                </div>
                            </div>

                            {/* Discount % (Auto) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Discount %</label>
                                <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm font-black text-blue-700">
                                    {calculatedPricing.discountPercentage}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Combo Benefits */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <Gift size={18} className="text-gray-400" />
                                Why Choose This Combo?
                            </h3>
                            <button
                                type="button"
                                onClick={addBenefit}
                                className="text-[9px] font-black text-primary uppercase flex items-center gap-2 hover:underline"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Benefit
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        value={benefit}
                                        onChange={(e) => updateBenefit(idx, e.target.value)}
                                        placeholder="e.g., Perfect for gifting"
                                        className="flex-1 bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-medium outline-none focus:bg-white focus:border-primary transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(idx)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Media, Stock & Visibility */}
                <div className="lg:col-span-4 space-y-8">

                    {/* 6. Media & Rating */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={18} className="text-gray-400" />
                            Media
                        </h3>

                        {/* Combo Image */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Main Combo Image</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            {formData.image ? (
                                <div className="relative group">
                                    <img src={formData.image} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                                >
                                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                        <Plus size={28} className="text-primary" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 group-hover:text-primary">Upload Main Image</p>
                                </button>
                            )}
                        </div>

                        {/* Rating */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Rating</label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.1"
                                className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                            />
                        </div>

                        {/* Gallery Images */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Gallery Images</label>
                            <input
                                id="gallery-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleGalleryImagesChange}
                                className="hidden"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                {formData.galleryImages.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {/* Add More Button */}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('gallery-upload')?.click()}
                                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                                >
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-all">
                                        <Plus size={18} className="text-primary" strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 group-hover:text-primary">Add More</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 7. Stock & Visibility */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest">Stock & Visibility</h3>

                        {/* Stock Status */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Stock Status</label>
                            <select
                                name="stockStatus"
                                value={formData.stockStatus}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all cursor-pointer"
                            >
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                                <option value="Limited">Limited Stock</option>
                            </select>
                        </div>

                        {/* Stock Quantity */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                            />
                        </div>

                        {/* Visibility Toggle */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Visibility</label>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isVisible: !prev.isVisible }))}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${formData.isVisible
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-gray-50 border-gray-200 text-gray-500'
                                    }`}
                            >
                                <span className="font-bold text-sm">{formData.isVisible ? 'Visible' : 'Hidden'}</span>
                                {formData.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ComboFormPage;
