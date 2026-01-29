import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    ImageIcon,
    Tag as TagIcon,
    Package,
    Info,
    ChevronRight,
    Search
} from 'lucide-react';
import { useProducts, useProduct, useAddProduct, useUpdateProduct, useCategories, useSubCategories, useUploadImage } from '../../../hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: products = [] } = useProducts();
    const { data: productToEdit } = useProduct(id);
    
    // Mutations
    const addProductMutation = useAddProduct();
    const updateProductMutation = useUpdateProduct();
    const uploadImageMutation = useUploadImage();
    const { data: dbCategories = [] } = useCategories();
    const { data: dbSubCategories = [] } = useSubCategories();

    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        brand: 'FARMLYF',
        category: 'nuts',
        subcategory: '',
        tag: '',
        image: '',
        description: '',
        rating: 4.5,
        variants: [
            { id: Date.now(), weight: '250g', mrp: '', price: '', stock: 100, unitPrice: '' }
        ],
        benefits: ['Heart-Healthy', 'Rich in Omega-3'],
        specifications: [
            { label: 'Origin', value: 'India' },
            { label: 'Shelf Life', value: '6 Months' }
        ],
        faqs: [
            { q: 'How to store?', a: 'Store in a cool, dry place.' }
        ],
        nutrition: [
            { label: 'Energy', value: '576 Kcal' },
            { label: 'Protein', value: '21g' },
            { label: 'Fat', value: '49g' },
            { label: 'Carbs', value: '22g' }
        ],
        contents: [] // For combo products
    });

    useEffect(() => {
        if (isEdit && productToEdit) {
                // Normalize nutrition data if it's an object (legacy format)
                let normalizedNutrition = productToEdit.nutrition;
                if (productToEdit.nutrition && !Array.isArray(productToEdit.nutrition)) {
                    normalizedNutrition = Object.entries(productToEdit.nutrition).map(([key, value]) => ({
                        label: key.charAt(0).toUpperCase() + key.slice(1),
                        value
                    }));
                }

                setFormData({
                    ...productToEdit,
                    variants: productToEdit.variants || [],
                    nutrition: normalizedNutrition || [],
                    contents: productToEdit.contents || [], // Ensure contents is always an array
                    benefits: productToEdit.benefits || [] // Ensure benefits is always an array
                });
        }
    }, [isEdit, productToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (vId, field, value) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map(v =>
                v.id === vId ? { ...v, [field]: value } : v
            )
        }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { id: Date.now(), weight: '', mrp: '', price: '', stock: 0, unitPrice: '' }]
        }));
    };

    const removeVariant = (vId) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter(v => v.id !== vId)
        }));
    };

    const addItem = (field, item) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], item] }));
    };

    const removeItem = (field, index) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const updateItem = (field, index, subfield, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => {
                if (i !== index) return item;
                return typeof item === 'string' ? value : { ...item, [subfield]: value };
            })
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.name.trim()) {
            toast.error('Product name is required');
            return;
        }
        if (!formData.category) {
            toast.error('Parent category is required');
            return;
        }

        const finalData = {
            ...formData,
            id: isEdit ? id : `prod_${Date.now()}`, // Consistent prefix + unique timestamp
            updatedAt: Date.now()
        };

        if (isEdit) {
            updateProductMutation.mutate({ id, data: finalData }, {
                onSuccess: () => navigate('/admin/products')
            });
        } else {
            addProductMutation.mutate(finalData, {
                onSuccess: () => navigate('/admin/products')
            });
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-left">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-footerBg hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">
                            {isEdit ? `Updating ${formData.name}` : 'Configure your new premium product'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-footerBg text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-footerBg/20"
                >
                    <Save size={18} /> Save Product
                </button>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Basic Details */}
                <div className="lg:col-span-8 space-y-8">
                    {/* General Information */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <Info size={18} className="text-gray-400" />
                            General Information
                        </h3>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Premium Royal Cashews"
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Brand Name</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Best-Seller Tag</label>
                                    <select
                                        name="tag"
                                        value={formData.tag}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-footerBg transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">None</option>
                                        <option value="PREMIUM">Premium</option>
                                        <option value="BESTSELLER">Bestseller</option>
                                        <option value="NEW LAUNCH">New Launch</option>
                                        <option value="FRESH">Fresh</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Describe the product health benefits and sourcing..."
                                    className="w-full bg-gray-50 border border-transparent rounded-3xl p-6 text-sm font-semibold outline-none focus:bg-white focus:border-footerBg transition-all leading-relaxed"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Variants */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <Package size={18} className="text-gray-400" />
                                Pricing & Variants
                            </h3>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-[10px] font-black text-footerBg uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Variant
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                                <div key={variant.id} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 grid grid-cols-12 gap-4 items-end group">
                                    <div className="col-span-12 md:col-span-2 space-y-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Weight / Size</label>
                                        <input
                                            type="text"
                                            value={variant.weight}
                                            onChange={(e) => handleVariantChange(variant.id, 'weight', e.target.value)}
                                            placeholder="250g"
                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-footerBg transition-all"
                                        />
                                    </div>
                                    <div className="col-span-6 md:col-span-2 space-y-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">MRP (₹)</label>
                                        <input
                                            type="number"
                                            value={variant.mrp}
                                            onChange={(e) => handleVariantChange(variant.id, 'mrp', e.target.value)}
                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-footerBg transition-all"
                                        />
                                    </div>
                                    <div className="col-span-6 md:col-span-2 space-y-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Selling (₹)</label>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-footerBg transition-all"
                                        />
                                    </div>
                                    <div className="col-span-6 md:col-span-2 space-y-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Stock (Qty)</label>
                                        <input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-footerBg transition-all"
                                        />
                                    </div>
                                    <div className="col-span-6 md:col-span-3 space-y-2">
                                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Unit Price Info</label>
                                        <input
                                            type="text"
                                            value={variant.unitPrice}
                                            onChange={(e) => handleVariantChange(variant.id, 'unitPrice', e.target.value)}
                                            placeholder="e.g., 140/100g"
                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-footerBg transition-all"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-1 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(variant.id)}
                                            className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                                            disabled={formData.variants.length === 1}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Advanced Details (Dynamic Sections) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {/* Benefits Section */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-footerBg uppercase tracking-[0.2em] flex items-center gap-2">Benefits</h3>
                                <button type="button" onClick={() => addItem('benefits', '')} className="text-[9px] font-black text-primary uppercase">+ Add</button>
                            </div>
                            <div className="space-y-3">
                                {formData.benefits?.map((benefit, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            value={benefit}
                                            onChange={(e) => updateItem('benefits', idx, null, e.target.value)}
                                            className="flex-1 bg-gray-50 border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                        />
                                        <button type="button" onClick={() => removeItem('benefits', idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nutrition Section */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-footerBg uppercase tracking-[0.2em]">Nutrition (Per 100g)</h3>
                                <button type="button" onClick={() => addItem('nutrition', { label: '', value: '' })} className="text-[9px] font-black text-primary uppercase">+ Add Field</button>
                            </div>
                            <div className="space-y-3">
                                {Array.isArray(formData.nutrition) && formData.nutrition.map((nut, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            placeholder="Label (e.g. Energy)"
                                            value={nut.label}
                                            onChange={(e) => updateItem('nutrition', idx, 'label', e.target.value)}
                                            className="w-1/3 bg-gray-50 border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                        />
                                        <input
                                            placeholder="Value (e.g. 500 Kcal)"
                                            value={nut.value}
                                            onChange={(e) => updateItem('nutrition', idx, 'value', e.target.value)}
                                            className="flex-1 bg-gray-50 border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                        />
                                        <button type="button" onClick={() => removeItem('nutrition', idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                {(!Array.isArray(formData.nutrition) || formData.nutrition.length === 0) && (
                                    <div className="text-center py-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No nutrition data added</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pack Contents Section (For Combo Products) */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-footerBg uppercase tracking-[0.2em]">Pack Contents (For Combos)</h3>
                                <button
                                    type="button"
                                    onClick={() => addItem('contents', { productId: '', productName: '', quantity: '' })}
                                    className="text-[9px] font-black text-primary uppercase flex items-center gap-2"
                                >
                                    <Plus size={14} /> Add Product
                                </button>
                            </div>
                            <p className="text-[9px] text-gray-500 -mt-2">Add products included in this combo pack. Only relevant for combo/pack products.</p>

                            <div className="space-y-3">
                                {Array.isArray(formData.contents) && formData.contents.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-50/50 p-3 rounded-xl">
                                        {/* Product Selector Dropdown */}
                                        <select
                                            value={item.productId}
                                            onChange={(e) => {
                                                const selectedProduct = products.find(p => p.id === e.target.value);
                                                if (selectedProduct) {
                                                    updateItem('contents', idx, 'productId', selectedProduct.id);
                                                    updateItem('contents', idx, 'productName', selectedProduct.name);
                                                } else {
                                                    updateItem('contents', idx, 'productId', e.target.value);
                                                }
                                            }}
                                            className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                        >
                                            <option value="">-- Select Product --</option>
                                            {products.filter(p => p.category !== 'combos-packs').map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Quantity Input */}
                                        <input
                                            placeholder="Quantity (e.g. 250g)"
                                            value={item.quantity}
                                            onChange={(e) => updateItem('contents', idx, 'quantity', e.target.value)}
                                            className="w-32 bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeItem('contents', idx)}
                                            className="text-red-400 hover:text-red-600 p-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {(!Array.isArray(formData.contents) || formData.contents.length === 0) && (
                                    <div className="text-center py-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <Package className="mx-auto mb-2 text-gray-300" size={32} />
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No products added to pack</p>
                                        <p className="text-[9px] text-gray-400 mt-1">Click "Add Product" to include products in this combo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Specifications Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 text-left">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-footerBg uppercase tracking-[0.2em]">Specifications</h3>
                            <button type="button" onClick={() => addItem('specifications', { label: '', value: '' })} className="text-[9px] font-black text-primary uppercase">+ Add Field</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.specifications.map((spec, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        placeholder="Label"
                                        value={spec.label}
                                        onChange={(e) => updateItem('specifications', idx, 'label', e.target.value)}
                                        className="w-1/3 bg-gray-50 border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                    />
                                    <input
                                        placeholder="Value"
                                        value={spec.value}
                                        onChange={(e) => updateItem('specifications', idx, 'value', e.target.value)}
                                        className="flex-1 bg-gray-50 border border-transparent rounded-xl p-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                    />
                                    <button type="button" onClick={() => removeItem('specifications', idx)} className="text-red-400"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 text-left">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-footerBg uppercase tracking-[0.2em]">Product FAQs</h3>
                            <button type="button" onClick={() => addItem('faqs', { q: '', a: '' })} className="text-[9px] font-black text-primary uppercase">+ Add Q&A</button>
                        </div>
                        <div className="space-y-4">
                            {formData.faqs.map((faq, idx) => (
                                <div key={idx} className="space-y-2 p-4 bg-gray-50 rounded-2xl relative">
                                    <button type="button" onClick={() => removeItem('faqs', idx)} className="absolute top-4 right-4 text-red-400"><Trash2 size={16} /></button>
                                    <input
                                        placeholder="Question"
                                        value={faq.q}
                                        onChange={(e) => updateItem('faqs', idx, 'q', e.target.value)}
                                        className="w-full bg-white border border-transparent rounded-xl p-3 text-xs font-black outline-none focus:border-primary transition-all"
                                    />
                                    <textarea
                                        placeholder="Answer"
                                        value={faq.a}
                                        onChange={(e) => updateItem('faqs', idx, 'a', e.target.value)}
                                        className="w-full bg-white border border-transparent rounded-xl p-3 text-xs font-semibold outline-none focus:border-primary transition-all"
                                        rows="2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Media & Classification */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Media */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 text-left">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={18} className="text-gray-400" />
                            Product Image
                        </h3>

                        <div className="aspect-square bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 relative group overflow-hidden">
                            {uploadImageMutation.isPending && (
                                <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center space-y-3">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Uploading...</p>
                                </div>
                            )}
                            {formData.image ? (
                                <>
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-footerBg/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="bg-white text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all group/label">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const res = await uploadImageMutation.mutateAsync(file);
                                                if (res?.url) {
                                                    setFormData(prev => ({ ...prev, image: res.url }));
                                                }
                                            }
                                        }}
                                    />
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 mx-auto shadow-sm group-hover/label:scale-110 transition-transform">
                                            <ImageIcon size={24} />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click to Upload</p>
                                        <p className="text-[8px] text-gray-300">Max size 5MB</p>
                                    </div>
                                </label>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Internal Image Path / URL</label>
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="Auto-fills on upload or paste path..."
                                className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all"
                            />
                        </div>
                    </div>

                    {/* Taxonomy */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 text-left">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <TagIcon size={18} className="text-gray-400" />
                            Classification
                        </h3>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Parent Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all cursor-pointer"
                                >
                                    <option value="">Select Category</option>
                                    {dbCategories.filter(c => c.status === 'Active').map(cat => (
                                        <option key={cat.id || cat._id} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Sub-Category</label>
                                <select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-footerBg transition-all cursor-pointer"
                                >
                                    <option value="">Select Sub-Category</option>
                                    {dbSubCategories
                                        .filter(sub => {
                                            const parentId = sub.parent?._id || sub.parent;
                                            const parentSlug = dbCategories.find(c => String(c._id || c.id) === String(parentId))?.slug;
                                            return parentSlug === formData.category && sub.status === 'Active';
                                        })
                                        .map(sub => (
                                            <option key={sub.id || sub._id} value={sub.name}>{sub.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;
