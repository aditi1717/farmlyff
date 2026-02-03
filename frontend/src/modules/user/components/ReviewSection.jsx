import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import reviewBg from '../../../assets/images/review_bg_bright.png';

const ReviewSection = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const reviews = [
        {
            id: 1,
            name: "Shravya Kapoor",
            review: "What an amazing brand, never disappoints me. Simply love their range of dry fruits super affordable and premium.",
            image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg?semt=ais_hybrid"
        },
        {
            id: 2,
            name: "Rahul Sharma",
            review: "The quality of walnuts and almonds is just superior. I've been a regular customer for 6 months now!",
            image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38825.jpg?semt=ais_hybrid"
        },
        {
            id: 3,
            name: "Priya Singh",
            review: "Packaging is top-notch and delivery was super fast. Highly recommended for daily nutrition needs.",
            image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg?semt=ais_hybrid"
        },
        {
            id: 4,
            name: "Amit Patel",
            review: "Best prices in the market for such premium quality. The cranberries are my absolute favorite.",
            image: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38825.jpg?semt=ais_hybrid"
        }
    ];

    return (
        <section className="mt-10 md:mt-20">
            {/* Section Header - Outside Background */}
            <div className="container mx-auto px-4 md:px-12 text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-4xl font-['Poppins'] font-bold mb-3 text-gray-900">Customer Reviews</h2>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto font-medium">
                    See what our happy customers have to say about their healthy journey with us
                </p>
            </div>

            {/* Content Area with Background */}
            <div className="relative py-8 md:py-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={reviewBg}
                        alt="Dry Fruits Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                </div>

                <div className="w-full relative z-10 px-4 md:px-12">
                    {/* Slider Container */}
                    <div className="relative group w-full">
                        {/* Left Navigation Button */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-transparent border-2 border-gray-800/10 text-gray-800 p-2 md:p-3 rounded-full hover:bg-black hover:text-white transition-all active:scale-90 hidden md:flex items-center justify-center"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Reviews Scroll Container */}
                        <div
                            ref={scrollRef}
                            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-4 py-4"
                        >
                            {reviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="flex-shrink-0 w-[85vw] md:w-[calc(50%-12px)]"
                                >
                                    <div className="flex flex-col md:flex-row h-full rounded-2xl overflow-hidden min-h-[280px] md:h-[320px] border border-gray-100">
                                        {/* Left: Avatar Section */}
                                        <div className="w-full md:w-2/5 bg-[#f5f5f5] flex items-center justify-center p-6 relative">
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white">
                                                <img
                                                    src={review.image}
                                                    alt={review.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Content Section */}
                                        <div className="w-full md:w-3/5 bg-black/40 backdrop-blur-md p-5 md:p-6 flex flex-col justify-center relative">
                                            <Quote className="text-white/80 w-8 h-8 md:w-10 md:h-10 mb-4 md:mb-6" />

                                            <p className="text-white text-sm md:text-lg leading-relaxed mb-6 font-medium">
                                                {review.review}
                                            </p>

                                            <h4 className="text-white font-bold text-lg md:text-xl">
                                                {review.name}
                                            </h4>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Right Navigation Button */}
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-transparent border-2 border-gray-800/10 text-gray-800 p-2 md:p-3 rounded-full hover:bg-black hover:text-white transition-all active:scale-90 hidden md:flex items-center justify-center"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;
