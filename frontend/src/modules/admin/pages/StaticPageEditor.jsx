import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, Globe, Eye, ImageIcon, Type, Upload } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import toast from 'react-hot-toast';
import { useWebsiteContent, useUpdateWebsiteContent } from '../../../hooks/useContent';
import { useUploadImage } from '../../../hooks/useProducts';

// Register Quill Modules only if not already registered
if (!Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize);
}

// Static configuration for reference
export const PAGES_CONFIG = {
    // Legal & Policy
    'privacy-policy': { title: 'Privacy Policy', category: 'Legal' },
    'terms-conditions': { title: 'Terms & Conditions', category: 'Legal' },
    'refund-policy': { title: 'Refund & Return Policy', category: 'Legal' },
    'shipping-policy': { title: 'Shipping Policy', category: 'Legal' },
    'cancellation-policy': { title: 'Cancellation Policy', category: 'Legal' },
    'disclaimer': { title: 'Disclaimer', category: 'Legal' },
    'cookie-policy': { title: 'Cookie Policy', category: 'Legal' },

    // Informational
    'about-us': { title: 'About Us', category: 'Info' },
    'contact-us': { title: 'Contact Us', category: 'Info' },
    'how-to-order': { title: 'How to Order', category: 'Info' },
    'size-guide': { title: 'Size Guide', category: 'Info' },
    'payment-methods': { title: 'Payment Methods', category: 'Info' }
};

