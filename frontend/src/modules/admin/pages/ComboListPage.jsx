import React, { useState, useMemo, useRef } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Boxes,
    Eye,
    EyeOff,
    Upload
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import toast from 'react-hot-toast';

const ComboListPage = () => {
    const { categories, subCategories, fetchCategories } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [newItem, setNewItem] = useState({ name: '', image: '', description: '', status: 'Active' });
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Find "Combos & Packs" Parent ID
    const comboParentId = useMemo(() => {
        const parent = categories.find(c => c.slug === 'combos-packs' || c.name === 'Combos & Packs');
        return parent?._id || parent?.id;
    }, [categories]);

    // Filter SubCategories for Combos
    const comboCategories = useMemo(() => {
        if (!comboParentId) return [];
        return subCategories.filter(s => {
            const pId = typeof s.parent === 'object' ? s.parent._id || s.parent.id : s.parent;
            return pId === comboParentId;
        });
    }, [subCategories, comboParentId]);

    const filteredCombos = useMemo(() => {
        return comboCategories.filter(combo =>
            combo.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [comboCategories, searchTerm]);

    const handleFileChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEdit) {
                    setEditingCombo(prev => ({ ...prev, image: reader.result }));
                } else {
                    setPreview(reader.result);
                    setNewItem(prev => ({ ...prev, image: reader.result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comboParentId) return toast.error("Parent Category 'Combos & Packs' not found!");
        
        setLoading(true);
        const isEdit = !!editingCombo;
        const targetUrl = isEdit 
            ? `http://localhost:5000/api/subcategories/${editingCombo.id || editingCombo._id}`
            : `http://localhost:5000/api/subcategories`;
        
        const method = isEdit ? 'PUT' : 'POST';
        
        const payload = isEdit 
            ? { ...editingCombo, parent: comboParentId }
            : { ...newItem, parent: comboParentId, showInShopByCategory: true }; // Default true for shop strip

        try {
            const res = await fetch(targetUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchCategories(); // Refresh Context
                setShowAddModal(false);
                setEditingCombo(null);
                setNewItem({ name: '', image: '', description: '', status: 'Active' });
                setPreview(null);
            } else {
                toast.error('Failed to save combo category');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving combo category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this combo category?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/subcategories/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchCategories();
                } else {
                    toast.error('Failed to delete');
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const toggleStatus = async (item) => {
        const newStatus = item.status === 'Active' ? 'Hidden' : 'Active';
        try {
            await fetch(`http://localhost:5000/api/subcategories/${item.id || item._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, status: newStatus, parent: comboParentId })
            });
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Combo Categories</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage types of combos (e.g. Festival, Gift Packs)</p>
                </div>
                <button
                    onClick={() => {
                        setNewItem({ name: '', image: '', description: '', status: 'Active' });
                        setPreview(null);
                        setShowAddModal(true);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primaryDeep transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add Combo Category
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-primary rounded-2xl flex items-center justify-center border border-gray-100">
                        <Boxes size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Types</p>
                        <p className="text-2xl font-black text-footerBg">{comboCategories.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-gray-100">
                        <Eye size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Types</p>
                        <p className="text-2xl font-black text-footerBg">{comboCategories.filter(c => c.status === 'Active').length}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search combo categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-left">
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCombos.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <Boxes size={48} className="text-gray-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-gray-400">No combo categories found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCombos.map(combo => (
                                    <tr key={combo.id || combo._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {combo.image && (
                                                    <img src={combo.image} alt={combo.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                                )}
                                                <span className="font-bold text-sm text-footerBg">{combo.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500 max-w-md truncate">{combo.description || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(combo)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${combo.status === 'Active'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                                    }`}
                                            >
                                                {combo.status === 'Active' ? <Eye size={12} /> : <EyeOff size={12} />}
                                                {combo.status || 'Active'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingCombo(combo)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(combo.id || combo._id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all"
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
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingCombo) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h2 className="text-lg font-black text-footerBg uppercase mb-6">
                            {editingCombo ? 'Edit Combo Category' : 'Add New Combo Category'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={editingCombo ? editingCombo.name : newItem.name}
                                    onChange={(e) => editingCombo 
                                        ? setEditingCombo({ ...editingCombo, name: e.target.value }) 
                                        : setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Upload Image</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, !!editingCombo)}
                                    className="hidden"
                                />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden"
                                >
                                    {(editingCombo?.image || preview) ? (
                                        <img src={editingCombo?.image || preview} className="w-full h-full object-cover" alt="Preview"/>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload size={24} className="text-gray-300 mb-2"/>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Click to Upload</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Description</label>
                                <textarea
                                    value={editingCombo ? editingCombo.description : newItem.description}
                                    onChange={(e) => editingCombo 
                                        ? setEditingCombo({ ...editingCombo, description: e.target.value }) 
                                        : setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingCombo(null);
                                    }} 
                                    className="flex-1 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm disabled:opacity-70"
                                >
                                    {loading ? 'Saving...' : (editingCombo ? 'Update' : 'Add Category')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComboListPage;
