import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    ShieldOff,
    ShieldCheck,
    Mail,
    Phone,
    ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import Pagination from '../components/Pagination';

const UsersPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Fetch Users
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            return res.json();
        }
    });

    // Fetch Orders to calculate stats
    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/api/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        }
    });

    // Calculate user metrics
    const usersWithStats = useMemo(() => {
        return users.map(user => {
            const userOrders = orders.filter(o => o.user?._id === user._id || o.userId === user._id); // flexible match
            const totalSpend = userOrders.reduce((acc, o) => acc + (o.totalPrice || o.amount || 0), 0);
            return {
                ...user,
                totalOrders: userOrders.length,
                totalSpend
            };
        });
    }, [users, orders]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredUsers = useMemo(() => {
        return usersWithStats
            .filter(user => {
                const matchesSearch =
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phone?.includes(searchTerm);

                const matchesStatus =
                    statusFilter === 'All' ||
                    (statusFilter === 'Active' && !user.isBlocked) ||
                    (statusFilter === 'Blocked' && user.isBlocked);

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => b.id?.localeCompare(a.id) || 0);
    }, [usersWithStats, searchTerm, statusFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleToggleBlock = async (userId) => {
        // Placeholder for API call
        // await axios.put(`http://localhost:5000/api/users/${userId}/block`);
        // queryClient.invalidateQueries(['users']);
        toast.error('Block/Unblock feature requires API implementation.');
    };

    const stats = [
        { label: 'Total Registered', value: users.length, icon: ShieldCheck },
        { label: 'Active Today', value: users.filter(u => !u.isBlocked).length, icon: Eye },
        { label: 'Flagged / Restricted', value: users.filter(u => u.isBlocked).length, icon: ShieldOff }
    ];

    return (
        <div className="space-y-8 text-left">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">User CRM</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage customer profiles and account security</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        <span className="text-[10px] font-bold text-footerBg uppercase tracking-widest">{users.filter(u => !u.isBlocked).length} Active Residents</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gray-50 text-footerBg rounded-2xl flex items-center justify-center border border-gray-100`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">{stat.label}</p>
                            <p className="text-2xl font-black text-footerBg text-left">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold focus:bg-white focus:border-primary outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['All', 'Active', 'Blocked'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl border border-gray-100 hover:bg-white hover:text-primary transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Orders</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Spend</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 text-footerBg rounded-xl flex items-center justify-center font-black text-sm border border-gray-100 group-hover:bg-footerBg group-hover:text-white transition-all">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-footerBg">{user.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">ID: #{user.id?.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                <Mail size={12} className="text-gray-400" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
                                                <Phone size={12} className="text-gray-400" />
                                                {user.phone || 'No phone'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.isBlocked
                                            ? 'bg-red-50 text-red-600 border border-red-100'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            }`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-black text-footerBg border border-gray-100">
                                            {user.totalOrders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-left">
                                        <p className="font-black text-footerBg text-sm tracking-tight">₹{user.totalSpend.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/users/${user.id}`)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleBlock(user.id)}
                                                className={`p-2 rounded-lg transition-all ${user.isBlocked
                                                    ? 'text-emerald-500 hover:bg-emerald-50'
                                                    : 'text-red-400 hover:bg-red-50'
                                                    }`}
                                                title={user.isBlocked ? 'Unblock User' : 'Block User'}
                                            >
                                                {user.isBlocked ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-dashed border-gray-200">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No users found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default UsersPage;
