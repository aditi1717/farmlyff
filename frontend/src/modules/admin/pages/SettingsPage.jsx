import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Save,
    User,
    Bell,
    Shield,
    Globe,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Zap,
    Lock,
    Eye,
    EyeOff,
    MessageSquare,
    Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import MarqueeSettings from '../components/MarqueeSettings';

const API_URL = import.meta.env.VITE_API_URL;

const SettingsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');
    const [showPassword, setShowPassword] = useState(false);
    
    // Hero Promo Settings State
    const [heroSettings, setHeroSettings] = useState({
        badgeText1: 'Upto',
        discountTitle: '60',
        discountSuffix: '%',
        discountLabel: 'OFF',
        subtitle: 'EXTRA SAVE',
        extraDiscount: '15',
        extraDiscountSuffix: '%',
        couponCode: 'REPUBLICJOY',
        topBadge: 'Hot Deal',
        showCouponCode: true,
        isVisible: true
    });
    const [loadingHero, setLoadingHero] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Fetch Hero Settings
    useEffect(() => {
        if (activeTab === 'hero') {
            const fetchHeroSettings = async () => {
                setLoadingHero(true);
                try {
                    const res = await fetch(`${API_URL}/promo-card`, { credentials: 'include' });
                    if (res.ok) {
                        const data = await res.json();
                        if (data) {
                            // Backend returns the object directly now, not wrapped in 'value'
                            setHeroSettings(prev => ({ ...prev, ...data }));
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch hero settings:', error);
                } finally {
                    setLoadingHero(false);
                }
            };
            fetchHeroSettings();
        }
    }, [activeTab]);

    const handleTabChange = (id) => {
        setActiveTab(id);
        setSearchParams({ tab: id });
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'announcements', label: 'Announcements', icon: MessageSquare },
        { id: 'hero', label: 'Hero Section', icon: Star },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'account', label: 'Account', icon: User },
    ];

    const handleSave = async () => {
        if (activeTab === 'hero') {
            try {
                const res = await fetch(`${API_URL}/promo-card`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(heroSettings) // Send directly
                });
                
                if (res.ok) {
                    toast.success("Promo card updated successfully!");
                } else {
                    throw new Error('Failed to update');
                }
            } catch (error) {
                toast.error("Failed to update promo card");
            }
            return;
        }
        
        toast.success("Settings preferences saved! (Simulated)");
    };

    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setHeroSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8 text-left max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Control Center</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Configure your administrator preferences</p>
                </div>
                {activeTab !== 'announcements' && (
                    <button
                        onClick={handleSave}
                        className="bg-footerBg text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-footerBg/20"
                    >
                        <Save size={18} /> Update Configurations
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Tabs */}
                <div className="lg:col-span-3 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all ${activeTab === tab.id
                                ? 'bg-footerBg text-white shadow-lg'
                                : 'bg-white text-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right: Content */}
                <div className="lg:col-span-9">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[500px]">
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-sm font-black text-footerBg uppercase tracking-widest border-b border-gray-50 pb-4">Store Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Name</label>
                                        <input type="text" defaultValue="FarmLyf Dryfruits" className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Support Email</label>
                                        <input type="email" defaultValue="admin@farmlyf.com" className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                                        <select className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all">
                                            <option>INR (₹)</option>
                                            <option>USD ($)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Timezone</label>
                                        <select className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all">
                                            <option>Asia/Kolkata (GMT +5:30)</option>
                                            <option>UTC</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'announcements' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <MarqueeSettings />
                            </div>
                        )}

                        {activeTab === 'hero' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-sm font-black text-footerBg uppercase tracking-widest border-b border-gray-50 pb-4">Promo Card Configuration</h3>
                                
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show Promo Card</p>
                                        <p className="text-xs font-bold text-gray-600">Toggle visibility of the floating card</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={heroSettings.isVisible} 
                                            onChange={(e) => setHeroSettings(prev => ({ ...prev, isVisible: e.target.checked }))}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Top Badge Text</label>
                                        <input 
                                            type="text" 
                                            name="topBadge"
                                            value={heroSettings.topBadge} 
                                            onChange={handleHeroChange}
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Small Text 1 (e.g. Upto)</label>
                                        <input 
                                            type="text" 
                                            name="badgeText1"
                                            value={heroSettings.badgeText1} 
                                            onChange={handleHeroChange}
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Discount (e.g. 60)</label>
                                        <input 
                                            type="text" 
                                            name="discountTitle"
                                            value={heroSettings.discountTitle} 
                                            onChange={handleHeroChange}
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Label (e.g. % OFF)</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                name="discountSuffix"
                                                value={heroSettings.discountSuffix} 
                                                onChange={handleHeroChange}
                                                placeholder="%"
                                                className="w-16 bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                            />
                                            <input 
                                                type="text" 
                                                name="discountLabel"
                                                value={heroSettings.discountLabel} 
                                                onChange={handleHeroChange}
                                                placeholder="OFF"
                                                className="flex-1 bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subtitle (e.g. EXTRA SAVE)</label>
                                        <input 
                                            type="text" 
                                            name="subtitle"
                                            value={heroSettings.subtitle} 
                                            onChange={handleHeroChange}
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Extra Discount (e.g. 15)</label>
                                        <input 
                                            type="text" 
                                            name="extraDiscount"
                                            value={heroSettings.extraDiscount} 
                                            onChange={handleHeroChange}
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coupon Code</label>
                                        <input 
                                            type="text" 
                                            name="couponCode"
                                            value={heroSettings.couponCode} 
                                            onChange={handleHeroChange}
                                            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" 
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show Coupon Code</p>
                                                <p className="text-xs font-bold text-gray-600">Display the code on the card</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={heroSettings.showCouponCode} 
                                                    onChange={(e) => setHeroSettings(prev => ({ ...prev, showCouponCode: e.target.checked }))}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 mt-4">
                                     <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Preview</h4>
                                     {heroSettings.isVisible ? (
                                        <div className="flex flex-col items-center justify-center p-6 bg-white/80 border border-gray-200 rounded-2xl shadow-sm max-w-[200px] mx-auto relative">
                                        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter">
                                            {heroSettings.topBadge}
                                        </div>
                                        <div className="text-center font-sans">
                                            <p className="text-gray-400 font-black text-[9px] uppercase tracking-[0.2em]">{heroSettings.badgeText1}</p>
                                            <div className="flex items-baseline gap-0.5 justify-center leading-none my-1">
                                                <span className="text-4xl font-black text-red-500 tracking-tighter">{heroSettings.discountTitle}</span>
                                                <div className="flex flex-col items-start translate-y-1">
                                                    <span className="text-sm font-black text-gray-800">{heroSettings.discountSuffix}</span>
                                                    <span className="text-[7px] font-bold text-gray-500 uppercase">{heroSettings.discountLabel}</span>
                                                </div>
                                            </div>
                                            <div className="w-8 h-1 bg-green-500/30 mx-auto rounded-full my-2"></div>
                                            <p className="text-gray-400 font-black text-[9px] uppercase tracking-[0.2em]">{heroSettings.subtitle}</p>
                                            <div className="flex items-baseline gap-0.5 justify-center leading-none mt-1">
                                                <span className="text-2xl font-black text-green-500">{heroSettings.extraDiscount}</span>
                                                <span className="text-sm font-bold text-gray-800">{heroSettings.extraDiscountSuffix}</span>
                                            </div>
                                        </div>
                                        {heroSettings.showCouponCode && (
                                            <div className="mt-4 bg-gray-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase">
                                                {heroSettings.couponCode}
                                            </div>
                                        )}
                                     </div>
                                     ) : (
                                        <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                                            <EyeOff size={24} className="mb-2 opacity-50" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Card Hidden</p>
                                        </div>
                                     )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-sm font-black text-footerBg uppercase tracking-widest border-b border-gray-50 pb-4">Security & Authentication</h3>
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2 max-w-md">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Change Admin Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 pr-12 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-dotted border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-footerBg uppercase tracking-tight">Two-Factor Authentication</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Add an extra layer of security</p>
                                            </div>
                                        </div>
                                        <button className="bg-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:border-primary transition-all">Enable</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-sm font-black text-footerBg uppercase tracking-widest border-b border-gray-50 pb-4">Alert Preferences</h3>
                                <div className="space-y-4">
                                    {[
                                        { l: 'New Order Real-time Alert', d: 'Get notified as soon as a customer places an order' },
                                        { l: 'Low Stock Warnings', d: 'Alert when a product variant goes below 10 units' },
                                        { l: 'Return Request Notifications', d: 'Instant feedback on new RMA submissions' },
                                        { l: 'Weekly Performance Report', d: 'Receive a summary of sales every Monday' }
                                    ].map((n, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                            <div>
                                                <p className="text-xs font-black text-footerBg uppercase tracking-tighter">{n.l}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{n.d}</p>
                                            </div>
                                            <button className="w-12 h-6 bg-primary rounded-full relative">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="text-sm font-black text-footerBg uppercase tracking-widest border-b border-gray-50 pb-4">Admin Profile</h3>

                                <div className="flex items-start gap-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                            <User size={48} className="text-gray-400" />
                                        </div>
                                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-footerBg transition-colors">
                                            Change Photo
                                        </button>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                                <input type="text" defaultValue="Admin User" className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                                <input type="email" defaultValue="admin@farmlyf.com" className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                                                <input type="text" defaultValue="Super Administrator" disabled className="w-full bg-gray-100 border border-transparent rounded-2xl p-4 text-sm font-bold text-gray-500 cursor-not-allowed" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-primary transition-all" />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-50">
                                            <h4 className="text-xs font-black text-red-500 uppercase tracking-tight mb-2">Danger Zone</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Permanently delete this account and all associated data.</p>
                                            <button className="px-6 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
