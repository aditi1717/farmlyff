
import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import CategoryNav from '../components/CategoryNav';
import OfferStrip from '../components/OfferStrip';
import Footer from '../components/Footer';

const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-background">
            <header className="sticky top-0 shadow-md flex flex-col shrink-0 bg-white" style={{ zIndex: 100 }}>
                <TopBar />
                <Navbar />
                <CategoryNav />
                <OfferStrip />
            </header>
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default UserLayout;
