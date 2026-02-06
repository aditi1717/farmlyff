import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, Globe, Eye } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import toast from 'react-hot-toast';

// Register Quill Modules
// Register Quill Modules only if not already registered
if (!Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize);
}

// Configuration for all static pages
export const PAGES_CONFIG = {
    // Legal & Policy
    'privacy-policy': { title: 'Privacy Policy', category: 'Legal', type: 'policy' },
    'terms-conditions': { title: 'Terms & Conditions', category: 'Legal', type: 'policy' },
    'refund-policy': { title: 'Refund & Return Policy', category: 'Legal', type: 'policy' },
    'shipping-policy': { title: 'Shipping Policy', category: 'Legal', type: 'policy' },
    'cancellation-policy': { title: 'Cancellation Policy', category: 'Legal', type: 'policy' },
    'disclaimer': { title: 'Disclaimer', category: 'Legal', type: 'policy' },

    // Informational
    'about-us': { title: 'About Us', category: 'Info', type: 'about' },
    'contact-us': { title: 'Contact Us', category: 'Info', type: 'contact' }, // Note: Contact usually has a form, but this can be for extra text
    'how-to-order': { title: 'How to Order', category: 'Info', type: 'guide' },
    'size-guide': { title: 'Size Guide', category: 'Info', type: 'guide' },
    'payment-methods': { title: 'Payment Methods', category: 'Info', type: 'guide' }
};

const STORAGE_KEY = 'farmlyf_static_pages';

const StaticPageEditor = () => {
    const { pageId } = useParams();
    const navigate = useNavigate();
    const pageConfig = PAGES_CONFIG[pageId];

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pageConfig) {
            toast.error('Invalid Page ID');
            navigate('/admin/dashboard');
            return;
        }

        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        setContent(savedData[pageId] || '');
        setLoading(false);
    }, [pageId, navigate, pageConfig]);

    const handleSave = () => {
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        savedData[pageId] = content;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
        toast.success(`${pageConfig.title} updated successfully!`);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to clear the content?')) {
            setContent('');
            toast.success('Content cleared');
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
                        className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <Save size={16} />
                        Save Content
                    </button>
                </div>
            </div>

            {/* Editor Area */}
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
