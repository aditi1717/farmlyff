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
        title: 'Slide', // Default title to satisfy backend if required
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
                    setPreview(res.url);
                }
            } catch (error) {
                toast.error('Upload failed');
                setPreview(formData.image || null);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: 'Slide',
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
            title: banner.title || 'Slide',
            subtitle: banner.subtitle || '',
            badgeText: banner.badgeText || '',
            link: banner.link || '/',
            section: banner.section || 'hero',
            image: banner.image || '',
            publicId: banner.publicId || '',
            isActive: banner.isActive !== false
        });
        setPreview(banner.image);
        setIsEditing(true);
        setEditId(banner._id || banner.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) {
            toast.error('Please upload an image for the slide');
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
        } catch (error) { }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this slide?')) return;
        deleteBannerMutation.mutate(id);
    };

    return (
        <div className="p-4 md:p-6 max-w-[1250px] mx-auto min-h-screen bg-transparent">
            <Toaster position="top-right" />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Compact Form */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="bg-white p-6 md:p-7 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {isEditing ? 'Edit Slide' : 'New Banner Slide'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 font-medium">Add high-impact visuals to home</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Image Upload Area */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-800 ml-0.5">Banner Image</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl h-44 flex items-center justify-center relative group overflow-hidden hover:bg-gray-50 hover:border-primary/40 transition-all cursor-pointer">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {preview ? (
                                        <div className="w-full h-full p-2">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                                            {uploadImageMutation.isPending && (
                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                                                    <Loader size={24} className="animate-spin text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:scale-105 transition-all">
                                                <ImageIcon size={22} className="text-gray-400 group-hover:text-primary" />
                                            </div>
                                            <span className="text-xs font-semibold">Click to upload</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 text-center font-medium italic">Aspect Ratio: 21:9 Recommended</p>
                            </div>

                            {/* Redirect Link */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-800 ml-0.5">Redirect Link</label>
                                <div className="relative group">
                                    <ExternalLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                                        placeholder="e.g. /category/electronics"
                                    />
                                </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-gray-900">Live Status</p>
                                    <p className="text-[10px] text-gray-500 font-medium">Visible on Homepage</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3.5 rounded-xl transition-all"
                                    >
                                        Discard
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={addBannerMutation.isPending || updateBannerMutation.isPending || uploadImageMutation.isPending}
                                    className="flex-[2] bg-primary hover:bg-primaryDeep disabled:opacity-70 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {(addBannerMutation.isPending || updateBannerMutation.isPending) ? <Loader size={16} className="animate-spin" /> : (isEditing ? 'Save Slide' : 'Publish Slide')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right: Compact List */}
                <div className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Main Carousel</h2>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">Manage your banner sequence</p>
                        </div>
                        <div className="px-3 py-1 bg-gray-100/80 rounded-full text-[10px] font-bold text-gray-600 tracking-wider border border-gray-200/50">
                            {banners.length} SLIDES
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-gray-100">
                            <Loader className="animate-spin mb-4 text-primary" />
                            <p className="text-sm font-medium text-gray-400 font-['Inter']">Fetching slides...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {banners.map((banner, index) => (
                                <div key={banner._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-5 items-center group hover:shadow-md hover:border-gray-200 transition-all duration-200">
                                    {/* Preview Container */}
                                    <div className="w-full sm:w-44 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-50 relative border border-gray-100">
                                        <img src={banner.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                                            Slide #{index + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${banner.isActive !== false ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                                                } tracking-tight`}>
                                                {banner.isActive !== false ? 'ACTIVE' : 'HIDDEN'}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-400">Hero Section</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Link</p>
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 w-fit border border-gray-100">
                                                <ExternalLink size={12} className="text-primary" />
                                                <span className="text-xs font-semibold text-gray-700 truncate">{banner.link || '/'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pr-1">
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all bg-gray-50 border border-gray-100"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner._id)}
                                            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all bg-gray-50 border border-gray-100"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {banners.length === 0 && (
                                <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-100">
                                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-200 border border-gray-50">
                                        <ImageIcon size={28} />
                                    </div>
                                    <h3 className="text-gray-900 font-bold">Empty Carousel</h3>
                                    <p className="text-gray-400 text-xs mt-1 font-medium">Publish a slide to start your home impact.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BannerListPage;
