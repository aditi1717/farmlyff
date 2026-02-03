
import React from 'react';
import HeroSection from '../components/HeroSection';
import CategoryStrip from '../components/CategoryStrip';

import TopSellingProducts from '../components/TopSellingProducts';
import WhyChooseUs from '../components/WhyChooseUs';
import AboutSection from '../components/AboutSection';
import HealthBenefitsSection from '../components/HealthBenefitsSection';
import ReviewSection from '../components/ReviewSection';
import BlogSection from '../components/BlogSection';
import FAQSection from '../components/FAQSection';

const HomePage = () => {
    return (
        <div className="bg-white min-h-screen">
            <HeroSection />
            <CategoryStrip />
            <TopSellingProducts />
            <WhyChooseUs />
            <AboutSection />
            <HealthBenefitsSection />
            <ReviewSection />
            <BlogSection />
            <FAQSection />
        </div>
    );
};

export default HomePage;
