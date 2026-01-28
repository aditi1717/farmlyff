import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    ChevronRight,
    Layers,
    Image as ImageIcon,
    Eye,
    EyeOff,
    MoreVertical,
    GripVertical,
    Upload,
    Filter
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import Pagination from '../components/Pagination';

const CategoriesPage = () => {
    const { products } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Group categories and subcategories from existing products for initial view
    const initialCategories = useMemo(() => {
        const cats = {};
        products.forEach(p => {
            if (!cats[p.category]) {
                cats[p.category] = {
                    id: p.category,
                    name: p.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    image: p.image, // Just as a placeholder
                    status: 'Active',
                    subCategories: new Set(),
                    productCount: 0,
                    createdAt: Date.now()
                };
            }
            cats[p.category].subCategories.add(p.subcategory);
            cats[p.category].productCount++;
        });

        return Object.values(cats).map(c => ({
            ...c,
            showInNavbar: true,
            showInShopByCategory: true,
            subCategories: Array.from(c.subCategories).map(sc => ({
                id: sc.toLowerCase().replace(/\s+/g, '-'),
                name: sc,
                image: '', // Initialize as empty for sub-categories
                status: 'Active'
            }))
        }));
    }, [products]);

    const [categories, setCategories] = useState(initialCategories);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [newCat, setNewCat] = useState({ name: '', image: '', status: 'Active', showInNavbar: false, showInShopByCategory: false });
    const catFileInputRef = React.useRef(null);
    const editFileInputRef = React.useRef(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredCategories = useMemo(() => {
        return categories
            .filter(cat => {
                const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [categories, searchTerm, statusFilter]);

    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCategories, currentPage]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const toggleStatus = (id) => {
        setCategories(categories.map(c =>
            c.id === id ? { ...c, status: c.status === 'Active' ? 'Hidden' : 'Active' } : c
        ));
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            if (type === 'category') {
                setNewCat({ ...newCat, image: imageUrl });
            } else if (type === 'edit') {
                setEditingCategory({ ...editingCategory, image: imageUrl });
            }
        }
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        const id = newCat.name.toLowerCase().replace(/\s+/g, '-');
        setCategories([{ ...newCat, id, subCategories: [], productCount: 0, createdAt: Date.now() }, ...categories]);
        setShowAddModal(false);
        setNewCat({ name: '', image: '', status: 'Active', showInNavbar: false, showInShopByCategory: false });
        setCurrentPage(1); // Reset to first page to see new category
    };

    const handleUpdateCategory = (e) => {
        e.preventDefault();
        setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
        setEditingCategory(null);
    };

    const handleDeleteCategory = (id) => {
        if (window.confirm('Are you sure you want to delete this category? All its sub-categories will be affected.')) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Category Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Organize your products with categories and sub-categories</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add New Category
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['All', 'Active', 'Hidden'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Stats</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Visibility</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedCategories.map((category) => (
                                <tr key={category.id} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                                <img src={category.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-footerBg uppercase tracking-tight text-sm">{category.name}</h3>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-xs font-black text-footerBg">{category.subCategories.length}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Sub-levels</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 flex-wrap max-w-[150px]">
                                            {category.showInNavbar && <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-blue-100">Navbar</span>}
                                            {category.showInShopByCategory && <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-purple-100">Home Tiles</span>}
                                            {!category.showInNavbar && !category.showInShopByCategory && <span className="text-[9px] font-bold text-gray-300 italic uppercase">Private</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(category.id)}
                                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${category.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}
                                        >
                                            {category.status === 'Active' ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {category.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingCategory(category)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all font-bold"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredCategories.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-footerBg uppercase tracking-tight">New Category</h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Add high-level grouping</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-footerBg"><Plus size={20} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newCat.name}
                                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-footerBg outline-none focus:border-primary transition-all text-left text-sm"
                                    placeholder="e.g. Exotic Nuts"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Photo</label>
                                <input
                                    type="file"
                                    ref={catFileInputRef}
                                    onChange={(e) => handleImageChange(e, 'category')}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => catFileInputRef.current.click()}
                                    className="w-full h-24 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative group"
                                >
                                    {newCat.image ? (
                                        <>
                                            <img src={newCat.image} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-footerBg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload size={18} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={20} className="text-gray-200 mb-1" />
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">Click to upload</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer group hover:border-primary/30 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={newCat.showInNavbar}
                                        onChange={(e) => setNewCat({ ...newCat, showInNavbar: e.target.checked })}
                                        className="w-3.5 h-3.5 rounded-md border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-[8px] font-black text-footerBg uppercase tracking-tight">Navbar</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer group hover:border-primary/30 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={newCat.showInShopByCategory}
                                        onChange={(e) => setNewCat({ ...newCat, showInShopByCategory: e.target.checked })}
                                        className="w-3.5 h-3.5 rounded-md border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-[8px] font-black text-footerBg uppercase tracking-tight">Tiles</span>
                                </label>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="submit" className="flex-1 bg-footerBg text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-footerBg/10 hover:bg-primary transition-all">Create Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Category Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
                    <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-footerBg uppercase tracking-tight">Edit Category</h2>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Update category details</p>
                            </div>
                            <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-footerBg"><Plus size={20} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-footerBg outline-none focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-1.5 text-left">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Photo</label>
                                <input
                                    type="file"
                                    ref={editFileInputRef}
                                    onChange={(e) => handleImageChange(e, 'edit')}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => editFileInputRef.current.click()}
                                    className="w-full h-24 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative group"
                                >
                                    {editingCategory.image ? (
                                        <>
                                            <img src={editingCategory.image} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-footerBg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload size={18} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={20} className="text-gray-200 mb-1" />
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">Click to upload</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer group hover:border-primary/30 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={editingCategory.showInNavbar}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, showInNavbar: e.target.checked })}
                                        className="w-3.5 h-3.5 rounded-md border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-[8px] font-black text-footerBg uppercase tracking-tight">Navbar</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer group hover:border-primary/30 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={editingCategory.showInShopByCategory}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, showInShopByCategory: e.target.checked })}
                                        className="w-3.5 h-3.5 rounded-md border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-[8px] font-black text-footerBg uppercase tracking-tight">Tiles</span>
                                </label>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button type="submit" className="flex-1 bg-footerBg text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-footerBg/10 hover:bg-primary transition-all">Update Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
