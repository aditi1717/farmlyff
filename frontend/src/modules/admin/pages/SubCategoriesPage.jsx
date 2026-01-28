import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Layers,
    Image as ImageIcon,
    Eye,
    EyeOff,
    Upload,
    ChevronDown
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';

const SubCategoriesPage = () => {
    const { products } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [parentFilter, setParentFilter] = useState('All');

    // Derived Categories & Sub-categories from shop data
    const categoryData = useMemo(() => {
        const cats = {};
        products.forEach(p => {
            if (!cats[p.category]) {
                cats[p.category] = {
                    id: p.category,
                    name: p.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    subCategories: new Set()
                };
            }
            cats[p.category].subCategories.add(p.subcategory);
        });

        const subCatsList = [];
        Object.values(cats).forEach(parent => {
            parent.subCategories.forEach(scName => {
                subCatsList.push({
                    id: scName.toLowerCase().replace(/\s+/g, '-'),
                    name: scName,
                    parentId: parent.id,
                    parentName: parent.name,
                    image: '', // Mock image
                    status: 'Active',
                    createdAt: Date.now()
                });
            });
        });

        return {
            parents: Object.values(cats),
            subCategories: subCatsList
        };
    }, [products]);

    const [subCategories, setSubCategories] = useState(categoryData.subCategories);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [newSub, setNewSub] = useState({ name: '', image: '', parentId: '', status: 'Active' });
    const fileInputRef = React.useRef(null);
    const editFileInputRef = React.useRef(null);

    const filteredSubs = useMemo(() => {
        return subCategories
            .filter(sub => {
                const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.parentName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesParent = parentFilter === 'All' || sub.parentId === parentFilter;
                return matchesSearch && matchesParent;
            })
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [subCategories, searchTerm, parentFilter]);

    const toggleStatus = (id) => {
        setSubCategories(subCategories.map(s =>
            s.id === id ? { ...s, status: s.status === 'Active' ? 'Hidden' : 'Active' } : s
        ));
    };

    const handleImageChange = (e, type = 'new') => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            if (type === 'edit') {
                setEditingSub({ ...editingSub, image: imageUrl });
            } else {
                setNewSub({ ...newSub, image: imageUrl });
            }
        }
    };

    const groupedSubs = useMemo(() => {
        const groups = {};
        categoryData.parents.forEach(p => {
            const subsForParent = filteredSubs.filter(s => s.parentId === p.id);
            if (subsForParent.length > 0 || (parentFilter === 'All' && searchTerm === '')) {
                groups[p.id] = {
                    category: p,
                    subs: subsForParent
                };
            }
        });
        return groups;
    }, [categoryData.parents, filteredSubs, parentFilter, searchTerm]);

    const handleAddSub = (e) => {
        e.preventDefault();
        const parent = categoryData.parents.find(p => p.id === newSub.parentId);
        if (!parent) return alert("Please select a parent category");

        const newEntry = {
            ...newSub,
            id: newSub.name.toLowerCase().replace(/\s+/g, '-'),
            parentName: parent.name,
            createdAt: Date.now()
        };
        setSubCategories([newEntry, ...subCategories]);
        setShowAddModal(false);
        setNewSub({ name: '', image: '', parentId: '', status: 'Active' });
    };

    const handleUpdateSub = (e) => {
        e.preventDefault();
        const parent = categoryData.parents.find(p => p.id === editingSub.parentId);
        const updatedEntry = {
            ...editingSub,
            parentName: parent?.name || 'Unknown'
        };
        setSubCategories(subCategories.map(s => s.id === editingSub.id ? updatedEntry : s));
        setEditingSub(null);
    };

    const handleDeleteSub = (id) => {
        if (window.confirm('Are you sure you want to delete this sub-category?')) {
            setSubCategories(subCategories.filter(s => s.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Sub-Category Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage secondary product levels</p>
                </div>
                <button
                    onClick={() => {
                        setNewSub({ name: '', image: '', parentId: '', status: 'Active' });
                        setShowAddModal(true);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add Sub-category
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search sub-categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                        <Layers size={14} className="text-gray-400" />
                        <select
                            value={parentFilter}
                            onChange={(e) => setParentFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                        >
                            <option value="All">All Parents</option>
                            {categoryData.parents.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Compact Category Groups */}
            <div className="space-y-6">
                {Object.values(groupedSubs).map(({ category, subs }) => (
                    <div key={category.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-primary/20">
                        <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-1.5 shadow-sm">
                                    <img src={category.image} className="w-full h-full object-contain" alt="" />
                                </div>
                                <div>
                                    <h2 className="font-black text-footerBg uppercase tracking-tight text-sm">{category.name}</h2>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{subs.length} Levels</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setNewSub({ ...newSub, parentId: category.id });
                                    setShowAddModal(true);
                                }}
                                className="bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
                            >
                                <Plus size={12} strokeWidth={3} /> Add Sub
                            </button>
                        </div>

                        <div className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">Sub-category</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-300 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {subs.map((sub) => (
                                        <tr key={sub.id} className="group hover:bg-gray-50/30 transition-all">
                                            <td className="px-6 py-2.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1 overflow-hidden shrink-0 group-hover:bg-white transition-colors">
                                                        {sub.image ? <img src={sub.image} className="w-full h-full object-contain" alt="" /> : <Layers size={14} className="text-gray-300" />}
                                                    </div>
                                                    <span className="font-bold text-footerBg uppercase tracking-tight text-xs">{sub.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <button
                                                    onClick={() => toggleStatus(sub.id)}
                                                    className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 border ${sub.status === 'Active'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-gray-50 text-gray-400 border-gray-100'
                                                        }`}
                                                >
                                                    <div className={`w-1 h-1 rounded-full ${sub.status === 'Active' ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                                                    {sub.status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-2.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setEditingSub(sub)}
                                                        className="p-1.5 text-gray-300 hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSub(sub.id)}
                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {subs.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center">
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">No sub-categories in this section</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Sub Category Modal (Compact) */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white rounded-[1.5rem] w-full max-w-[320px] relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-sm font-black text-footerBg uppercase tracking-tight">New Level</h2>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Adding to {categoryData.parents.find(p => p.id === newSub.parentId)?.name}</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-white rounded-full transition-colors"><Plus size={16} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleAddSub} className="p-4 space-y-3">
                            {!newSub.parentId && (
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Parent Category</label>
                                    <select
                                        required
                                        value={newSub.parentId}
                                        onChange={(e) => setNewSub({ ...newSub, parentId: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none focus:border-primary focus:bg-white transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categoryData.parents.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Level Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newSub.name}
                                    onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none focus:border-primary focus:bg-white transition-all"
                                    placeholder="e.g. Roasted Pistachios"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Level Image</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleImageChange(e)}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full h-20 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all overflow-hidden group"
                                >
                                    {newSub.image ? (
                                        <img src={newSub.image} className="w-full h-full object-contain" alt="" />
                                    ) : (
                                        <>
                                            <ImageIcon size={16} className="text-gray-300 mb-1" />
                                            <p className="text-[7px] font-black text-gray-400 uppercase">Upload Icon</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-footerBg text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md">Create Sub-category</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Sub Category Modal (Compact) */}
            {editingSub && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" onClick={() => setEditingSub(null)} />
                    <div className="bg-white rounded-[1.5rem] w-full max-w-[320px] relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-sm font-black text-footerBg uppercase tracking-tight">Edit Level</h2>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Updating details</p>
                            </div>
                            <button onClick={() => setEditingSub(null)} className="p-1.5 hover:bg-white rounded-full transition-colors"><Plus size={16} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleUpdateSub} className="p-4 space-y-3 text-left">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Level Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editingSub.name}
                                    onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold text-footerBg outline-none focus:border-primary focus:bg-white transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Level Image</label>
                                <input
                                    type="file"
                                    ref={editFileInputRef}
                                    onChange={(e) => handleImageChange(e, 'edit')}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => editFileInputRef.current.click()}
                                    className="w-full h-20 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all overflow-hidden group"
                                >
                                    {editingSub.image ? (
                                        <img src={editingSub.image} className="w-full h-full object-contain" alt="" />
                                    ) : (
                                        <>
                                            <ImageIcon size={16} className="text-gray-300 mb-1" />
                                            <p className="text-[7px] font-black text-gray-400 uppercase">Upload Icon</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-footerBg text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategoriesPage;
