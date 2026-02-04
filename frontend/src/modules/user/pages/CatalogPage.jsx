
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
    ChevronRight,
    Filter,
    Star,
    Search,
    ArrowLeft,
    ChevronDown,
    Sparkles,
    LayoutGrid,
    List,
    X,
    Check
} from 'lucide-react';
import { useProducts, useCategories, useSubCategories } from '../../../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const CatalogPage = () => {
    const navigate = useNavigate();
    const { category, subCategory } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    // React Query Hooks
    const { data: products = [] } = useProducts();
    const { data: categories = [] } = useCategories();
    const { data: subCategories = [] } = useSubCategories();

    // States for Filters
    const [openFilters, setOpenFilters] = useState([]); // Start closed to prevent mobile clutter
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedAvailability, setSelectedAvailability] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedWeights, setSelectedWeights] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredFilterCategory, setHoveredFilterCategory] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [isDesktopSortOpen, setIsDesktopSortOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setOpenFilters(prev => prev.length === 6 ? prev : ['Price', 'Availability', 'Brand', 'Discount', 'Shop By Category', 'Shop By Weight']);
            } else {
                setOpenFilters([]);
            }
        };

        handleResize(); // Run on mount

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sortOptions = [
        { value: 'featured', label: 'Featured' },
        { value: 'best-selling', label: 'Best Selling' },
        { value: 'alphabetical-az', label: 'Alphabetically: A-Z' },
        { value: 'alphabetical-za', label: 'Alphabetically: Z-A' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Date: New to Old' },
    ];

    const toggleFilterAccordion = (filterName) => {
        setOpenFilters(prev =>
            prev.includes(filterName)
                ? prev.filter(f => f !== filterName)
                : [...prev, filterName]
        );
    };

    // Derived Categories Data
    const categoriesData = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        const parents = categories.filter(c => c.status === 'Active');
        return parents.map(p => ({
            id: p.slug,
            _id: p._id,
            name: p.name,
            subcategories: subCategories
                .filter(s => (s.parent === p._id || s.parent?._id === p._id || s.parent === p.id) && s.status === 'Active')
                .map(s => s.name)
        }));
    }, [categories, subCategories]);

    // Unique values for filters
    const filterOptions = useMemo(() => {
        const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        const weights = [...new Set(products.flatMap(p => {
            if (p.variants) return p.variants.map(v => v.weight);
            return [p.weight];
        }).filter(Boolean))];
        return { brands, weights };
    }, [products]);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');

    useEffect(() => {
        const searchVal = searchParams.get('search');
        if (searchVal) setSearchQuery(searchVal);

        if (subCategory) {
            const mainCat = categoriesData.find(c => c.id === category);
            if (mainCat) {
                setSelectedCategory(mainCat.id);
                const sub = mainCat.subcategories.find(s => s.toLowerCase().replace(/ /g, '-') === subCategory);
                setSelectedSubcategory(sub || 'all');
            }
        } else if (category) {
            const mainCat = categoriesData.find(c => c.id === category || c.name.toLowerCase().replace(/ /g, '-') === category);
            if (mainCat) {
                setSelectedCategory(mainCat.id);
                setSelectedSubcategory('all');
            } else {
                for (const cat of categoriesData) {
                    const sub = cat.subcategories.find(s => s.toLowerCase().replace(/ /g, '-') === category);
                    if (sub) {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory(sub);
                        break;
                    }
                }
            }
        } else {
            setSelectedCategory('all');
            setSelectedSubcategory('all');
        }
    }, [category, subCategory, searchParams, categoriesData]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.brand && p.brand.toLowerCase().includes(q))
            );
        }

        // Category/Subcategory Filter
        if (selectedCategory !== 'all') {
            result = result.filter(p => {
                const productCatId = p.category?.toLowerCase().replace(/ /g, '-');
                return productCatId === selectedCategory;
            });
        }
        if (selectedSubcategory !== 'all') {
            result = result.filter(p => p.subcategory === selectedSubcategory);
        }

        // Price Filter
        if (priceRange.min) result = result.filter(p => p.price >= Number(priceRange.min));
        if (priceRange.max) result = result.filter(p => p.price <= Number(priceRange.max));

        // Availability Filter
        if (selectedAvailability.length > 0) {
            result = result.filter(p => selectedAvailability.includes(p.stock > 0 ? 'In Stock' : 'Out of Stock'));
        }

        // Brand Filter
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brand));
        }

        // Weight Filter
        if (selectedWeights.length > 0) {
            result = result.filter(p => {
                const pWeights = p.variants ? p.variants.map(v => v.weight) : [p.weight];
                return pWeights.some(w => selectedWeights.includes(w));
            });
        }

        // Sorting
        switch (sortBy) {
            case 'price-low': result.sort((a, b) => a.price - b.price); break;
            case 'price-high': result.sort((a, b) => b.price - a.price); break;
            case 'newest': result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)); break;
            case 'alphabetical-az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'alphabetical-za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
            default: break;
        }

        return result;
    }, [products, searchQuery, selectedCategory, selectedSubcategory, priceRange, selectedAvailability, selectedBrands, selectedWeights, sortBy]);

    const handleCategoryClick = (catId) => {
        if (selectedCategory === catId) {
            navigate('/catalog');
        } else {
            navigate(`/category/${catId}`);
        }
        setIsMobileMenuOpen(false);
    };

    const clearAllFilters = () => {
        setPriceRange({ min: '', max: '' });
        setSelectedAvailability([]);
        setSelectedBrands([]);
        setSelectedWeights([]);
        navigate('/catalog');
    };

    const FilterSection = ({ title, children }) => (
        <div className="border-b border-[#842A35] last:border-b-0">
            <button
                onClick={() => toggleFilterAccordion(title)}
                className="w-full flex items-center justify-between py-4 px-5 bg-white transition-colors text-left"
            >
                <span className="text-[14px] font-bold text-black tracking-tight">{title}</span>
                <ChevronDown size={18} className={`transition-transform duration-300 text-black ${openFilters.includes(title) ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {openFilters.includes(title) && (
                    <motion.div
                        initial={false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white"
                    >
                        <div className="px-5 pb-5 pt-1 space-y-2.5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="bg-white min-h-screen font-['Inter']">

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 md:px-12 py-2 md:py-4 flex items-center gap-2 text-[12px] font-medium text-gray-400">
                <Link to="/" className="hover:text-[#842A35]">Home</Link>
                <ChevronRight size={14} />
                <span className="text-black font-semibold">Shop</span>
            </div>

            {/* Mobile Action Bar - Sticky Top or Inline */}
            <div className="lg:hidden container mx-auto px-4 mb-3 flex gap-2 sticky top-[70px] z-30 bg-white py-2">
                {/* All Filters Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex-1 border border-black rounded-lg py-2 flex items-center justify-center gap-1.5 bg-white"
                >
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">All Filters</span>
                    <Filter size={12} strokeWidth={2.5} />
                </button>

                {/* Sort By Dropdown - Mobile */}
                <div className="flex-1 relative">
                    <button
                        onClick={() => setIsSortMenuOpen(true)}
                        className="w-full border border-black rounded-lg py-2 flex items-center justify-center gap-1.5 bg-white"
                    >
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Sort By</span>
                        <ChevronDown size={12} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-12 flex flex-col lg:flex-row gap-8 pb-12 relative">

                {/* Mobile Sort Menu Drawer */}
                <AnimatePresence>
                    {isSortMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSortMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 z-[80] lg:hidden backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                className="fixed bottom-0 left-0 right-0 bg-white z-[90] lg:hidden rounded-t-[20px] overflow-hidden shadow-2xl"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                    <span className="text-sm font-black text-[#842A35] uppercase tracking-widest">Sort By</span>
                                    <button onClick={() => setIsSortMenuOpen(false)} className="p-1.5 bg-gray-50 rounded-full">
                                        <X size={16} className="text-gray-500" />
                                    </button>
                                </div>
                                <div className="p-4 pb-8 space-y-1.5 max-h-[60vh] overflow-y-auto">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setIsSortMenuOpen(false);
                                            }}
                                            className={`w-full text-left py-2.5 px-3 rounded-xl flex items-center justify-between transition-colors border ${sortBy === option.value
                                                ? 'bg-[#842A35]/5 border-[#842A35] text-[#842A35] font-bold'
                                                : 'border-transparent text-gray-600 hover:bg-gray-50 font-medium'
                                                }`}
                                        >
                                            <span className="text-xs">{option.label}</span>
                                            {sortBy === option.value && <Check size={14} strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Mobile Filter Backdrop */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
                        />
                    )}
                </AnimatePresence>

                {/* SIDEBAR - Mobile Bottom Sheet & Desktop Sidebar */}
                <aside
                    className={`
                        fixed bottom-0 left-0 right-0 z-[100] w-full bg-white h-[85vh] overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out rounded-t-[24px]
                        lg:static lg:w-72 lg:shrink-0 lg:shadow-none lg:translate-x-0 lg:translate-y-0 lg:z-auto lg:h-auto lg:overflow-visible lg:bg-transparent lg:rounded-none
                        ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}
                    `}
                >
                    {/* Mobile Drawer Header */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <span className="text-sm font-black text-[#842A35] uppercase tracking-widest">Filters</span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1.5 bg-gray-50 rounded-full hover:bg-gray-100"
                        >
                            <X size={16} className="text-black" />
                        </button>
                    </div>

                    <div className="lg:border lg:border-[#842A35] lg:rounded-sm lg:overflow-hidden lg:sticky lg:top-24 pb-24 lg:pb-0">
                        <FilterSection title="Price">
                            <div className="flex items-center gap-2 mt-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                                    <input
                                        type="number"
                                        placeholder="From"
                                        className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded text-xs outline-none focus:border-[#842A35] transition-colors font-medium"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                                    <input
                                        type="number"
                                        placeholder="To"
                                        className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded text-xs outline-none focus:border-[#842A35] transition-colors font-medium"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    />
                                </div>
                            </div>
                        </FilterSection>

                        <FilterSection title="Availability">
                            {['In Stock', 'Out of Stock'].map(status => (
                                <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedAvailability.includes(status)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedAvailability([...selectedAvailability, status]);
                                            else setSelectedAvailability(selectedAvailability.filter(s => s !== status));
                                        }}
                                        className="w-4 h-4 accent-[#842A35] border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">{status}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="Brand">
                            {filterOptions.brands.length > 0 ? filterOptions.brands.map(brand => (
                                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedBrands([...selectedBrands, brand]);
                                            else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                        }}
                                        className="w-4 h-4 accent-[#842A35] border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">{brand}</span>
                                </label>
                            )) : <p className="text-xs text-gray-400 italic">No brands found</p>}
                        </FilterSection>

                        <FilterSection title="Discount">
                            {['10% and Above', '20% and Above', '30% and Above', '40% and Above'].map(d => (
                                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 accent-[#842A35] border-gray-300 rounded cursor-pointer" />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">{d}</span>
                                </label>
                            ))}
                        </FilterSection>

                        <FilterSection title="Shop By Category">
                            <button
                                onClick={() => navigate('/catalog')}
                                className={`w-full text-left py-1 text-sm transition-all ${selectedCategory === 'all' ? 'text-[#842A35] font-bold' : 'text-gray-600 hover:text-black font-medium'}`}
                            >
                                All Products
                            </button>
                            {categoriesData.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="space-y-1"
                                    onMouseEnter={() => setHoveredFilterCategory(cat.id)}
                                    onMouseLeave={() => setHoveredFilterCategory(null)}
                                >
                                    <button
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`w-full text-left py-1 text-sm transition-all ${selectedCategory === cat.id ? 'text-[#842A35] font-bold' : 'text-gray-600 hover:text-black font-medium'}`}
                                    >
                                        {cat.name}
                                    </button>
                                    <AnimatePresence>
                                        {hoveredFilterCategory === cat.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pl-4 space-y-1.5 py-1 border-l border-gray-100"
                                            >
                                                {cat.subcategories.map(sub => (
                                                    <button
                                                        key={sub}
                                                        onClick={() => {
                                                            navigate(`/category/${sub.toLowerCase().replace(/ /g, '-')}`);
                                                            // Keep mobile menu open or close it? Usually close it after selection.
                                                            // setIsMobileMenuOpen(false); // Let user close it manually if they want multiple filters? 
                                                            // Wait, categories usually navigate. Let's close it.
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left py-0.5 text-xs transition-all ${selectedSubcategory === sub ? 'text-[#842A35] font-bold' : 'text-gray-400 hover:text-black font-medium'}`}
                                                    >
                                                        {sub}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </FilterSection>

                        <FilterSection title="Shop By Weight">
                            {filterOptions.weights.length > 0 ? filterOptions.weights.map(weight => (
                                <label key={weight} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedWeights.includes(weight)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedWeights([...selectedWeights, weight]);
                                            else setSelectedWeights(selectedWeights.filter(w => w !== weight));
                                        }}
                                        className="w-4 h-4 accent-[#842A35] border-gray-300 rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-black transition-colors">{weight}</span>
                                </label>
                            )) : <p className="text-xs text-gray-400 italic">No weight options</p>}
                        </FilterSection>
                    </div>

                    <button
                        onClick={clearAllFilters}
                        className="w-full mt-4 text-[11px] font-black text-[#842A35] uppercase tracking-widest hover:underline text-left px-2"
                    >
                        Clear all filters
                    </button>
                </aside>

                {/* MAIN GRID */}
                <main className="flex-1">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 md:mb-8 md:pb-4 border-b border-gray-100 gap-2 md:gap-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl md:text-2xl font-black text-black">
                                {category ? category.replace(/-/g, ' ').toUpperCase() : 'ALL PRODUCTS'}
                            </h1>
                            <span className="text-xs text-gray-400 font-bold bg-gray-50 px-3 py-1 rounded-full">
                                {filteredProducts.length} ITEMS
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {/* Sort By Dropdown - Desktop Custom UI */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDesktopSortOpen(!isDesktopSortOpen)}
                                    className="flex items-center gap-2.5 px-4 py-1.5 md:px-6 md:py-2 border border-black rounded-xl bg-white transition-all hover:bg-gray-50"
                                >
                                    <span className="text-xs md:text-[13px] font-bold text-black font-['Poppins']">
                                        Sort By
                                    </span>
                                    <ChevronDown size={14} className={`text-black transition-transform ${isDesktopSortOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Desktop Sort Menu */}
                                <AnimatePresence>
                                    {isDesktopSortOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10 cursor-default"
                                                onClick={() => setIsDesktopSortOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden"
                                            >
                                                <div className="py-1">
                                                    {sortOptions.map(option => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => {
                                                                setSortBy(option.value);
                                                                setIsDesktopSortOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${sortBy === option.value ? 'font-bold text-[#842A35] bg-[#842A35]/5' : 'text-gray-600'
                                                                }`}
                                                        >
                                                            {option.label}
                                                            {sortBy === option.value && <Check size={16} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 gap-4 md:gap-x-6 md:gap-y-10">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-32 bg-[#fafafa] rounded-3xl border-2 border-dashed border-gray-100 mt-4">
                            <div className="mb-6 flex justify-center text-gray-200">
                                <Search size={80} strokeWidth={0.5} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tight">No Matches Found</h3>
                            <p className="text-[12px] text-gray-400 font-bold mt-2 uppercase tracking-wide">
                                We couldn't find any products matching your specific filters.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="mt-8 bg-black text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#842A35] transition-all"
                            >
                                Start Over / Clear Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CatalogPage;
