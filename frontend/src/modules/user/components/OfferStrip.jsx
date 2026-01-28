
import React from 'react';

const OfferStrip = () => {
    return (
        <div className="bg-amber-50/40 backdrop-blur-sm text-amber-900 text-[10px] md:text-xs py-2.5 overflow-hidden font-bold tracking-[0.2em] relative w-full">
            {/* Soft Edge Fades */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />

            <div className="inline-flex whitespace-nowrap animate-marquee-infinite">
                <div className="flex gap-16 md:gap-28 items-center px-4">
                    <span className="flex items-center gap-2">✨ REPUBLIC DAY SALE: UP TO 60% OFF ✨</span>
                    <span className="text-amber-300 font-light">|</span>
                    <span>PREMIUM DRY FRUITS FOR YOUR FAMILY</span>
                    <span className="text-amber-300 font-light">|</span>
                    <span className="flex items-center gap-2">🥜 EXTRA 10% OFF ON JUMBO NUTS 🥜</span>
                    <span className="text-amber-300 font-light">|</span>
                    <span>100% ORGANIC & FRESH</span>
                </div>
                {/* Duplicate for seamless loop */}
                <div className="flex gap-16 md:gap-28 items-center px-4">
                    <span className="flex items-center gap-2">✨ REPUBLIC DAY SALE: UP TO 60% OFF ✨</span>
                    <span className="text-amber-300 font-light">|</span>
                    <span>PREMIUM DRY FRUITS FOR YOUR FAMILY</span>
                    <span className="text-amber-300 font-light">|</span>
                    <span className="flex items-center gap-2">🥜 EXTRA 10% OFF ON JUMBO NUTS 🥜</span>
                    <span className="text-amber-300 font-light">|</span>
                    <span>100% ORGANIC & FRESH</span>
                </div>
            </div>
            <style>{`
                .animate-marquee-infinite {
                    display: inline-flex;
                    animation: marquee-scroll 25s linear infinite;
                }
                @keyframes marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-infinite:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default OfferStrip;
