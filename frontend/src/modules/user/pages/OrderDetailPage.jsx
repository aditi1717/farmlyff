
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useShop } from '../../../context/ShopContext'; // Removed
import { useAuth } from '../../../context/AuthContext';
import {
    ArrowLeft, Package, MapPin, Phone, CreditCard,
    Truck, CheckCircle, Clock, Archive, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrders, useReturns, useUpdateOrderStatus } from '../../../hooks/useOrders'; // Added imports

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Hooks
    const { data: orders = [] } = useOrders(user?.id);
    const { data: returns = [] } = useReturns(user?.id);
    const { mutate: updateStatus } = useUpdateOrderStatus();
    
    const [order, setOrder] = useState(null);
    const [availableItemsCount, setAvailableItemsCount] = useState(0);

    useEffect(() => {
        if (orders.length > 0 && orderId) {
            const foundOrder = orders.find(o => o.id === orderId);
            if (foundOrder) {
                setOrder(foundOrder);
                
                // Calculate returns
                const orderReturns = returns.filter(r => r.orderId === orderId && r.status !== 'Rejected');
                const returnedPackIds = new Set();
                orderReturns.forEach(ret => {
                    ret.items.forEach(item => returnedPackIds.add(item.packId));
                });

                const available = foundOrder.items.filter(item => !returnedPackIds.has(item.packId));
                setAvailableItemsCount(available.length);
            }
        }
    }, [orders, returns, orderId]);

    const updateOrderStatus = (uid, oid, status) => {
        updateStatus({ userId: uid, orderId: oid, status });
        // For simulation, we might need to manually update local state or force refresh if mutation doesn't persist to where fetch reads
        // Assuming the previous implementation had some way to persist. 
        // If not, this is just a visual toast in this refactor step unless we fully implement LS persistence in useOrders.
        // For now, we keep it as a mutation call.
        if (order) setOrder({ ...order, deliveryStatus: status });
    };

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading order details...</p>
            </div>
        );
    }

    // Check if eligible for return (delivered and within 7 days)
    const isDelivered = order.deliveryStatus === 'Delivered';
    const isWithinReturnWindow = () => {
        if (!order.deliveredDate) return false;
        const deliveryDate = new Date(order.deliveredDate);
        const now = new Date();
        const diffDays = Math.ceil((now - deliveryDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    const canReturn = isDelivered && isWithinReturnWindow() && availableItemsCount > 0;

    // Timeline steps for UI
    const steps = [
        { status: 'Processing', label: 'Order Placed', icon: Archive },
        { status: 'Packed', label: 'Packed', icon: Package },
        { status: 'Shipped', label: 'Shipped', icon: Truck },
        { status: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
        { status: 'Delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.deliveryStatus);

    return (
        <div className="bg-[#fcfcfc] min-h-screen py-4 md:py-12">
            <div className="container mx-auto px-3 md:px-12 max-w-4xl">
                <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
                    <button onClick={() => navigate('/orders')} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-footerBg/70">
                        <ArrowLeft size={20} md:size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-footerBg uppercase tracking-tighter md:tracking-tight leading-none">Order Details</h1>
                        <p className="text-[10px] md:text-sm font-mono text-slate-400 mt-1">#{order.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                    {/* Main Content (Timeline & Items) */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-4">

                        {/* Delivery Track & Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center text-green-600">
                                        <Truck size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Tracking Info</p>
                                        <p className="text-sm font-bold text-footerBg">{order.trackingId}</p>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Estimated Delivery</p>
                                    <p className="text-xs font-bold text-footerBg">
                                        {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 md:p-8">
                                {/* Vertical Timeline for Mobile, Horizontal for Desktop */}
                                <div className="flex flex-col md:flex-row justify-between gap-4 relative">
                                    {steps.map((step, index) => {
                                        const isActive = index <= currentStepIndex;
                                        const isCompleted = index < currentStepIndex || (index === currentStepIndex && order.deliveryStatus === 'Delivered');
                                        const isCurrent = index === currentStepIndex;
                                        const Icon = step.icon;

                                        return (
                                            <div key={index} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 relative min-h-[64px] md:min-h-0">
                                                {/* Vertical Connector Line (Mobile Only) */}
                                                {index < steps.length - 1 && (
                                                    <div className="md:hidden absolute top-[40px] left-[20px] w-0.5 h-[calc(100%-16px)] bg-gray-100 z-0">
                                                        <div className={`w-full bg-green-500 transition-all duration-500 ${index < currentStepIndex ? 'h-full' : 'h-0'}`} />
                                                    </div>
                                                )}

                                                {/* Connector Lines (Desktop Only) */}
                                                {index < steps.length - 1 && (
                                                    <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 bg-gray-100">
                                                        <div className={`h-full bg-green-500 transition-all duration-500 ${index < currentStepIndex ? 'w-full' : 'w-0'}`} />
                                                    </div>
                                                )}

                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all relative z-10 shrink-0
                                                    ${isCompleted ? 'bg-green-50 border-green-100 text-green-600' : 'bg-white'}
                                                    ${isCurrent && !isCompleted ? 'border-primary text-primary bg-primary/5 shadow-lg shadow-primary/10' : ''}
                                                    ${!isCompleted && !isCurrent ? 'border-gray-50 text-gray-300' : ''}
                                                `}>
                                                    <Icon size={isCurrent ? 20 : 18} strokeWidth={isCurrent ? 3 : 2} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest leading-none md:text-center
                                                        ${isActive ? 'text-footerBg' : 'text-slate-300'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-[9px] font-bold text-green-500 mt-1 md:text-center">Live Update</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Product Items List (Compact) */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 bg-slate-50/50 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items in Package</h3>
                                <div className="text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-green-100 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {order.items.length} Units
                                </div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {order.items.map((item, i) => (
                                    <div key={i} className="p-4 flex gap-4 items-center">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-center p-1 shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] md:text-sm font-black text-footerBg truncate mb-0.5">{item.name}</h4>
                                            <p className="text-[11px] font-bold text-slate-400 tracking-tight">
                                                Qty: {item.qty} <span className="mx-1 opacity-20">×</span> ₹{item.price}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[13px] md:text-sm font-black text-footerBg">₹{item.price * item.qty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Detailed Info */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-4">

                        {/* Address & Payment Merged Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-6">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Delivered To</p>
                                        <p className="text-sm font-black text-footerBg">{order.shippingAddress.fullName}</p>
                                        <p className="text-[11px] font-medium text-slate-400 leading-tight pr-4 mt-0.5">
                                            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.pincode}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <CreditCard size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Payment Method</p>
                                        <p className="text-xs font-black text-footerBg uppercase tracking-tighter">
                                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Secure Online Payment'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-gray-50">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pr-4 leading-none">Order Total</p>
                                    <p className="text-2xl font-black text-footerBg leading-none">₹{order.amount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Return Action (High Contrast) */}
                        {isDelivered && canReturn && (
                            <button
                                onClick={() => navigate(`/request-return/${order.id}`)}
                                className="w-full bg-footerBg text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-primary shadow-xl shadow-footerBg/10"
                            >
                                <RefreshCw size={14} strokeWidth={3} />
                                Return / Exchange
                            </button>
                        )}

                        {/* Status Demo (Bottom Anchor) */}
                        <div className="pt-4 opacity-30 hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => {
                                    const modes = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                                    const nextIndex = Math.min(currentStepIndex + 1, modes.length - 1);
                                    updateOrderStatus(user.id, order.id, modes[nextIndex]);
                                    window.location.reload();
                                }}
                                className="w-full py-2 text-[8px] font-black uppercase tracking-widest border border-dashed border-slate-200 text-slate-400 rounded-lg"
                            >
                                Simulation: Next Stage
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
