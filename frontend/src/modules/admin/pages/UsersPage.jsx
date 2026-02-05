import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    ShieldOff,
    ShieldCheck,
    Mail,
    Phone,
    ArrowUpDown,
    Loader,
    Users as UsersIcon,
    CheckCircle2,
    AlertCircle,
    Coins
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const UsersPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Premium Dummy Data
    const DUMMY_USERS = [
        { id: 'u1', name: 'Kabir Singh', email: 'kabir.s@example.com', phone: '+91 98765 43210', isBlocked: false, totalOrders: 12, totalSpend: 45200 },
        { id: 'u2', name: 'Ananya Sharma', email: 'ananya.sh@gmail.com', phone: '+91 91234 56789', isBlocked: false, totalOrders: 5, totalSpend: 15600 },
        { id: 'u3', name: 'Rahul Malhotra', email: 'rahul.m@outlook.com', phone: '+91 88888 77777', isBlocked: true, totalOrders: 0, totalSpend: 0 },
        { id: 'u4', name: 'Priya Verma', email: 'p.verma@example.com', phone: '+91 77776 55555', isBlocked: false, totalOrders: 28, totalSpend: 125400 },
        { id: 'u5', name: 'Ishaan Gupta', email: 'ishaan.g@gmail.com', phone: '+91 99900 11122', isBlocked: false, totalOrders: 8, totalSpend: 24300 },
        { id: 'u6', name: 'Meera Rajput', email: 'meera.r@tata.com', phone: '+91 95555 44433', isBlocked: false, totalOrders: 15, totalSpend: 56900 },
        { id: 'u7', name: 'Aditya Das', email: 'aditya.d@yahoo.com', phone: '+91 82222 33311', isBlocked: false, totalOrders: 3, totalSpend: 8900 },
        { id: 'u8', name: 'Sanya Mirza', email: 'sanya.m@company.in', phone: '+91 70000 12345', isBlocked: true, totalOrders: 1, totalSpend: 2100 },
        { id: 'u9', name: 'Vikram Seth', email: 'v.seth@reliance.com', phone: '+91 91111 22233', isBlocked: false, totalOrders: 10, totalSpend: 31200 },
        { id: 'u10', name: 'Zoya Khan', email: 'zoya.k@gmail.com', phone: '+91 90000 00001', isBlocked: false, totalOrders: 6, totalSpend: 18400 }
    ];

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const usersWithStats = useMemo(() => {
        return DUMMY_USERS.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                u.phone.includes(debouncedSearch);
            const matchesStatus = statusFilter === 'All' ||
                (statusFilter === 'Active' && !u.isBlocked) ||
                (statusFilter === 'Blocked' && u.isBlocked);
            return matchesSearch && matchesStatus;
        });
    }, [debouncedSearch, statusFilter]);

    // Paginate dummy data
    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * limit;
        return usersWithStats.slice(start, start + limit);
    }, [usersWithStats, page]);

    const totalPages = Math.ceil(usersWithStats.length / limit);

    const handleToggleBlock = (userId) => {
        toast.success('User status updated successfully (Demo Mode)');
    };

    return (
        <div className="space-y-8 font-['Inter']">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">User Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage customer profiles and security</p>
                </div>
                <div className="bg-[#2c5336]/5 px-4 py-2 rounded-xl border border-[#2c5336]/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#2c5336] rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-[#2c5336] uppercase tracking-[0.1em]">Local Database Active</span>
                </div>
            </div>

            {/* Compact Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Residents</p>
                            <p className="text-2xl font-black text-footerBg">{DUMMY_USERS.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UsersIcon size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Accounts</p>
                            <p className="text-2xl font-black text-footerBg">{DUMMY_USERS.filter(u => !u.isBlocked).length}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={22} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Restricted</p>
                            <p className="text-2xl font-black text-footerBg">{DUMMY_USERS.filter(u => u.isBlocked).length}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <AlertCircle size={22} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-[#2c5336] transition-all"
                    />
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {['All', 'Active', 'Blocked'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-white text-[#2c5336] shadow-sm' : 'text-gray-400 hover:text-footerBg'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead>Customer Info</AdminTableHead>
                        <AdminTableHead>Contact Access</AdminTableHead>
                        <AdminTableHead>Status</AdminTableHead>
                        <AdminTableHead className="text-center">Orders</AdminTableHead>
                        <AdminTableHead>Total Revenue</AdminTableHead>
                        <AdminTableHead className="text-right">Actions</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {paginatedUsers.map((user) => (
                            <AdminTableRow key={user.id}>
                                <AdminTableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-50 text-footerBg rounded-xl flex items-center justify-center font-black text-xs border border-gray-100 uppercase">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-footerBg text-sm">{user.name || 'Anonymous User'}</p>
                                        </div>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 lowercase">
                                            <Mail size={12} className="text-gray-300" />
                                            {user.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            <Phone size={12} className="text-gray-300" />
                                            {user.phone || 'No Contact Number'}
                                        </div>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${user.isBlocked
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {user.isBlocked ? 'Blocked' : 'Verified'}
                                    </span>
                                </AdminTableCell>
                                <AdminTableCell className="text-center">
                                    <span className="bg-gray-50 px-3 py-1 rounded-lg text-[11px] font-black text-footerBg border border-gray-100">
                                        {user.totalOrders}
                                    </span>
                                </AdminTableCell>
                                <AdminTableCell>
                                    <div className="flex items-center gap-1.5 font-black text-footerBg text-sm tracking-tight">
                                        <Coins size={14} className="text-amber-400" />
                                        ₹{user.totalSpend.toLocaleString()}
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => navigate(`/admin/users/${user.id}`)}
                                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all"
                                            title="View profile"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleBlock(user.id)}
                                            className={`p-1.5 rounded-lg transition-all ${user.isBlocked
                                                ? 'text-emerald-500 hover:bg-emerald-50'
                                                : 'text-red-400 hover:bg-red-50'
                                                }`}
                                            title={user.isBlocked ? 'Unblock user' : 'Block user'}
                                        >
                                            {user.isBlocked ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                                        </button>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        ))}
                        {paginatedUsers.length === 0 && (
                            <AdminTableRow>
                                <AdminTableCell colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <UsersIcon size={32} className="text-gray-100 mb-3" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">No customers found</p>
                                    </div>
                                </AdminTableCell>
                            </AdminTableRow>
                        )}
                    </AdminTableBody>
                </AdminTable>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                totalItems={usersWithStats.length}
                itemsPerPage={limit}
            />
        </div>
    );
};

export default UsersPage;
