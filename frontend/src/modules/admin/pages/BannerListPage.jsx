import React, { useState } from 'react';
import { useShop } from '../../../context/ShopContext';
import { Plus, Trash2, Edit2, Image as ImageIcon, X, ExternalLink, Layout, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BannerListPage = () => {
    const { banners, addBanner, deleteBanner, updateBanner, getBannersBySection } = useShop();
    const [activeSection, setActiveSection] = useState('hero'); // 'hero' or 'promo'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        badgeText: '',
        ctaText: '',
        link: ''
    });

    const activeBanners = getBannersBySection(activeSection);

    const handleOpenModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title || '',
                subtitle: banner.subtitle || '',
                image: banner.image || '',
                badgeText: banner.badgeText || '',
                ctaText: banner.ctaText || '',
                link: banner.link || ''
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                subtitle: '',
                image: '',
                badgeText: '',
                ctaText: '',
                link: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const bannerData = {
            ...formData,
            section: activeSection
        };

        if (editingBanner) {
            updateBanner(editingBanner.id, bannerData);
        } else {
            addBanner(bannerData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this slide?')) {
            deleteBanner(id);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Banner Management</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage your homepage sliders and promotional banners</p>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex p-1 bg-white border border-gray-200 rounded-xl w-fit">
                <button
                    onClick={() => setActiveSection('hero')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${activeSection === 'hero'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <Monitor size={16} />
                    Hero Slider (Top)
                </button>
                <button
                    onClick={() => setActiveSection('promo')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${activeSection === 'promo'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <Layout size={16} />
                    Promo Slider (Bottom)
                </button>
            </div>

            {/* Banner List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Card */}
                <button
                    onClick={() => handleOpenModal()}
                    className="group relative flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-300 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary"
                >
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <span className="font-bold">Add New Slide</span>
                </button>

                {/* Banner Cards */}
                {activeBanners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden flex flex-col group">
                        {/* Image Preview */}
                        <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(banner)}
                                    className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white hover:text-primary transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="p-2 bg-red-500/20 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {banner.badgeText && (
                                <span className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">
                                    {banner.badgeText}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-black text-gray-800 text-lg mb-2 line-clamp-1">{banner.title}</h3>
                            <p className="text-gray-500 text-xs font-medium line-clamp-2 mb-4 flex-1">
                                {banner.subtitle}
                            </p>

                            <div className="pt-4 border-t border-gray-50 mt-auto flex items-center justify-between">
                                <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                    {banner.ctaText}
                                </span>
                                {banner.link && (
                                    <span className="flex items-center gap-1 text-[10px] uppercase font-black text-gray-400 tracking-wider">
                                        Link <ExternalLink size={10} />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 pb-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-black text-gray-900">
                                        {editingBanner ? 'Edit Slide' : 'Add New Slide'}
                                    </h2>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-3">
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Banner Image</label>

                                        {/* Image Preview Area - Fixed Height */}
                                        <div className="w-full h-36 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex flex-col items-center justify-center text-gray-400 relative group transition-colors hover:border-primary/30">
                                            {formData.image ? (
                                                <>
                                                    <img
                                                        src={formData.image}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, image: '' })}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 p-2">
                                                    <ImageIcon size={20} />
                                                    <span className="text-xs font-medium">Click to upload or enter URL below</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData({ ...formData, image: reader.result });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* URL Fallback Input */}
                                        <div className="relative">
                                            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="url"
                                                value={formData.image.startsWith('data:') ? '' : formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                placeholder="Or paste image URL here..."
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Badge Text</label>
                                            <input
                                                type="text"
                                                value={formData.badgeText}
                                                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                                                placeholder="e.g. New Arrival"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">CTA Text</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.ctaText}
                                                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                                placeholder="e.g. Shop Now"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Summer Sale"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Subtitle</label>
                                        <textarea
                                            rows="2"
                                            required
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                            placeholder="e.g. Get 50% off on all items"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Link URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.link}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            placeholder="e.g. /catalog"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primaryHover text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-primary/30 active:scale-95"
                                >
                                    {editingBanner ? 'Update Slide' : 'Add Slide'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BannerListPage;
