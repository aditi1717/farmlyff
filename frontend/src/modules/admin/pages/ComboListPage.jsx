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

const ComboListPage = () => {
    const { packs, deletePack } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [newCombo, setNewCombo] = useState({ name: '', image: '', description: '', status: 'Active' });

    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    // Get all combos
    const combos = useMemo(() => {
        return packs.filter(p =>
            p.category === 'combos-packs' ||
            p.subcategory?.toLowerCase().includes('pack') ||
            p.name?.toLowerCase().includes('combo')
        );
    }, [packs]);

    const [combosList, setCombosList] = useState(combos);

    const filteredCombos = useMemo(() => {
        return combosList.filter(combo =>
            combo.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [combosList, searchTerm]);

    const toggleStatus = (id) => {
        setCombosList(combosList.map(c =>
            c.id === id ? { ...c, status: c.status === 'Active' ? 'Hidden' : 'Active' } : c
        ));
    };

    const handleImageChange = (e, type = 'new') => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            if (type === 'edit') {
                setEditingCombo({ ...editingCombo, image: imageUrl });
            } else {
                setNewCombo({ ...newCombo, image: imageUrl });
            }
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        const newEntry = {
            ...newCombo,
            id: `combo_${Date.now()}`,
            category: 'combos-packs',
            brand: 'FARMLYF PACKS',
            createdAt: Date.now()
        };
        setCombosList([newEntry, ...combosList]);
        setShowAddModal(false);
        setNewCombo({ name: '', image: '', description: '', status: 'Active' });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        setCombosList(combosList.map(c => c.id === editingCombo.id ? editingCombo : c));
        setEditingCombo(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this combo?')) {
            deletePack(id);
            setCombosList(combosList.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Combo Categories</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage all combo types</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
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
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Combos</p>
                        <p className="text-2xl font-black text-footerBg">{combosList.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-gray-100">
                        <Eye size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Combos</p>
                        <p className="text-2xl font-black text-footerBg">{combosList.filter(c => c.status === 'Active').length}</p>
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
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Combo Name</th>
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
                                        <p className="text-sm font-bold text-gray-400">No combos found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCombos.map(combo => (
                                    <tr key={combo.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {combo.image && (
                                                    <img src={combo.image} alt={combo.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                                )}
                                                <span className="font-bold text-sm text-footerBg">{combo.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500 max-w-md truncate">{combo.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(combo.id)}
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
                                                    onClick={() => handleDelete(combo.id)}
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

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h2 className="text-lg font-black text-footerBg uppercase mb-6">Add New Combo</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Combo Name</label>
                                <input
                                    type="text"
                                    value={newCombo.name}
                                    onChange={(e) => setNewCombo({ ...newCombo, name: e.target.value })}
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
                                    onChange={(e) => handleImageChange(e, 'new')}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primaryDeep cursor-pointer"
                                />
                                {newCombo.image && (
                                    <img src={newCombo.image} alt="Preview" className="mt-3 w-full h-32 object-cover rounded-xl border border-gray-200" />
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Description</label>
                                <textarea
                                    value={newCombo.description}
                                    onChange={(e) => setNewCombo({ ...newCombo, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-bold text-sm">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm">Add Combo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingCombo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h2 className="text-lg font-black text-footerBg uppercase mb-6">Edit Combo</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Combo Name</label>
                                <input
                                    type="text"
                                    value={editingCombo.name}
                                    onChange={(e) => setEditingCombo({ ...editingCombo, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Upload Image</label>
                                <input
                                    ref={editFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'edit')}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primaryDeep cursor-pointer"
                                />
                                {editingCombo.image && (
                                    <img src={editingCombo.image} alt="Preview" className="mt-3 w-full h-32 object-cover rounded-xl border border-gray-200" />
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Description</label>
                                <textarea
                                    value={editingCombo.description}
                                    onChange={(e) => setEditingCombo({ ...editingCombo, description: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent rounded-xl p-3 text-sm font-semibold outline-none focus:bg-white focus:border-primary resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setEditingCombo(null)} className="flex-1 bg-gray-100 text-gray-600 px-4 py-3 rounded-xl font-bold text-sm">Cancel</button>
                                <button type="submit" className="flex-1 bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComboListPage;
