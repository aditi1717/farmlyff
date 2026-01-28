import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    Package,
    Tag as TagIcon,
    ArrowUpDown,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import Pagination from '../components/Pagination';

const ProductListPage = () => {
    const navigate = useNavigate();
    const { products, deleteProduct } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                const matchesSearch =
                    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesCategory = filterCategory === 'All' || product.category === filterCategory;

                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => (b.id?.localeCompare(a.id) || 0)); // Assuming higher ID is newer
    }, [products, searchTerm, filterCategory]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const getStockStatus = (variants) => {
        if (!variants || variants.length === 0) return { label: 'No Variants', color: 'text-gray-400 bg-gray-50' };
        const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
        const hasOutOfStock = variants.some(v => (v.stock || 0) === 0);

        if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-100' };
        if (hasOutOfStock) return { label: 'Partially In Stock', color: 'text-amber-600 bg-amber-50 border-amber-100' };
        return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Product Inventory</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage your premium dry fruit catalog</p>
                </div>
                <button
                    onClick={() => navigate('/admin/products/add')}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add New Product
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-footerBg rounded-2xl flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total SKUs</p>
                        <p className="text-2xl font-black text-footerBg">{products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-footerBg rounded-2xl flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Stock</p>
                        <p className="text-2xl font-black text-footerBg">{products.filter(p => p.variants?.some(v => (v.stock || 0) > 0)).length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-footerBg rounded-2xl flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Low Stock</p>
                        <p className="text-2xl font-black text-footerBg">{products.filter(p => p.variants?.some(v => (v.stock || 0) < 10)).length}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products, brands..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-gray-50 border border-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none focus:bg-white focus:border-primary cursor-pointer shrink-0"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.replace(/-/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50 text-left">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pricing (Base)</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Variants</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stock Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedProducts.map((product) => {
                                const status = getStockStatus(product.variants);
                                const bestVariant = product.variants?.[0];

                                return (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                                                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">{product.brand}</p>
                                                    <p className="font-bold text-footerBg text-sm line-clamp-1">{product.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="px-2 py-0.5 bg-gray-50 text-[8px] font-black text-gray-400 uppercase rounded tracking-widest border border-gray-100">{product.tag || 'Standard'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1 text-left">
                                                <p className="text-[10px] font-black text-footerBg uppercase tracking-tight">{product.category}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.subcategory}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-left">
                                            {bestVariant ? (
                                                <div className="space-y-0.5 text-left">
                                                    <p className="font-black text-footerBg text-sm">₹{bestVariant.price}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 line-through">₹{bestVariant.mrp}</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs font-bold text-red-400 text-left">No PriceSet</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-black text-footerBg border border-gray-100">
                                                {product.variants?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <div className="relative group/more">
                                                    <button className="p-2 text-gray-400 hover:text-footerBg rounded-lg">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default ProductListPage;
