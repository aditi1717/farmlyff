import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Loader, ExternalLink, Type, Info, Layers, Edit2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBanners, useAddBanner, useDeleteBanner, useUpdateBanner } from '../../../hooks/useContent';
import { useUploadImage } from '../../../hooks/useProducts';

const BannerListPage = () => {
    // React Query Hooks
    const { data: banners = [], isLoading: loading } = useBanners();
    const addBannerMutation = useAddBanner();
    const updateBannerMutation = useUpdateBanner();
    const deleteBannerMutation = useDeleteBanner();
    const uploadImageMutation = useUploadImage();
    
    // Form & UI state
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        badgeText: '',
        link: '/',
        section: 'hero',
        image: '',
        publicId: '',
        isActive: true
    });
    const [preview, setPreview] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Internal preview for immediate feedback
            const localPreview = URL.createObjectURL(file);
            setPreview(localPreview);
            
            try {
                const res = await uploadImageMutation.mutateAsync(file);
                if (res?.url) {
                    setFormData(prev => ({ 
                        ...prev, 
                        image: res.url, 
                        publicId: res.publicId || prev.publicId 
                    }));
                    setPreview(res.url); // Sync preview with actual remote URL
                } else {
                    throw new Error('No URL in response');
                }
            } catch (error) {
                toast.error('Image upload failed. Please try again.');
                // Revert preview if upload fails
                setPreview(formData.image || null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            badgeText: '',
            link: '/',
            section: 'hero',
            image: '',
            publicId: '',
            isActive: true
        });
        setPreview(null);
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (banner) => {
        setFormData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            badgeText: banner.badgeText || '',
            link: banner.link || '/',
            section: banner.section || 'hero',
            image: banner.image || '',
            publicId: banner.publicId || '',
            isActive: banner.isActive !== false,
            order: banner.order || 0
        });
        setPreview(banner.image);
        setIsEditing(true);
        setEditId(banner._id || banner.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image || !formData.title) {
            toast.error('Title and Background Image are required');
            return;
        }

        try {
            if (isEditing) {
                await updateBannerMutation.mutateAsync({
                    id: editId,
                    data: formData
                });
            } else {
                await addBannerMutation.mutateAsync({
                    ...formData,
                    order: banners.length + 1
                });
            }
            resetForm();
        } catch (error) {
            // Error handled by mutation
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        deleteBannerMutation.mutate(id);
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto font-['Inter']">
            <Toaster position="top-right" />
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Form */}
                <div className="w-full lg:w-[400px] shrink-0">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-footerBg tracking-tight flex items-center gap-2">
                                {isEditing ? <Edit2 size={24} className="text-primary" /> : <Plus size={24} className="text-primary" />}
                                {isEditing ? 'Edit Storyboard' : 'Create New Slide'}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                {isEditing ? `Modifying existing content` : 'Add visual impact to homepage'}
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Section <span className="text-primary">*</span></label>
                                    <select 
                                        value={formData.section}
                                        onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all cursor-pointer"
                                    >
                                        <option value="hero">Main Hero Slider</option>
                                        <option value="promo">Secondary Promo Slider</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Title <span className="text-primary">*</span></label>
                                    <div className="relative">
                                        <Type size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input 
                                            type="text" 
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-gray-50 border border-transparent rounded-xl pl-11 pr-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                            placeholder="e.g. Premium Kashmiri Saffron"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Badge Text</label>
                                    <input 
                                        type="text" 
                                        value={formData.badgeText}
                                        onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                        placeholder="NEW ARRIVAL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Target Link</label>
                                    <input 
                                        type="text" 
                                        value={formData.link}
                                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                        placeholder="/catalog"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Subtitle</label>
                                    <textarea 
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-xs font-bold outline-none focus:bg-white focus:border-primary transition-all resize-none h-20"
                                        placeholder="Enter a brief description for the slide..."
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            />
                                            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Visible on Homepage</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Background Image <span className="text-primary">*</span></label>
                                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group overflow-hidden mb-3">
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange}
                                        accept="image/*,.avif"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {preview ? (
                                        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl shadow-inner">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            {uploadImageMutation.isPending && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                                    <Loader size={24} className="animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center gap-3 text-gray-300">
                                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                                <ImageIcon size={24} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Select Visual Asset</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Or Paste Image URL</label>
                                    <input 
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            setFormData(prev => ({ ...prev, image: url }));
                                            setPreview(url);
                                        }}
                                        className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                        placeholder="https://cloudinary.com/..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                {isEditing && (
                                    <button 
                                        type="button" 
                                        onClick={resetForm}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={18} />
                                        CANCEL
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={addBannerMutation.isPending || updateBannerMutation.isPending || uploadImageMutation.isPending}
                                    className="flex-[2] bg-footerBg hover:bg-primary disabled:opacity-70 text-white text-xs font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {(addBannerMutation.isPending || updateBannerMutation.isPending) ? <Loader size={16} className="animate-spin" /> : (isEditing ? <Edit2 size={18} /> : <Plus size={18} />)}
                                    {(addBannerMutation.isPending || updateBannerMutation.isPending) ? (isEditing ? 'UPDATING...' : 'CREATING...') : (isEditing ? 'UPDATE SLIDE' : 'PUBLISH SLIDE')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right: List */}
                <div className="flex-1">
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-footerBg tracking-tight">Active Storyboards</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Live content mapping across homepage</p>
                        </div>
                        <div className="flex gap-2">
                             <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20">
                                {banners.length} TOTAL
                             </span>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-gray-100 italic text-gray-400">
                             <Loader className="animate-spin mb-4" />
                             Loading storyboard data...
                        </div>
                    ) : banners.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                            <Layers size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-sm">No Active Content</p>
                            <p className="text-gray-300 text-[10px] mt-2 italic">Fill the form to publish your first storyboard</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {banners.map((banner) => (
                                <div key={banner._id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-center group hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                                    <div className="w-40 h-24 shrink-0 rounded-[1.5rem] overflow-hidden bg-gray-50 shadow-inner relative">
                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                                (banner.section || 'hero') === 'hero' 
                                                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                                : 'bg-orange-50 text-orange-600 border-orange-100'
                                            } uppercase tracking-widest`}>
                                                {(banner.section || 'hero') === 'hero' ? 'MAIN HERO' : 'SECONDARY PROMO'}
                                            </span>
                                            {banner.isActive === false && (
                                                <span className="bg-gray-50 text-gray-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-gray-100 uppercase tracking-widest">
                                                    HIDDEN
                                                </span>
                                            )}
                                            {banner.badgeText && (
                                                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                                                    {banner.badgeText}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-black text-footerBg text-lg leading-tight truncate">{banner.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-medium truncate mt-1">{banner.subtitle || 'No description provided'}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center gap-1.5">
                                                <ExternalLink size={10} className="text-primary" />
                                                <span className="text-[9px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline">{banner.link}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleEdit(banner)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-primary rounded-2xl transition-all shadow-sm bg-gray-50 outline-none"
                                            title="Edit Slide"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(banner._id)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded-2xl transition-all shadow-sm bg-gray-50 outline-none"
                                            title="Delete Slide"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BannerListPage;
