import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Brain, Zap, Shield, Scale, Sparkles } from 'lucide-react';

const HealthBenefitsSection = ({ data }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Dummy data fallback
    const defaultData = {
        title: "Health Benefits",
        subtitle: "Discover the amazing benefits of premium dry fruits for your health and wellness",
        benefits: [
            {
                icon: <Heart size={64} strokeWidth={1.5} />,
                title: "Heart Health",
                description: "Rich in omega-3 fatty acids and antioxidants that support cardiovascular health.",
                bgColor: "bg-[#006071]",
                borderColor: "border-[#006071]",
                textColor: "text-[#006071]"
            },
            {
                icon: <Brain size={64} strokeWidth={1.5} />,
                title: "Brain Function",
                description: "Enhance cognitive function, memory, and mental clarity with essential nutrients.",
                bgColor: "bg-[#67705B]",
                borderColor: "border-[#67705B]",
                textColor: "text-[#67705B]"
            },
            {
                icon: <Zap size={64} strokeWidth={1.5} />,
                title: "Energy Boost",
                description: "Natural sustained energy from healthy fats and proteins.",
                bgColor: "bg-[#902D45]",
                borderColor: "border-[#902D45]",
                textColor: "text-[#902D45]"
            },
            {
                icon: <Shield size={64} strokeWidth={1.5} />,
                title: "Immunity",
                description: "Strengthen your immune system with vitamin E and antioxidants.",
                bgColor: "bg-[#7E3021]",
                borderColor: "border-[#7E3021]",
                textColor: "text-[#7E3021]"
            },
            {
                icon: <Scale size={64} strokeWidth={1.5} />,
                title: "Weight Balance",
                description: "High protein and fiber content helps maintain healthy weight goals.",
                bgColor: "bg-[#C08552]",
                borderColor: "border-[#C08552]",
                textColor: "text-[#C08552]"
            },
            {
                icon: <Sparkles size={64} strokeWidth={1.5} />,
                title: "Skin & Hair",
                description: "Essential fatty acids promote glowing skin and lustrous hair.",
                bgColor: "bg-[#7D5A5A]",
                borderColor: "border-[#7D5A5A]",
                textColor: "text-[#7D5A5A]"
            }
        ]
    };

    const sectionData = data || defaultData;

    return (
        <section className="bg-white py-4 md:py-6 relative overflow-hidden">
            <div className="w-full px-4 md:px-12">
                {/* Section Header */}
                <div className="text-center mb-10 md:mb-14 space-y-2 md:space-y-3">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-['Poppins'] font-bold text-footerBg leading-tight"
                    >
                        {sectionData.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto"
                    >
                        {sectionData.subtitle}
                    </motion.p>
                </div>

                {/* Static Grid/Flex Container - No Scroll, 5 Items */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-6 pb-4">
                    {sectionData.benefits.slice(0, 5).map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onHoverStart={() => setHoveredIndex(index)}
                            onHoverEnd={() => setHoveredIndex(null)}
                            className="flex-shrink-0 w-full md:flex-1 md:min-w-[240px] cursor-pointer pt-14 md:pt-20"
                        >
                            <div className="relative">
                                {/* White Circle Icon Container - Hides on hover */}
                                <AnimatePresence>
                                    {hoveredIndex !== index && (
                                        <motion.div
                                            initial={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 30 }}
                                            transition={{ duration: 0.4, ease: "easeInOut" }}
                                            className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 z-20"
                                        >
                                            {/* Single clean ring matching bg color */}
                                            <div className={`relative bg-white rounded-full w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shadow-lg border-2 ${benefit.borderColor}`}>
                                                <div className={`${benefit.textColor}`}>
                                                    {benefit.icon}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Card Container */}
                                <div className={`
                                        relative h-52 md:h-64 rounded-[24px] md:rounded-[32px] 
                                        ${benefit.bgColor}
                                        shadow-lg hover:shadow-2xl
                                        transition-all duration-500
                                        overflow-hidden
                                        flex flex-col items-center justify-center
                                        p-4
                                    `}>
                                    {/* Content - Title hidden on hover, only description shows centered */}
                                    <AnimatePresence mode="wait">
                                        {hoveredIndex !== index ? (
                                            <motion.div
                                                key="title"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex items-center justify-center h-full w-full text-center pt-6"
                                            >
                                                <h3 className="text-white font-bold text-lg md:text-xl px-2 leading-tight">
                                                    {benefit.title}
                                                </h3>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="description"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4, delay: 0.2 }}
                                                className="flex items-center justify-center h-full w-full"
                                            >
                                                <p className="text-white text-xs md:text-sm leading-relaxed font-medium px-4 text-center">
                                                    {benefit.description}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HealthBenefitsSection;
