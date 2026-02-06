import React, { useState, useEffect } from 'react';
import { Save, Megaphone, Type, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { useSetting, useUpdateSetting } from '../../../hooks/useSettings';
import toast from 'react-hot-toast';

const HeaderAnnouncementPage = () => {
    // 1. Top Bar Text (Free Shipping)
    const { data: topBarData, isLoading: loadingTopBar } = useSetting('topbar_text');
    const updateTopBar = useUpdateSetting();
    const [topBarText, setTopBarText] = useState('');

    // 2. Marquee Text (Moving Line)
    const { data: marqueeData, isLoading: loadingMarquee } = useSetting('marquee_text');
    const updateMarquee = useUpdateSetting();
    const [marqueeLines, setMarqueeLines] = useState([]);
    const [newLine, setNewLine] = useState('');

    // Initialize State from Data
    useEffect(() => {
        if (topBarData?.value) setTopBarText(topBarData.value);
    }, [topBarData]);

    useEffect(() => {
        if (marqueeData?.value) setMarqueeLines(marqueeData.value);
    }, [marqueeData]);

    // Handlers
    const handleSaveTopBar = () => {
        updateTopBar.mutate({ key: 'topbar_text', value: topBarText });
    };

    const handleAddMarqueeLine = () => {
        if (!newLine.trim()) return;
        const updated = [...marqueeLines, newLine];
        setMarqueeLines(updated);
        setNewLine('');
    };

    const handleRemoveMarqueeLine = (index) => {
        const updated = marqueeLines.filter((_, i) => i !== index);
        setMarqueeLines(updated);
    };

    const handleSaveMarquee = () => {
        updateMarquee.mutate({ key: 'marquee_text', value: marqueeLines });
    };

    if (loadingTopBar || loadingMarquee) {
        return <div className="p-10 text-center">Loading settings...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Header & Announcements</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage top bar and moving announcements</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SECTION 1: Top Bar Text */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <LayoutTemplate size={20} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Top Bar Text</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Text</label>
                            <div className="relative mt-1">
                                <input
                                    type="text"
                                    value={topBarText}
                                    onChange={(e) => setTopBarText(e.target.value)}
                                    placeholder="e.g. Free Shipping On Orders Above ₹1499/-"
                                    className="w-full bg-gray-50 border-none rounded-2xl pl-5 pr-4 py-4 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium mt-2 ml-1">
                                This text appears at the very top of the website (black/dark strip).
                            </p>
                        </div>

                        <button
                            onClick={handleSaveTopBar}
                            disabled={updateTopBar.isPending}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 transition-all w-full mt-4"
                        >
                            <Save size={16} /> {updateTopBar.isPending ? 'Saving...' : 'Save Text'}
                        </button>
                    </div>
                </div>

                {/* SECTION 2: Marquee Announcements */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Megaphone size={20} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Scrolling Announcements</h2>
                    </div>

                    <div className="space-y-6">
                        {/* List of active lines */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Active Lines</label>
                            {marqueeLines.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-2xl text-gray-400 text-xs font-bold">
                                    No announcements added yet.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {marqueeLines.map((line, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-xs font-bold text-gray-700 truncate">{line}</span>
                                            <button
                                                onClick={() => handleRemoveMarqueeLine(idx)}
                                                className="p-1.5 bg-white text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add New Line */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Add New Line</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    value={newLine}
                                    onChange={(e) => setNewLine(e.target.value)}
                                    placeholder="Type announcement here..."
                                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-black transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddMarqueeLine()}
                                />
                                <button
                                    onClick={handleAddMarqueeLine}
                                    className="bg-gray-900 text-white px-4 rounded-xl hover:bg-black transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveMarquee}
                            disabled={updateMarquee.isPending}
                            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 transition-all w-full"
                        >
                            <Save size={16} /> {updateMarquee.isPending ? 'Saving...' : 'Save Announcements'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderAnnouncementPage;
