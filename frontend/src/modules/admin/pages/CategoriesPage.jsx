import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Image as ImageIcon,
    Eye,
    EyeOff,
    Upload,
    Loader
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { useShop } from '../../../context/ShopContext';

const CategoriesPage = () => {
    const { fetchCategories: refreshGlobalCategories } = useShop();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({ 
        name: '', 
        image: '', // URL
        status: 'Active', 
        showInNavbar: false, 
        showInShopByCategory: false 
    });
    
    // File inputs
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/categories');
            const data = await res.json();
            if (res.ok) {
                setCategories(data);
            } else {
                toast.error('Failed to load categories');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Image upload failed');
        return data.url;
    };

    const handleSubmit = async (e, isEdit = false) => {
        e.preventDefault();
        setSubmitLoading(true);
        const toastId = toast.loading(isEdit ? 'Updating...' : 'Creating...');

        try {
            let imageUrl = isEdit ? editingCategory.image : newItem.image;
            
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const itemData = isEdit ? { ...editingCategory, image: imageUrl } : { ...newItem, image: imageUrl };
            // Ensure no parent for top-level categories
            itemData.parent = null;

            const url = isEdit 
                ? `http://localhost:5000/api/categories/${editingCategory.id}` 
                : 'http://localhost:5000/api/categories';
            
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(isEdit ? 'Category updated' : 'Category created', { id: toastId });
                fetchCategories();
                refreshGlobalCategories(); // Refresh global context
                setShowAddModal(false);
                setEditingCategory(null);
                setNewItem({ name: '', image: '', status: 'Active', showInNavbar: false, showInShopByCategory: false });
                setImageFile(null);
                setPreview(null);
            } else {
                toast.error(data.message || 'Operation failed', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error occurred', { id: toastId });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? Sub-categories might rely on this.')) return;
        const toastId = toast.loading('Deleting...');
        
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Category deleted', { id: toastId });
                setCategories(categories.filter(c => c.id !== id)); // Optimistic update
                fetchCategories();
                refreshGlobalCategories(); // Refresh global context
            } else {
                toast.error('Failed to delete', { id: toastId });
            }
        } catch (error) {
            toast.error('Network error', { id: toastId });
        }
    };

    const toggleStatus = async (category) => {
        const newStatus = category.status === 'Active' ? 'Hidden' : 'Active';
        try {
            const res = await fetch(`http://localhost:5000/api/categories/${category.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if(res.ok) {
                toast.success(`Status changed to ${newStatus}`);
                fetchCategories();
                refreshGlobalCategories();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // --- Derived State ---
    const filteredCategories = useMemo(() => {
        return categories
            .filter(cat => {
                const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'All' || cat.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [categories, searchTerm, statusFilter]);

    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCategories, currentPage]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    return (
        <div className="space-y-8 font-['Inter']">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Category Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">High-level Product Organization</p>
                </div>
                <button
                    onClick={() => {
                        setNewItem({ name: '', image: '', status: 'Active', showInNavbar: false, showInShopByCategory: false });
                        setPreview(null);
                        setImageFile(null);
                        setShowAddModal(true);
                    }}
                    className="bg-[#2c5336] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#1f3b26] transition-all shadow-lg shadow-[#2c5336]/20"
                >
                    <Plus size={18} strokeWidth={3} /> Add Category
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-[#2c5336] transition-all"
                    />
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {['All', 'Active', 'Hidden'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-[#2c5336] shadow-sm' : 'text-gray-400 hover:text-footerBg'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-gray-300" /></div> : 
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Visibility</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedCategories.map((category) => (
                                <tr key={category.id} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                                                {category.image ? <img src={category.image} alt="" className="w-full h-full object-cover rounded-lg" /> : <ImageIcon size={20} className="text-gray-300" />}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-footerBg uppercase tracking-tight text-sm">{category.name}</h3>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[150px] mx-auto">
                                            {category.showInNavbar && <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase border border-blue-100">Navbar</span>}
                                            {category.showInShopByCategory && <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full uppercase border border-purple-100">Home Tiles</span>}
                                            {!category.showInNavbar && !category.showInShopByCategory && <span className="text-[9px] font-bold text-gray-300 italic uppercase">Private</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(category)}
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
                                                onClick={() => {
                                                    setEditingCategory(category);
                                                    setPreview(category.image);
                                                    setImageFile(null);
                                                }}
                                                className="p-2 text-gray-400 hover:text-[#2c5336] hover:bg-white rounded-lg transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
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
                }
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredCategories.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>

            {/* Modal */}
            {(showAddModal || editingCategory) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-footerBg/60 backdrop-blur-sm" 
                         onClick={() => { setShowAddModal(false); setEditingCategory(null); }} />
                    <div className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-black text-footerBg uppercase tracking-tight">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button onClick={() => { setShowAddModal(false); setEditingCategory(null); }} className="text-gray-400 hover:text-footerBg">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={(e) => handleSubmit(e, !!editingCategory)} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={editingCategory ? editingCategory.name : newItem.name}
                                    onChange={(e) => editingCategory 
                                        ? setEditingCategory({...editingCategory, name: e.target.value}) 
                                        : setNewItem({...newItem, name: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-footerBg outline-none focus:border-[#2c5336] transition-all text-sm"
                                    placeholder="e.g. Exotic Nuts"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Photo</label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full h-24 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#2c5336]/30 transition-all overflow-hidden relative group"
                                >
                                    {preview ? (
                                        <>
                                            <img src={preview} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-footerBg/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload size={18} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={20} className="text-gray-200 mb-1" />
                                            <p className="text-[8px] font-black text-gray-400 uppercase">Click to upload</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:border-[#2c5336]/30">
                                    <input
                                        type="checkbox"
                                        checked={editingCategory ? editingCategory.showInNavbar : newItem.showInNavbar}
                                        onChange={(e) => editingCategory 
                                            ? setEditingCategory({...editingCategory, showInNavbar: e.target.checked})
                                            : setNewItem({...newItem, showInNavbar: e.target.checked})}
                                        className="w-3.5 h-3.5 text-[#2c5336] rounded focus:ring-[#2c5336]"
                                    />
                                    <span className="text-[8px] font-black text-footerBg uppercase">Navbar</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:border-[#2c5336]/30">
                                    <input
                                        type="checkbox"
                                        checked={editingCategory ? editingCategory.showInShopByCategory : newItem.showInShopByCategory}
                                        onChange={(e) => editingCategory 
                                            ? setEditingCategory({...editingCategory, showInShopByCategory: e.target.checked})
                                            : setNewItem({...newItem, showInShopByCategory: e.target.checked})}
                                        className="w-3.5 h-3.5 text-[#2c5336] rounded focus:ring-[#2c5336]"
                                    />
                                    <span className="text-[8px] font-black text-footerBg uppercase">Tiles</span>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitLoading}
                                className="w-full bg-[#2c5336] disabled:opacity-70 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#2c5336]/20 hover:bg-[#1f3b26] transition-all flex justify-center gap-2 items-center"
                            >
                                {submitLoading && <Loader size={14} className="animate-spin" />}
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
