
import React, { useState } from 'react';
import { useCategories, useSubCategories } from '../../../hooks/useProducts';
import {
    Store,
    Nut,
    Coffee,
    Calendar,
    Package2,
    Sprout,
    Gift,
    Gem,
    ChevronDown,
    Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const shopMenuData = [
    {
        title: 'NUTS',
        items: ['WALNUTS (AKHROT)', 'ALMONDS (BADAM)', 'CASHEW (KAJU)', 'PISTACHIO (PISTA)']
    },
    {
        title: 'DRIED FRUITS',
        items: ['RAISINS (KISHMISH)', 'DRIED FIGS (ANJEER)', 'DRIED APRICOTS (KHUBANI)', 'DRIED KIWI', 'DRIED PRUNES (AALOOBUKHAARA)']
    },
    {
        title: 'DATES',
        items: ['WET DATES (KHAJUR)', 'DRY DATES (CHUARA)']
    },
    {
        title: 'SEEDS',
        items: ['CHIA SEEDS', 'CUCUMBER SEEDS', 'FLAX SEEDS', 'MUSK MELON SEEDS', 'PUMPKIN SEEDS', 'QUINOA SEEDS', 'SUNFLOWER SEEDS', 'FOX NUTS (PHOOL MAKHANA)']
    },
    {
        title: 'EXOTIC NUTS',
        items: ['HAZELNUTS', 'MACADAMIA NUTS', 'PECAN NUTS']
    },
    {
        title: 'MIXES',
        items: ['BERRIES MIX', 'NUT MIX', 'SEEDS MIX', 'TRAIL MIX']
    }
];

const comboMenuData = [
    {
        title: 'ALL COMBOS',
        items: [
            { label: 'DAILY PACKS' },
            { label: 'FAMILY PACKS' },
            { label: 'PARTY PACKS' },
            {
                label: 'FESTIVAL PACKS',
                subItems: ['DIWALI PACK', 'HOLI PACK', 'RAKHI PACK']
            },
            { label: 'HEALTH & FITNESS PACKS' },
            { label: 'WEDDING / GIFTING PACKS' }
        ]
    }
];

const categories = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Shop', icon: Store, path: '/catalog', hasMenu: true, menuData: shopMenuData },
    { name: 'Jumbo Nuts', icon: Nut, path: '/category/nuts' },
    { name: 'Snacking', icon: Coffee, path: '/category/dried-fruits' },
    { name: 'Dates', icon: Calendar, path: '/category/wet-dates' },
    { name: 'Combos', icon: Package2, path: '/category/combos-packs', hasMenu: true, menuData: comboMenuData },
    { name: 'Seeds', icon: Sprout, path: '/category/seeds-mixes' },
    { name: 'Gifting', icon: Gift, path: '/category/wedding-gifting-packs' },
    { name: 'Exotic Nuts', icon: Gem, path: '/category/macadamia-nuts' },
];

