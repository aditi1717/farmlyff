
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useShop } from '../../../context/ShopContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight,
    Filter,
    Star,
    Search,
    ArrowLeft,
    ChevronDown,
    Sparkles
} from 'lucide-react';
import { PRODUCTS as productsData, PACKS as packsData } from '../../../mockData/data'; // Import grouped products with variants
import ProductCard from '../components/ProductCard';

const categoriesData = [
    {
        id: 'nuts',
        name: 'Nuts',
        subcategories: ['Walnuts (Akhrot)', 'Almonds (Badam)', 'Cashew (Kaju)', 'Pistachio (Pista)', 'Hazelnuts', 'Macadamia Nuts', 'Pecan Nuts']
    },
    {
        id: 'dried-fruits',
        name: 'Dried Fruits',
        subcategories: ['Raisins (Kishmish)', 'Dried Figs (Anjeer)', 'Dried Apricots (Khubani)', 'Dried Kiwi', 'Dried Prunes', 'Wet Dates', 'Dry Dates']
    },
    {
        id: 'seeds-mixes',
        name: 'Seeds & Mixes',
        subcategories: ['Chia Seeds', 'Pumpkin Seeds', 'Flax Seeds', 'Sunflower Seeds', 'Berries Mix', 'Nut Mix', 'Trail Mix']
    },
    {
        id: 'combos-packs',
        name: 'Combos & Packs',
        subcategories: ['Daily Packs', 'Family Packs', 'Party Packs', 'Festival Packs', 'Health & Fitness Packs', 'Wedding Gifting Packs']
    }
];

const CatalogPage = () => {
    const navigate = useNavigate();
    const { category } = useParams();
    const { user } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (category) {
            const mainCat = categoriesData.find(c => c.id === category || c.name.toLowerCase().replace(/ /g, '-') === category);
            if (mainCat) {
                setSelectedCategory(mainCat.id);
                setSelectedSubcategory('all');
                return;
            }

            for (const cat of categoriesData) {
                const sub = cat.subcategories.find(s => s.toLowerCase().replace(/ /g, '-') === category);
                if (sub) {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory(sub);
                    return;
                }
            }
            setSelectedCategory('all');
            setSelectedSubcategory('all');
        } else {
            setSelectedCategory('all');
            setSelectedSubcategory('all');
        }
    }, [category]);

    const filteredProducts = useMemo(() => {
        const allItems = [...productsData, ...packsData];
        return allItems.filter(product => {
            const catIdMap = {
                'Nuts': 'nuts',
                'Dried Fruits': 'dried-fruits',
                'Seeds & Mixes': 'seeds-mixes',
                'Combos & Packs': 'combos-packs'
            };

            const productCatId = catIdMap[product.category] || product.category.toLowerCase();
            const isCatMatch = selectedCategory === 'all' || productCatId === selectedCategory;

            const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchQuery.toLowerCase());
            return isCatMatch && matchesSubcategory && matchesSearch;
        });
    }, [selectedCategory, selectedSubcategory, searchQuery]);

    const handleCategoryClick = (catId) => {
        if (selectedCategory === catId) {
            navigate('/catalog');
        } else {
            navigate(`/category/${catId}`);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="bg-[#fcfcfc] min-h-screen font-['Inter'] flex flex-col lg:flex-row">

            {/* MOBILE ONLY: PREMIUM TICKER & COLLECTIONS BAR */}
            {/* MOBILE ONLY: COLLECTIONS BAR */}
            <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-2 bg-footerBg hover:bg-primary text-white px-4 py-2 rounded-lg text-[11px] font-bold shadow-sm transition-all active:scale-95"
                    >
                        <Filter size={14} />
                        COLLECTIONS
                    </button>
                </div>
            </div>

            {/* BACKDROP for Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden fixed inset-0 bg-footerBg/60 backdrop-blur-sm z-[100]"
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR / DRAWER - Sliding from LEFT as requested */}
            <aside
                className={`fixed lg:sticky inset-y-0 left-0 lg:top-0 lg:h-screen w-[280px] lg:w-72 bg-[#e0f0e9] border-r border-gray-200 flex flex-col justify-between z-[101] lg:z-30 transition-transform duration-500 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div>
                    {/* Drawer Header */}
                    <div className="lg:hidden flex items-center justify-between p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Discover More</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-footerBg" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth space-y-2 pr-0 pt-4 pb-2">
                        <div className="flex items-center justify-between mb-2 px-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-footerBg font-['Poppins']">Main Menu</h3>
                            <Filter size={14} className="text-footerBg/30" />
                        </div>

                        <nav className="space-y-0">
                            <button
                                onClick={() => {
                                    navigate('/catalog');
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full text-left px-6 py-3.5 text-[13px] font-bold transition-all ${selectedCategory === 'all' ? 'text-primary bg-white border-l-4 border-primary shadow-sm' : 'text-footerBg/70 hover:bg-white/50 border-l-4 border-transparent'}`}
                            >
                                All Products
                            </button>
                            {categoriesData.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="space-y-0 group/cat"
                                    onMouseEnter={() => setHoveredCategory(cat.id)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                >
                                    <button
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`w-full flex items-center justify-between px-6 py-3.5 text-[13px] font-bold transition-all border-l-4 ${selectedCategory === cat.id ? 'text-primary border-primary bg-white/30' : 'text-footerBg/70 border-transparent hover:text-footerBg hover:bg-white/30'}`}
                                    >
                                        {cat.name}
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${selectedCategory === cat.id || hoveredCategory === cat.id ? 'rotate-180 text-primary' : 'text-footerBg/30 opacity-0 group-hover/cat:opacity-100'}`} />
                                    </button>

                                    <AnimatePresence>
                                        {(selectedCategory === cat.id || hoveredCategory === cat.id) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden bg-white/40"
                                            >
                                                {cat.subcategories.map(sub => (
                                                    <button
                                                        key={sub}
                                                        onClick={() => {
                                                            navigate(`/category/${sub.toLowerCase().replace(/ /g, '-')}`);
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left pl-10 pr-4 py-3 text-[11px] font-bold transition-all ${selectedSubcategory === sub ? 'text-primary bg-white shadow-sm' : 'text-footerBg/50 hover:text-primary hover:bg-white/40'}`}
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Quick Find */}
                <div className="pt-4 mt-auto border-t border-gray-200/50 bg-[#e0f0e9] p-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={14} />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="w-full bg-white border border-primary/20 shadow-sm rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold text-footerBg placeholder-footerBg/40 focus:ring-2 focus:ring-primary/20 transition-all font-['Poppins']"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </aside>

            {/* PRODUCT LIST */}
            <main className="flex-1 py-4 md:py-10 px-3 md:px-12">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-3 md:gap-8">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-40">
                        <h3 className="text-2xl font-bold text-gray-300">No products found...</h3>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CatalogPage;
