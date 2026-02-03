import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

// Import local images from assets
import cashewImg from '../../../assets/cashew.png';
import pistaImg from '../../../assets/pista.png';
import walnutImg from '../../../assets/walnut.png';
import datesImg from '../../../assets/dates.png';
import almondImg from '../../../assets/baadaam.png';
import anjeerImg from '../../../assets/anjeer.png';
import raisinImg from '../../../assets/raisin.png';
import mixImg from '../../../assets/cashew.png'; // Fallback for mix if not specific

const TopSellingProducts = () => {
    const scrollRef = useRef(null);
    // Hardcoded Dummy Data
    const topProducts = [
        {
            id: 'd1',
            name: 'Farmlyf Premium California Almonds (Badam) 500g',
            price: 549,
            mrp: 800,
            discount: '31% off',
            rating: 4.8,
            image: almondImg,
            unitPrice: 1098,
            tag: 'BESTSELLER',
            brand: 'FarmLyf',
            status: 'Active'
        },
        {
            id: 'd2',
            name: 'Farmlyf Jumbo Roasted Royale Cashews (Kaju) 250g',
            price: 399,
            mrp: 550,
            discount: '27% off',
            rating: 4.9,
            image: cashewImg,
            unitPrice: 1596,
            tag: 'TRENDING',
            brand: 'FarmLyf',
            status: 'Active'
        },
        {
            id: 'd3',
            name: 'Farmlyf Premium Walnut Kernels (Akhrot Giri) 250g',
            price: 499,
            mrp: 750,
            discount: '33% off',
            rating: 4.7,
            image: walnutImg,
            unitPrice: 1996,
            tag: 'BESTSELLER',
            brand: 'FarmLyf',
            status: 'Active'
        },
        {
            id: 'd4',
            name: 'Farmlyf Select Raisins (Kishmish) 500g',
            price: 249,
            mrp: 400,
            discount: '37% off',
            rating: 4.5,
            image: raisinImg,
            unitPrice: 498,
            tag: 'POPULAR',
            brand: 'FarmLyf',
            status: 'Active'
        },
        {
            id: 'd5',
            name: 'Farmlyf Dried Figs (Anjeer) 250g',
            price: 449,
            mrp: 650,
            discount: '30% off',
            rating: 4.6,
            image: anjeerImg,
            unitPrice: 1796,
            tag: 'PREMIUM',
            brand: 'FarmLyf',
            status: 'Active'
        },
        {
            id: 'd6',
            name: 'Farmlyf Pistachios (Pista) Roasted & Salted 250g',
            price: 429,
            mrp: 600,
            discount: '28% off',
            rating: 4.8,
            image: pistaImg,
            unitPrice: 1716,
            tag: 'BESTSELLER',
            brand: 'FarmLyf',
            status: 'Active'
        },
        {
            id: 'd7',
            name: 'Farmlyf Mixed Dry Fruits & Nuts 500g',
            price: 599,
            mrp: 900,
            discount: '33% off',
            rating: 4.9,
            image: mixImg,
            unitPrice: 1198,
            tag: 'MUST BUY',
            brand: 'FarmLyf',
            status: 'Active'
        },
        {
            id: 'd8',
            name: 'Farmlyf Medjool Dates (Khajoor) 500g',
            price: 799,
            mrp: 1100,
            discount: '27% off',
            rating: 4.8,
            image: datesImg,
            unitPrice: 1598,
            tag: 'PREMIUM',
            brand: 'FarmLyf',
            status: 'Active'
        }
    ];

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };


    if (topProducts.length === 0) return null;

    return (
        <section className="bg-white py-4 md:py-6 px-4 md:px-12 relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
            <div className="container mx-auto">
                <div className="text-center mb-6 md:mb-10 space-y-2">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-['Poppins'] font-bold text-footerBg tracking-tight"
                    >
                        Top Selling <span className="text-primary">Products</span>
                    </motion.h2>
                    <div className="w-40 md:w-72 h-1.5 bg-primary mx-auto rounded-full mt-2" />
                </div>

                <div className="relative group">
                    {/* Left Navigation Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-footerBg hover:bg-primary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Scroll Container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1 snap-x"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {topProducts.map((product, index) => (
                            <motion.div
                                key={product._id || product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="min-w-[160px] w-[170px] md:min-w-[280px] md:w-[280px] flex-shrink-0 snap-start"
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Navigation Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-footerBg hover:bg-primary hover:text-white transition-all active:scale-90 border border-gray-100 hidden md:flex items-center justify-center"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TopSellingProducts;
