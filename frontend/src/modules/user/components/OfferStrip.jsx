import React from 'react';
import { useSetting } from '../../../hooks/useSettings';

const OfferStrip = () => {
    const { data: marqueeSetting, isLoading } = useSetting('marquee_text');
    
    // Default text if not set in DB
    const defaultText = [
        "✨ REPUBLIC DAY SALE: UP TO 60% OFF ✨",
        "PREMIUM DRY FRUITS FOR YOUR FAMILY",
        "🥜 EXTRA 10% OFF ON JUMBO NUTS 🥜",
        "100% ORGANIC & FRESH"
    ];

    const marqueeItems = marqueeSetting?.value?.length > 0 ? marqueeSetting.value : defaultText;

    if (isLoading) return <div className="h-10 bg-amber-50/20" />;

    const renderItems = () => (
        <div className="flex gap-16 md:gap-28 items-center px-4">
            {marqueeItems.map((item, index) => (
                <React.Fragment key={index}>
                    <span className="flex items-center gap-2">{item}</span>
                    {index < marqueeItems.length - 1 && (
                        <span className="text-amber-300 font-light">|</span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="bg-amber-50/40 backdrop-blur-sm text-amber-900 text-[10px] md:text-xs py-2.5 overflow-hidden font-bold tracking-[0.2em] relative w-full">
            {/* Soft Edge Fades */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-amber-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none" />

            <div className="inline-flex whitespace-nowrap animate-marquee-infinite">
                {renderItems()}
                {/* Duplicate for seamless loop */}
                {renderItems()}
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
