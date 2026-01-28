
import React from 'react';
import { useShop } from '../../../context/ShopContext';
import { useAuth } from '../../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const OrdersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getOrders } = useShop();

    const orders = user ? getOrders(user.id) : [];

    if (orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <Package size={80} className="text-gray-200 mb-6" />
                <h2 className="text-2xl font-bold text-footerBg mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
                <Link to="/catalog" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                        <ArrowLeft size={20} md:size={24} />
                    </button>
                    <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight">My Orders</h1>
                </div>

                <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
                    {orders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="p-3 md:p-6">
                                <div className="flex flex-col gap-3">
                                    {/* Top Row: ID & Amount */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-footerBg text-sm md:text-lg tracking-tight">{order.id}</span>
                                                <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${order.status?.toLowerCase() === 'shipped' ? 'bg-indigo-50 text-indigo-500' : 'bg-green-50 text-green-500'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-[9px] md:text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Clock size={10} className="shrink-0" />
                                                {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] md:text-[10px] text-slate-300 uppercase font-black tracking-widest leading-none mb-1">Total</p>
                                            <p className="text-base md:text-2xl font-black text-footerBg leading-none">₹{order.amount}</p>
                                        </div>
                                    </div>

                                    {/* Bottom Row: View Details Button */}
                                    <div className="pt-1">
                                        <Link
                                            to={`/order/${order.id}`}
                                            className="w-full md:w-fit md:ml-auto md:px-10 bg-slate-50 border border-slate-100 text-footerBg py-2.5 md:py-3 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-footerBg hover:text-white"
                                        >
                                            View Details
                                            <ChevronRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
