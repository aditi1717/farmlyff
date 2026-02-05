import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Boxes,
    CheckCircle2,
    Star,
    ChevronDown,
    ChevronUp,
    Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Pagination from '../components/Pagination';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import { useDeleteProduct } from '../../../hooks/useProducts';
import toast from 'react-hot-toast';

const ComboProductsPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const deleteProductMutation = useDeleteProduct();

    // Fetch all products
    const { data: allProducts = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/products');
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterCategory, setFilterCategory] = useState('All');
    const [expandedComboId, setExpandedComboId] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const itemsPerPage = 8;

    // Dummy Data for Preview if no real combo products exist
    const dummyCombos = [
        {
            id: 'dc1',
            name: 'Diwali Celebration Mega Pack',
            brand: 'Farmlyf Premium',
            category: 'Combos & Packs',
            subcategory: 'Festival Combos',
            image: 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=200&auto=format&fit=crop',
            variants: [{ price: 2999, stock: 45 }],
            rating: 4.9,
            createdAt: new Date().toISOString(),
            contents: [
                { productName: 'Premium Almonds', variant: '500g', quantity: 2 },
                { productName: 'Organic Cashews', variant: '500g', quantity: 2 },
                { productName: 'Original Honey', variant: '250ml', quantity: 1 }
            ]
        },
        {
            id: 'dc2',
            name: 'Immunity Booster Kit',
            brand: 'FARMLYF',
            category: 'Combos & Packs',
            subcategory: 'Health & Wellness',
            image: 'https://images.unsplash.com/photo-1610725666202-1a4686940337?q=80&w=200&auto=format&fit=crop',
            variants: [{ price: 1499, stock: 12 }],
            rating: 4.7,
            createdAt: new Date().toISOString(),
            contents: [
                { productName: 'Amla Candy', variant: '200g', quantity: 2 },
                { productName: 'Giloy Juice', variant: '500ml', quantity: 1 }
            ]
        },
        {
            id: 'dc3',
            name: 'Gourmet Breakfast Bundle',
            brand: 'FARMLYF',
            category: 'Combos & Packs',
            subcategory: 'Daily Essentials',
            image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=200&auto=format&fit=crop',
            variants: [{ price: 899, stock: 0 }],
            rating: 4.5,
            createdAt: new Date().toISOString(),
            contents: [
                { productName: 'Multigrain Oats', variant: '1kg', quantity: 1 },
                { productName: 'Peanut Butter Creamy', variant: '350g', quantity: 1 }
            ]
        }
    ];

    // Get all COMBOS (Parent Products)
    const combos = useMemo(() => {
        const realCombos = allProducts.filter(p =>
            p.category === 'combos-packs' ||
            p.subcategory?.toLowerCase().includes('pack') ||
            p.name?.toLowerCase().includes('combo') ||
            p.type === 'combo'
        );

        // If real combos are empty, show dummy data
        return realCombos.length > 0 ? realCombos : dummyCombos;
    }, [allProducts]);

    const filteredCombos = useMemo(() => {
        return combos.filter(combo => {
            const matchesSearch =
                combo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                combo.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                combo.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = filterCategory === 'All' || combo.subcategory === filterCategory;

            return matchesSearch && matchesCategory;
        }).sort((a, b) => (b.id?.localeCompare(a.id) || 0));
    }, [combos, searchTerm, filterCategory]);

    const paginatedCombos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCombos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCombos, currentPage]);

    const totalPages = Math.ceil(filteredCombos.length / itemsPerPage);
    const subCategories = ['All', ...new Set(combos.map(p => p.subcategory).filter(Boolean))];

    // --- Helpers ---
    const getPriceRange = (variants) => {
        if (!variants || variants.length === 0) return '₹0';
        const prices = variants.map(v => v.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (min === max) return `₹${min}`;
        return `₹${min} – ₹${max}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const getStockStatus = (variants) => {
        if (!variants || variants.length === 0) return { label: 'No Variants', color: 'text-gray-400 bg-gray-50 border-gray-100' };
        const totalStock = variants.reduce((acc, v) => acc + (v.stock || 0), 0);
        const hasOutOfStock = variants.some(v => (v.stock || 0) === 0);

        if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50 border-red-100' };
        if (hasOutOfStock || totalStock < 20) return { label: 'Low Stock', color: 'text-amber-600 bg-amber-50 border-amber-100' };
        return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    };

    // --- Actions ---
    const handleDelete = (id) => {
        if (id.startsWith('dc')) return toast.error("Cannot delete dummy data!");
        if (window.confirm('Are you sure you want to delete this combo product?')) {
            deleteProductMutation.mutate(id);
        }
    };

    const handleBulkDelete = () => {
        const skipCount = selectedProducts.filter(id => id.startsWith('dc')).length;
        if (skipCount > 0) return toast.error(`Ignored ${skipCount} dummy items. Re-select only real data.`);

        if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} combos?`)) {
            selectedProducts.forEach(id => deleteProductMutation.mutate(id));
            setSelectedProducts([]);
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProducts(paginatedCombos.map(p => p.id || p._id));
        } else {
            setSelectedProducts([]);
        }
    };

    const toggleSelectProduct = (id) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const toggleExpand = (id) => {
        setExpandedComboId(prev => prev === id ? null : id);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Custom CSS to hide scrollbar but keep functionality */}
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Combo Inventory</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Curate and Manage Product Bundles</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedProducts.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100 animate-in fade-in zoom-in duration-200"
                        >
                            <Trash2 size={18} strokeWidth={3} /> Delete ({selectedProducts.length})
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/admin/combo-products/add')}
                        className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} strokeWidth={3} /> Add New Bundle
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search bundles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-gray-50 border border-transparent text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl outline-none focus:bg-white focus:border-primary cursor-pointer shrink-0"
                    >
                        {subCategories.map(cat => (
                            <option key={cat} value={cat}>{cat.replace(/-/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Combos Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead width="30px"></AdminTableHead>
                        <AdminTableHead width="40px">
                            <input
                                type="checkbox"
                                onChange={toggleSelectAll}
                                checked={paginatedCombos.length > 0 && selectedProducts.length === paginatedCombos.length}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                        </AdminTableHead>
                        <AdminTableHead>Combo Name</AdminTableHead>
                        <AdminTableHead className="text-center">SKU Count</AdminTableHead>
                        <AdminTableHead>Combo Category</AdminTableHead>
                        <AdminTableHead>Price Range</AdminTableHead>
                        <AdminTableHead>Stock Status</AdminTableHead>
                        <AdminTableHead>Rating</AdminTableHead>
                        <AdminTableHead>Status</AdminTableHead>
                        <AdminTableHead>Created Date</AdminTableHead>
                        <AdminTableHead className="text-right">Actions</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {paginatedCombos.map((combo) => {
                            const status = getStockStatus(combo.variants);
                            const isExpanded = expandedComboId === combo.id;
                            const isSelected = selectedProducts.includes(combo.id || combo._id);

                            return (
                                <React.Fragment key={combo.id || combo._id}>
                                    <AdminTableRow
                                        className={`${isExpanded ? 'bg-gray-50' : ''} ${isSelected ? 'bg-green-50/30' : ''}`}
                                        onClick={() => toggleExpand(combo.id)}
                                    >
                                        <AdminTableCell onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => toggleExpand(combo.id)} className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </AdminTableCell>
                                        <AdminTableCell onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelectProduct(combo.id || combo._id)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            />
                                        </AdminTableCell>
                                        <AdminTableCell className="cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                                    {combo.image ? (
                                                        <img src={combo.image} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Boxes size={20} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                                        {combo.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-center">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                                                {combo.variants?.length || 0}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-sm text-gray-700">{combo.subcategory || '-'}</span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-sm font-medium text-gray-900">{getPriceRange(combo.variants)}</span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-')}`}>
                                                {status.label}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <div className="flex items-center gap-1">
                                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                                <span className="text-sm text-gray-700">{combo.rating || '4.5'}</span>
                                            </div>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${combo.variants?.some(v => (v.stock || 0) > 0) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {combo.variants?.some(v => (v.stock || 0) > 0) ? 'Active' : 'Inactive'}
                                            </span>
                                        </AdminTableCell>
                                        <AdminTableCell>
                                            <span className="text-sm text-gray-500">{formatDate(combo.createdAt || Date.now())}</span>
                                        </AdminTableCell>
                                        <AdminTableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/combo-products/edit/${combo.id || combo._id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(combo.id || combo._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </AdminTableCell>
                                    </AdminTableRow>

                                    {/* Expanded View: Show Pack Contents */}
                                    {isExpanded && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan="11" className="p-0 border-b border-gray-100">
                                                <div className="p-4 pl-14 flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200">
                                                    {/* Part 1: SKU / Variants Table (Exact match of ProductListPage) */}
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bundle Variants & Pricing</p>
                                                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm w-full md:w-3/4 max-w-full">
                                                            <table className="text-left border-collapse w-full">
                                                                <thead>
                                                                    <tr className="bg-gray-100 border-b border-gray-200">
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">SKU / ID</th>
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Weight / Option</th>
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Price</th>
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Stock</th>
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap text-right">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50">
                                                                    {combo.variants?.map((variant, idx) => (
                                                                        <tr key={variant.id || idx} className="hover:bg-gray-50/50">
                                                                            <td className="px-4 py-2 font-mono text-xs font-bold text-gray-600">
                                                                                {combo.brand?.substring(0, 3).toUpperCase() || 'FLF'}-{variant.weight || variant.name || 'VAR'}-{idx + 1}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700">{variant.weight || variant.name || 'Standard'}</td>
                                                                            <td className="px-4 py-2">
                                                                                <div className="flex items-baseline gap-2">
                                                                                    <span className="text-sm text-gray-900">₹{variant.price}</span>
                                                                                    {variant.mrp && <span className="text-xs text-gray-400 line-through">₹{variant.mrp}</span>}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700">{variant.stock}</td>
                                                                            <td className="px-4 py-2 text-right">
                                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${(variant.stock || 0) > 10 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                                    (variant.stock || 0) > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                                        'bg-red-50 text-red-600 border-red-100'
                                                                                    }`}>
                                                                                    {(variant.stock || 0) > 10 ? 'Active' : (variant.stock || 0) > 0 ? 'Low' : 'OOS'}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* Part 2: Pack Composition (The contents of the combo) */}
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bundle Composition (Included Assets)</p>
                                                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm w-full md:w-3/4 max-w-full">
                                                            <table className="text-left border-collapse w-full">
                                                                <thead>
                                                                    <tr className="bg-gray-100 border-b border-gray-200">
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Included Asset</th>
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Variation</th>
                                                                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap text-right">Volume / Qty</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-50">
                                                                    {combo.contents?.map((item, idx) => (
                                                                        <tr key={idx} className="hover:bg-gray-50/50">
                                                                            <td className="px-4 py-2 text-sm text-gray-700 font-medium">
                                                                                {item.productName || `ID: ${item.productId}`}
                                                                            </td>
                                                                            <td className="px-4 py-2">
                                                                                <span className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-gray-500">{item.variant || 'Standard'}</span>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-right text-sm text-primary font-bold">
                                                                                × {item.quantity}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    {(!combo.contents || combo.contents.length === 0) && (
                                                                        <tr>
                                                                            <td colSpan="3" className="px-6 py-8 text-xs text-gray-400 italic text-center">No components linked to this bundle</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {filteredCombos.length === 0 && (
                            <tr>
                                <td colSpan="11" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                            <Boxes size={32} />
                                        </div>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No bundles available</p>
                                        <button
                                            onClick={() => navigate('/admin/combo-products/add')}
                                            className="mt-4 text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                                        >
                                            Add New Bundle
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </AdminTableBody>
                </AdminTable>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredCombos.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default ComboProductsPage;
