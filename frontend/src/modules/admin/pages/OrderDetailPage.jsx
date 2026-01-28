import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Printer,
    Truck,
    Package,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    MapPin,
    CreditCard,
    ChevronRight,
    Search
} from 'lucide-react';
import { useShop } from '../../../context/ShopContext';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders, getProductById, getPackById } = useShop();

    // Find the order in the nested orders object
    const order = useMemo(() => {
        for (let userId in orders) {
            const found = orders[userId].find(o => o.id === id);
            if (found) return { ...found, ownerId: userId };
        }
        return null;
    }, [orders, id]);

    const [status, setStatus] = useState(order?.status || 'Processing');

    if (!order) {
        return (
            <div className="p-20 text-center">
                <h2 className="text-2xl font-bold text-gray-400">Order Not Found</h2>
                <button onClick={() => navigate('/admin/orders')} className="mt-4 text-primary font-bold hover:underline">
                    Back to Orders
                </button>
            </div>
        );
    }

    const handleUpdateStatus = (newStatus) => {
        setStatus(newStatus);
        alert(`Order status updated to ${newStatus}! (Mock Update)`);
        // In real app: call updateOrder(order.ownerId, order.id, { status: newStatus })
    };

    return (
        <div className="space-y-8 pb-20 text-left">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-3 bg-white text-footerBg rounded-2xl border border-gray-100 shadow-sm hover:bg-footerBg hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Order Fulfillment</h1>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Fulfilling Order #{order.id?.slice(-12)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-primary transition-all">
                        <Printer size={20} />
                    </button>
                    <div className="bg-white p-1 rounded-2xl border border-gray-100 flex items-center shadow-sm">
                        {['Processing', 'Shipped', 'Delivered'].map(s => (
                            <button
                                key={s}
                                onClick={() => handleUpdateStatus(s)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-footerBg text-white shadow-lg' : 'text-gray-400 hover:text-footerBg'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Summary & Items */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Items List */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-left">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                                <Package size={18} className="text-gray-400" />
                                Review Items ({order.items?.length || 0})
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items?.map((item, idx) => {
                                const prod = getPackById(item.packId);
                                return (
                                    <div
                                        key={idx}
                                        className="p-8 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => {
                                            const productId = prod?.product?.id || item.productId;
                                            if (productId) navigate(`/admin/products/edit/${productId}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 border border-gray-100 group-hover:scale-105 transition-transform group-hover:border-primary/20">
                                                <img src={prod?.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 group-hover:text-primaryDeep transition-colors">{prod?.brand}</p>
                                                <p className="font-bold text-footerBg text-lg group-hover:text-primary transition-colors">{prod?.name}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1 tracking-tight">Variant: {item.weight || 'Standard'} x {item.quantity || item.qty}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-footerBg text-left">₹{item.price?.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400">₹{item.price}/{item.weight}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-gray-50/50 p-10 border-t border-gray-100 divide-y divide-gray-100/50 space-y-4">
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-footerBg">₹{(order.amount - (order.deliveryCharges || 0) + (order.discount || 0)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase tracking-widest pt-4">
                                <span>Discount</span>
                                <span>-₹{(order.discount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest pt-4">
                                <span>Delivery</span>
                                <span className="text-footerBg">₹{(order.deliveryCharges || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-8 text-left">
                                <span className="text-lg font-black text-footerBg uppercase tracking-tight">Order Total</span>
                                <span className="text-3xl font-black text-footerBg tracking-tight">₹{order.amount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Customer Info & Timeline */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Info Card */}
                    <div
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 cursor-pointer hover:border-primary/30 transition-all group"
                        onClick={() => navigate(`/admin/users/${order.userId || order.ownerId}`)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 text-footerBg border border-gray-100 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-footerBg group-hover:text-white transition-all">
                                {order.userName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-footerBg group-hover:text-primary transition-colors">{order.userName}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified Customer</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Address</p>
                                    <p className="text-xs font-bold text-footerBg leading-relaxed">
                                        {order.address?.fullName}<br />
                                        {order.address?.address}, {order.address?.city}<br />
                                        {order.address?.state} - {order.address?.pincode}
                                    </p>
                                    <p className="text-xs font-black text-primary mt-2">Ph: {order.address?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                                    <p className="text-xs font-bold text-footerBg uppercase tracking-tight">{order.paymentMethod}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                        <h3 className="text-sm font-black text-footerBg uppercase tracking-widest flex items-center gap-2">
                            <Clock size={18} className="text-gray-400" />
                            Activity Logs
                        </h3>
                        <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-gray-100 text-left">
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-emerald-100 shrink-0">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-footerBg text-xs">Order Placed</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Customer successfully paid using {order.paymentMethod}</p>
                                    <p className="text-[10px] text-footerBg font-black mt-1 uppercase tracking-tighter">{(new Date(order.date)).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-6 relative z-10 opacity-50">
                                <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-gray-100 shrink-0">
                                    <Truck size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-footerBg text-xs">Fulfillment Sent</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Pending tracking ID update...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
