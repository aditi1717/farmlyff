import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Share2, FileText, Calendar, User } from 'lucide-react';

// Import blog images
import blogWinter from '../../../assets/images/blog_winter.png';
import blogDates from '../../../assets/images/blog_dates.png';
import blogFarm from '../../../assets/images/blog_farm.png';
import logoImg from '../../../assets/logo.png';

const blogPosts = [
    {
        id: 1,
        title: "Dry Fruits Must Have in Winters for Health and Wellness",
        excerpt: "When the air turns cool, the body naturally burns more energy to maintain warmth. According to nutrition research...",
        image: blogWinter,
        author: "FarmLyf",
        date: "Jan 29, 2026",
        category: "Dry Fruits",
        link: "#"
    },
    {
        id: 2,
        title: "Inside the House of Dates: Exploring Nature's Sweetest Varieties",
        excerpt: "From ancient food traditions to today's lifestyle, dates have gained a permanent place in our kitchens...",
        image: blogDates,
        author: "FarmLyf",
        date: "Jan 29, 2026",
        category: "Dates Uses",
        link: "#"
    },
    {
        id: 3,
        title: "How FarmLyf Ensures high quality in every dry fruit Pack",
        excerpt: "When buying dried fruit packs, quality matters just as much as taste. From freshness and appearance to safety...",
        image: blogFarm,
        author: "FarmLyf",
        date: "Jan 14, 2026",
        category: "Quality",
        link: "#"
    },
    {
        id: 4,
        title: "5 Superfoods to Boost Your Immunity Naturally",
        excerpt: "Discover the power of nature's finest superfoods that can help strengthen your immune system and keep you healthy...",
        image: blogWinter, // Reusing for demo
        author: "Admin",
        date: "Jan 10, 2026",
        category: "Health",
        link: "#"
    }
];

const BlogSection = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="bg-white pt-12 pb-2 md:pt-16 md:pb-4 overflow-hidden">
            <div className="container mx-auto px-4 md:px-12">
                {/* Section Header */}
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-3xl md:text-4xl font-['Poppins'] font-bold text-gray-900 mb-3">
                        Our Recent <span className="text-primary">Blogs</span>
                    </h2>
                    <div className="w-24 md:w-32 h-1 bg-primary mx-auto rounded-full" />
                </div>

                {/* Slider Container */}
                <div className="relative group">
                    {/* Left Navigation Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 md:-left-6 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-gray-800 hover:bg-primary hover:text-white transition-all hidden md:flex items-center justify-center border border-gray-100"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex gap-6 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-2"
                    >
                        {blogPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                whileHover={{ y: -5 }}
                                className="flex-shrink-0 w-[300px] md:w-[400px] relative mt-4 mb-4"
                            >
                                {/* Image Container (Background Layer) */}
                                <div className="h-[240px] md:h-[280px] w-full rounded-2xl overflow-hidden relative z-0 shadow-sm">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                    {/* Gradient Overlay to ensure text legibility if we were printing on image, but here it adds depth behind the card */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                                </div>

                                {/* Floating Content Card (Top Layer) */}
                                <div className="bg-white rounded-2xl shadow-xl p-3 md:p-4 mx-4 relative z-10 -mt-28 border border-gray-100">
                                    {/* Meta Header */}
                                    <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm">
                                                <img src={logoImg} alt="FarmLyf" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold">{post.author}</span>
                                                <span className="text-[10px]">{post.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-50 px-2 py-1 rounded text-gray-600 border border-gray-100">
                                                {post.category}
                                            </span>
                                            <Share2 size={14} className="text-gray-400 hover:text-primary cursor-pointer" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                                        {post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    {/* Read More */}
                                    <button className="text-sm font-bold text-gray-900 hover:text-primary flex items-center gap-1 group transition-colors">
                                        Read More
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Navigation Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full text-gray-800 hover:bg-primary hover:text-white transition-all hidden md:flex items-center justify-center border border-gray-100"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BlogSection;
