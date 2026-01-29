import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Loader, ExternalLink } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const BannerListPage = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('/');
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/banners');
            const data = await res.json();
            if (res.ok) {
                setBanners(data);
            } else {
                toast.error('Failed to load banners');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error loading banners');
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

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!imageFile || !title) {
            toast.error('Please select an image and enter a title');
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading('Uploading banner...');

        try {
            // 1. Upload Image
            const formData = new FormData();
            formData.append('image', imageFile);

            const uploadRes = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) throw new Error(uploadData.message || 'Image upload failed');

            // 2. Create Banner Record
            const bannerData = {
                title,
                link,
                image: uploadData.url,
                publicId: uploadData.publicId,
                order: banners.length + 1
            };

            const createRes = await fetch('http://localhost:5000/api/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bannerData)
            });
            const createdBanner = await createRes.json();

            if (!createRes.ok) throw new Error(createdBanner.message || 'Failed to create banner');

            toast.success('Slide added successfully!', { id: loadingToast });
            
            // Reset form and refresh list
            setTitle('');
            setLink('/');
            setImageFile(null);
            setPreview(null);
            fetchBanners();

        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Something went wrong', { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;

        const loadingToast = toast.loading('Deleting...');
        try {
            const res = await fetch(`http://localhost:5000/api/banners/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Banner deleted', { id: loadingToast });
                setBanners(banners.filter(b => b._id !== id));
            } else {
                toast.error('Failed to delete', { id: loadingToast });
            }
        } catch (error) {
           toast.error('Network error', { id: loadingToast });
        }
    };

    return (
        <div className="p-6 max-w-[1200px] mx-auto font-['Inter']">
            <Toaster position="top-right" />
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Upload Form */}
                <div className="w-full md:w-1/3">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-[#2c5336]" />
                            Add New Slide
                        </h2>
                        
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Banner Title</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#2c5336] focus:ring-1 focus:ring-[#2c5336] transition-all"
                                    placeholder="e.g. Summer Sale, New Arrivals"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Target Link</label>
                                <div className="relative">
                                    <ExternalLink size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#2c5336] focus:ring-1 focus:ring-[#2c5336] transition-all"
                                        placeholder="/shop or /product/123"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Banner Image</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {preview ? (
                                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="py-6 flex flex-col items-center gap-2 text-gray-400">
                                            <ImageIcon size={32} />
                                            <span className="text-xs font-medium">Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="w-full bg-[#2c5336] hover:bg-[#1f3b26] disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#2c5336]/20 flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader size={16} className="animate-spin" /> : <Plus size={18} />}
                                {uploading ? 'Uploading...' : 'Add Slide'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: List */}
                <div className="w-full md:w-2/3">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Active Slides</h2>
                    
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader className="animate-spin text-gray-400" /></div>
                    ) : banners.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No banners active</p>
                            <p className="text-gray-400 text-sm mt-1">Add your first slide to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {banners.map((banner) => (
                                <div key={banner._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center group hover:shadow-md transition-all">
                                    <div className="w-32 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 truncate">{banner.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                                            <span className="truncate">Link: {banner.link}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleDelete(banner._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Slide"
                                    >
                                        <Trash2 size={18} />
                                    </button>
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
