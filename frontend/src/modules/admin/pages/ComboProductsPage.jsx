import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Boxes,
    CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../../context/ShopContext';
import Pagination from '../components/Pagination';

const ComboProductsPage = () => {
    const navigate = useNavigate();
    const { packs, products, deletePack } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCombo, setFilterCombo] = useState('All');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Get all combos
    const combos = useMemo(() => {
        return packs.filter(p =>
            p.category === 'combos-packs' ||
            p.subcategory?.toLowerCase().includes('pack') ||
            p.name?.toLowerCase().includes('combo')
        );
    }, [packs]);

    // Get products that have combo association (with contents array)
    const comboProducts = useMemo(() => {
        const productsWithCombo = [];

        combos.forEach(combo => {
            if (combo.contents && Array.isArray(combo.contents)) {
                combo.contents.forEach(item => {
                    productsWithCombo.push({
                        ...item,
                        comboId: combo.id,
                        comboName: combo.name,
                        id: `${combo.id}-${item.productId}` // Unique ID
                    });
                });
            }
        });

        return productsWithCombo;
    }, [combos]);

    const filteredProducts = useMemo(() => {
        return comboProducts.filter(item => {
            const matchesSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.comboName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCombo = filterCombo === 'All' || item.comboId === filterCombo;
            return matchesSearch && matchesCombo;
        });
    }, [comboProducts, searchTerm, filterCombo]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Combo Products</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage products in combo packs</p>
                </div>
                <button
                    onClick={() => navigate('/admin/combo-products/add')}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add Combo Product
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-primary rounded-2xl flex items-center justify-center border border-gray-100">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Products</p>
                        <p className="text-2xl font-black text-footerBg">{comboProducts.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-gray-100">
                        <Boxes size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Combos</p>
                        <p className="text-2xl font-black text-footerBg">{combos.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-blue-600 rounded-2xl flex items-center justify-center border border-gray-100">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unique Products</p>
                        <p className="text-2xl font-black text-footerBg">{new Set(comboProducts.map(p => p.productId)).size}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products or combos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={filterCombo}
                    onChange={(e) => {
                        setFilterCombo(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="bg-gray-50 border border-transparent rounded-xl py-2.5 px-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all cursor-pointer"
                >
                    <option value="All">All Combos</option>
                    {combos.map(combo => (
                        <option key={combo.id} value={combo.id}>{combo.name}</option>
                    ))}
                </select>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Product</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Quantity</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Combo</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package size={48} className="text-gray-200" />
                                            <p className="text-sm font-bold text-gray-400">No combo products found</p>
                                            <button
                                                onClick={() => navigate('/admin/combo-products/add')}
                                                className="text-xs font-bold text-primary hover:underline"
                                            >
                                                Add your first combo product
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors text-left">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                                                    <Package size={20} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-footerBg">{item.productName || 'Unknown Product'}</p>
                                                    <p className="text-[10px] text-gray-400">ID: {item.productId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-bold">
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[10px] font-bold max-w-xs truncate">
                                                <Boxes size={12} className="mr-1 shrink-0" />
                                                {item.comboName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/combos/edit/${item.comboId}`)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all"
                                                    title="Edit Combo"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all"
                                                    title="Remove from Combo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-100 p-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComboProductsPage;