const CategoryNav = () => {
    const [activeMenu, setActiveMenu] = useState(null);
    const { data: rawCategories = [] } = useCategories();
    const { data: rawSubCategories = [] } = useSubCategories();

    // Deduplicate and filter active categories
    const categoriesDB = React.useMemo(() => {
        const unique = [];
        const seen = new Set();
        for (const cat of rawCategories) {
            const id = cat._id || cat.id;
            if (id && !seen.has(id) && cat.status === 'Active' && cat.showInNavbar !== false) {
                seen.add(id);
                unique.push(cat);
            }
        }
        return unique;
    }, [rawCategories]);

    // Build Shop Menu Data properly from DB
    const shopMenuData = React.useMemo(() => {
        return categoriesDB.map(cat => {
            const catId = cat._id || cat.id;
            const subs = rawSubCategories.filter(sub => {
                const subParentId = sub.parent?._id || sub.parent;
                return subParentId && catId && String(subParentId) === String(catId) && sub.status === 'Active';
            });
            
            return {
                title: cat.name,
                items: subs.map(s => s.name) // Using name string as per previous structure, or could be object
            };
        });
    }, [categoriesDB, rawSubCategories]);

    // Build Top Level Navigation Items
    const navItems = React.useMemo(() => {
        const items = [
            { name: 'Home', icon: Home, path: '/' },
            { 
                name: `Shop (${categoriesDB.length})`, // Debug count as requested, or remove
                icon: Store, 
                path: '/catalog', 
                hasMenu: true, 
                menuData: shopMenuData 
            }
        ];

        // Add DB Categories as top level links
        categoriesDB.forEach(cat => {
            // Icon logic is hard because icons are imports. We can use a default or mapped icon.
            // For now, use Sprout or similar.
            /* 
               We could try to map names to icons if we want, but dynamic is safer with generic icon.
            */
            items.push({
                name: cat.name,
                icon: Sprout, // Default icon
                path: `/category/${cat.slug}`
            });
        });

        // Add Combos if not present? "Combos & Packs" is usually in DB.
        
        return items;
    }, [categoriesDB, shopMenuData]);

    return (
        <div className="bg-footerBg text-white py-3.5 hidden md:block border-t border-gray-800 shadow-lg px-4 lg:px-12 relative z-[100]">
            <div className="flex justify-between items-center text-[10px] lg:text-[11px] font-black tracking-widest uppercase items-center">
                {navItems.map((cat, index) => {
                    const Icon = cat.icon;
                    return (
                        <div
                            key={index}
                            className="flex items-center"
                            onMouseEnter={() => cat.hasMenu && setActiveMenu(cat.name)}
                            onMouseLeave={() => cat.hasMenu && setActiveMenu(null)}
                        >
                            <Link
                                to={cat.path}
                                onClick={() => setActiveMenu(null)}
                                className={`flex items-center gap-2 py-1 transition-all duration-300 ${activeMenu === cat.name ? 'text-primary' : 'hover:text-primary text-white/90'}`}
                            >
                                <Icon size={14} className={`transition-colors duration-300 ${activeMenu === cat.name ? 'text-primary' : 'text-primary/70'}`} />
                                <span className="whitespace-nowrap">{cat.name}</span>
                                {cat.hasMenu && <ChevronDown size={11} className={`ml-0.5 transition-transform duration-300 ${activeMenu === cat.name ? 'rotate-180' : ''}`} />}
                            </Link>

                            {/* Vertical Divider */}
                            {index !== navItems.length - 1 && (
                                <div className="h-4 w-[1px] bg-white/10 mx-3 lg:mx-6" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Popup Mega Menu */}
            <AnimatePresence>
                {activeMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-full z-[110] bg-white shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] rounded-b-[2rem] border-t border-gray-100 overflow-hidden"
                        onMouseEnter={() => setActiveMenu(activeMenu)}
                        onMouseLeave={() => setActiveMenu(null)}
                    >
                        <div className="max-w-[1500px] mx-auto px-12 py-12">
                            <div className={`grid ${activeMenu.startsWith('Shop') ? 'grid-cols-6' : 'grid-cols-4'} gap-x-10 gap-y-12`}>
                                {navItems.find(c => c.name === activeMenu)?.menuData?.map((section, idx) => (
                                    <div key={idx} className="space-y-6">
                                        <h4 className="text-footerBg font-black text-[12px] tracking-[0.15em] mb-6 border-b border-gray-100 pb-3 uppercase">
                                            {section.title}
                                        </h4>
                                        <ul className="space-y-4">
                                            {section.items.map((item, i) => (
                                                <li key={i} className="group/item">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-[6px] flex-shrink-0" />
                                                        <Link
                                                            to={`/category/${section.title.toLowerCase().replace(/ /g, '-')}/${(item.label || item).toLowerCase().replace(/ /g, '-')}`}
                                                            onClick={() => setActiveMenu(null)}
                                                            className="text-[#374151] group-hover/item:text-primary font-black text-[12px] leading-tight transition-all duration-200 tracking-wide uppercase"
                                                        >
                                                            {item.label || item}
                                                        </Link>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryNav;
