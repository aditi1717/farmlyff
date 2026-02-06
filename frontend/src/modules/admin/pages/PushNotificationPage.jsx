import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Bell, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PushNotificationPage = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'list';

    // Push Notification State
    const [pushMessage, setPushMessage] = useState({
        heading: '',
        message: '',
        target: 'all' // all, active, inactive
    });

    const handleSendPush = () => {
        if (!pushMessage.heading || !pushMessage.message) {
            toast.error("Please enter both heading and message");
            return;
        }
        toast.success(`Push notification sent to ${pushMessage.target === 'all' ? 'All Users' : pushMessage.target} successfully!`);
        setPushMessage({ heading: '', message: '', target: 'all' });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Push Notifications</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Engage with your mobile users</p>
                </div>
            </div>

            {/* List Tab (History) */}
            {activeTab === 'list' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[600px]">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">History</h4>
                            {[
                                { t: 'Big Savings on Almonds', m: 'Check out our refined selection...', d: '2 hours ago', s: 'Sent' },
                                { t: 'Welcome Gift Inside 🎁', m: 'Open to redeem your code...', d: 'Yesterday', s: 'Sent' },
                            ].map((n, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all">
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{n.t}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 truncate max-w-[200px]">{n.m}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider mb-1">{n.s}</span>
                                        <span className="text-[9px] font-bold text-gray-300 uppercase">{n.d}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add (Compose) Tab */}
            {activeTab === 'add' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[600px]">
                        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-[2rem] p-8 shadow-sm max-w-2xl mx-auto">
                            <h4 className="flex items-center gap-2 text-black font-black uppercase tracking-wider mb-6 pb-4 border-b border-gray-100">
                                <Send size={18} /> Compose New Message
                            </h4>
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Flash Sale is Live! 🔥"
                                        value={pushMessage.heading}
                                        onChange={(e) => setPushMessage({ ...pushMessage, heading: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                    <textarea
                                        rows="3"
                                        placeholder="e.g. Get 50% OFF on all items valid for next 2 hours only."
                                        value={pushMessage.message}
                                        onChange={(e) => setPushMessage({ ...pushMessage, message: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-black transition-all shadow-sm resize-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Audience</label>
                                    <select
                                        value={pushMessage.target}
                                        onChange={(e) => setPushMessage({ ...pushMessage, target: e.target.value })}
                                        className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option value="all">Send to All Users</option>
                                        <option value="active">Active Users (Last 30 Days)</option>
                                        <option value="cart">Users with Abandoned Cart</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleSendPush}
                                    className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-gray-900 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 mt-4"
                                >
                                    <Send size={16} /> Send Blast
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PushNotificationPage;
