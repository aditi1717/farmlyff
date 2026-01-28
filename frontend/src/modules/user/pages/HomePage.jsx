
import React from 'react';
import HeroSection from '../components/HeroSection';
import CategoryStrip from '../components/CategoryStrip';
import PromoSlider from '../components/PromoSlider';
import ShopByPacks from '../components/ShopByPacks';
const HomePage = () => {
    return (
        <div className="bg-white min-h-screen">
            <HeroSection />
            <CategoryStrip />
            <PromoSlider />
            <ShopByPacks />
        </div>
    );
};

export default HomePage;
