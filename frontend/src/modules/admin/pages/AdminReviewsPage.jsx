import React, { useState, useEffect } from 'react';
import { 
    Star, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    MessageSquare,
    Loader,
    Search
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Pending, Approved, Rejected
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            // Assuming admin token is handled by cookie/context automatically
            const res = await fetch(`${API_URL}/reviews/admin`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            } else {
                toast.error('Failed to fetch reviews');
            }
        } catch (error) {
            toast.error('Error loading reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}/reviews/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });
            
            if (res.ok) {
                toast.success(`Review ${newStatus}`);
                setReviews(reviews.map(r => r._id === id ? { ...r, status: newStatus } : r));
            } else {
                toast.error('Update failed');
            }
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}/reviews/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                toast.success('Review deleted');
                setReviews(reviews.filter(r => r._id !== id));
            } else {
                toast.error('Delete failed');
            }
        } catch (error) {
            toast.error('Error deleting review');
        }
    };

    const filteredReviews = reviews.filter(r => {
        const matchesStatus = filter === 'All' || r.status === filter;
        const matchesSearch = 
            r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.comment?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        }
    };

    return (
        <div className="space-y-8 font-['Inter']">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Reviews Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Approve/Reject User Reviews</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search product, user..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-1 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12"><Loader className="animate-spin text-gray-300 mx-auto" /></div>
            ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-gray-300 font-bold uppercase text-xs tracking-widest">No reviews found</div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Rating</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Comment</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredReviews.map((review) => (
                                <tr key={review._id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 p-1">
                                                <img src={review.product?.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-footerBg">{review.product?.name || 'Unknown Product'}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-600">{review.user?.name || 'Anonymous'}</div>
                                        <div className="text-[10px] text-gray-400">{review.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star size={14} fill="currentColor" />
                                            <span className="text-xs font-black">{review.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        {review.title && <p className="text-xs font-bold text-gray-700 mb-0.5">{review.title}</p>}
                                        <p className="text-[11px] text-gray-500 line-clamp-2">{review.comment}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(review.status)}`}>
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {review.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(review._id, 'Approved')}
                                                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(review._id, 'Rejected')}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(review._id)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminReviewsPage;
