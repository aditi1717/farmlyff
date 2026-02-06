import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Search,
    GripVertical
} from 'lucide-react';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';
import toast from 'react-hot-toast';

// Mock storage key
const STORAGE_KEY = 'farmlyf_homepage_sections';

const HomepageSectionPage = () => {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get section title based on ID
    const getSectionTitle = () => {
        switch (sectionId) {
            case 'top-selling': return 'Top Selling Products';
            case 'new-arrivals': return 'New Arrivals';
            default: return 'Section Details';
        }
    };

    // Load products from local storage on mount
    useEffect(() => {
        const loadSectionProducts = () => {
            const allSections = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const sectionProducts = allSections[sectionId] || [];
            setProducts(sectionProducts);
            setLoading(false);
        };
        loadSectionProducts();
    }, [sectionId]);

    const handleRemoveProduct = (productId) => {
        const updatedProducts = products.filter(p => p.id !== productId);
        setProducts(updatedProducts);

        // Update Local Storage
        const allSections = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        allSections[sectionId] = updatedProducts;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSections));

        toast.success('Product removed from section');
    };

    const handleAddProducts = () => {
        navigate('/admin/products', {
            state: {
                selectionMode: true,
                sectionId: sectionId,
                sectionTitle: getSectionTitle(),
                preSelected: products.map(p => p.id)
            }
        });
    };

    return (
        <div className="space-y-6 font-['Inter'] pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#1a1a1a] uppercase tracking-tight">{getSectionTitle()}</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage products displayed in this section</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleAddProducts}
                        className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                        <Plus size={16} />
                        Add Products
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {products.length > 0 ? (
                    <AdminTable>
                        <AdminTableHeader>
                            <AdminTableHead width="50px"></AdminTableHead>
                            <AdminTableHead>Product Name</AdminTableHead>
                            <AdminTableHead>Category</AdminTableHead>
                            <AdminTableHead>Price</AdminTableHead>
                            <AdminTableHead className="text-right">Action</AdminTableHead>
                        </AdminTableHeader>
                        <AdminTableBody>
                            {products.map((product, index) => (
                                <AdminTableRow key={product.id} className="group">
                                    <AdminTableCell>
                                        <div className="text-gray-300 cursor-move group-hover:text-gray-500">
                                            <GripVertical size={16} />
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                                <img src={product.image} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{product.sku || product.id}</p>
                                            </div>
                                        </div>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="text-sm text-gray-600">{product.category}</span>
                                    </AdminTableCell>
                                    <AdminTableCell>
                                        <span className="text-sm font-bold text-gray-900">
                                            {product.price ? `₹${product.price}` : 'N/A'}
                                        </span>
                                    </AdminTableCell>
                                    <AdminTableCell className="text-right">
                                        <button
                                            onClick={() => handleRemoveProduct(product.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </AdminTableCell>
                                </AdminTableRow>
                            ))}
                        </AdminTableBody>
                    </AdminTable>
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                            <Plus size={32} />
                        </div>
                        <p className="font-bold text-gray-900">No products in this section yet</p>
                        <p className="text-xs mt-1">Click "Add Products" to populate this section</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomepageSectionPage;