const StaticPageEditor = () => {
    const { pageId } = useParams();
    const navigate = useNavigate();
    const pageConfig = PAGES_CONFIG[pageId];

    const { data: pageData, isLoading: loading } = useWebsiteContent(pageId);
    const updateMutation = useUpdateWebsiteContent(pageId);
    const uploadMutation = useUploadImage();
    
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    
    // Structured data state for about-us
    const [structuredData, setStructuredData] = useState(null);

    useEffect(() => {
        if (!pageConfig && !loading) {
            toast.error('Invalid Page ID');
            navigate('/admin/dashboard');
            return;
        }
        
        if (pageData) {
            if (pageId === 'about-us' && pageData.content && typeof pageData.content === 'object') {
                setStructuredData(pageData.content);
                setTitle(pageData.title || pageConfig?.title || '');
            } else {
                setContent(pageData.content || '');
                setTitle(pageData.title || pageConfig?.title || '');
            }
        } else if (pageConfig) {
            setTitle(pageConfig.title);
        }
    }, [pageId, navigate, pageConfig, pageData, loading]);

    const handleSave = async () => {
        console.log('StaticPageEditor: Starting handleSave', { pageId, title, content, structuredData });
        try {
            const dataToSave = {
                title: title,
                content: pageId === 'about-us' ? structuredData : content,
                slug: pageId
            };
            console.log('StaticPageEditor: Sending data to mutation', dataToSave);
            
            await updateMutation.mutateAsync(dataToSave);
            console.log('StaticPageEditor: Save successful');
        } catch (error) {
            console.error('StaticPageEditor: Save failed', error);
        }
    };

    const handleStructuredChange = (field, value) => {
        setStructuredData(prev => ({ ...prev, [field]: value }));
    };

    const handleStatChange = (id, field, value) => {
        const newStats = structuredData.stats.map(stat => {
            const isMatch = stat.id === id || stat._id === id;
            return isMatch ? { ...stat, [field]: value } : stat;
        });
        setStructuredData(prev => ({ ...prev, stats: newStats }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadMutation.mutateAsync(file);
            handleStructuredChange('image', res.url);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to upload image');
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to clear the content?')) {
            setContent('');
        }
    };

    // Quill Modules Configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image', 'clean']
        ],
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize']
        }
    };

    if (loading || !pageConfig) return <div>Loading...</div>;

    return (
        <div className="space-y-6 font-['Inter'] pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)} // Go back
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${pageConfig.category === 'Legal' ? 'bg-red-50 text-red-600 border-red-100' :
                                pageConfig.category === 'Info' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                {pageConfig.category}
                            </span>
                        </div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight mt-1">{pageConfig.title}</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage page content</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <a
                        href={`/${pageId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Eye size={16} />
                        View Page
                    </a>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RotateCcw size={16} />
                        Clear
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-gray-200 ${updateMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
                    >
                        {updateMutation.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Content
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            {pageId === 'about-us' && structuredData ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-8">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Type size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Content Editor</h3>
                                <p className="text-xs text-gray-400">Update text and images</p>
                            </div>
                        </div>

                        {/* Headings */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Section Label</label>
                                    <input
                                        type="text"
                                        value={structuredData.sectionLabel}
                                        onChange={(e) => handleStructuredChange('sectionLabel', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Main Title</label>
                                    <input
                                        type="text"
                                        value={structuredData.title}
                                        onChange={(e) => handleStructuredChange('title', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Highlighted Title</label>
                                    <input
                                        type="text"
                                        value={structuredData.highlightedTitle}
                                        onChange={(e) => handleStructuredChange('highlightedTitle', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-primary focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Image URL / Upload</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <ImageIcon size={16} className="absolute left-4 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={structuredData.image}
                                        onChange={(e) => handleStructuredChange('image', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                                        placeholder="Paste image URL here..."
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="about-image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadMutation.isPending}
                                    />
                                    <label
                                        htmlFor="about-image-upload"
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed transition-all cursor-pointer font-bold text-xs ${
                                            uploadMutation.isPending 
                                            ? 'bg-gray-50 border-gray-200 text-gray-400' 
                                            : 'border-primary/30 text-primary hover:bg-primary/5 hover:border-primary'
                                        }`}
                                    >
                                        {uploadMutation.isPending ? (
                                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        ) : (
                                            <Upload size={16} />
                                        )}
                                        {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Paragraphs */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Paragraph 1</label>
                                <textarea
                                    rows="3"
                                    value={structuredData.description1}
                                    onChange={(e) => handleStructuredChange('description1', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 mb-1.5 block">Paragraph 2</label>
                                <textarea
                                    rows="3"
                                    value={structuredData.description2}
                                    onChange={(e) => handleStructuredChange('description2', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block border-t pt-4">Key Statistics</label>
                            <div className="grid grid-cols-1 gap-4">
                                {structuredData.stats.map((stat, index) => (
                                    <div key={stat.id || stat._id || index} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex-1 space-y-1">
                                            <input
                                                type="text"
                                                value={stat.value}
                                                onChange={(e) => handleStatChange(stat.id || stat._id, 'value', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-black focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="flex-[2] space-y-1">
                                            <input
                                                type="text"
                                                value={stat.label}
                                                onChange={(e) => handleStatChange(stat.id || stat._id, 'label', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 overflow-hidden">
                        <div className="flex items-center justify-between mb-4 border-b pb-2">
                             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Preview</h3>
                             <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-bold">Desktop</span>
                        </div>
                        <div className="p-4 space-y-6">
                            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-primary/20">
                                <img src={structuredData.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-primary font-bold text-[10px] uppercase tracking-widest">{structuredData.sectionLabel}</span>
                                <h2 className="text-xl font-bold text-gray-900">{structuredData.title} <span className="text-primary">{structuredData.highlightedTitle}</span></h2>
                                <p className="text-xs text-gray-500 leading-relaxed">{structuredData.description1}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-1">
                    <div className="h-[600px] flex flex-col">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            placeholder={`Start writing content for ${pageConfig.title}...`}
                            className="h-full"
                            modules={modules}
                        />
                    </div>
                </div>
            )}

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 text-xs flex items-center gap-2">
                    <Globe size={14} /> SEO Tip
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                    Make sure to use proper headings (H1, H2) within the content for better visibility on search engines.
                    This content will be directly rendered on the website at <b>/pages/{pageId}</b>.
                </p>
            </div>
        </div>
    );
};

export default StaticPageEditor;
