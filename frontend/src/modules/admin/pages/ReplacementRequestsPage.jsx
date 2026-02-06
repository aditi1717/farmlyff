import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    MessageSquare,
    IndianRupee,
    Truck,
    FileText,
    ArrowLeftRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from '../components/AdminTable';

const ReplacementRequestsPage = () => {
    const navigate = useNavigate();
    const DUMMY_REPLACEMENTS = [
        {
            id: '201',
            orderId: '6001',
            userName: 'Priya Verma',
            type: 'Replacement',
            reason: 'Wrong Color',
            requestDate: '2025-02-02T14:30:00Z',
            status: 'Approved',
        },
        {
            id: '202',
            orderId: '6002',
            userName: 'Neha Gupta',
            type: 'Replacement',
            reason: 'Defective',
            requestDate: '2025-02-04T12:00:00Z',
            status: 'Pending',
        },
        {
            id: '203',
            orderId: '6003',
            userName: 'Rahul Roy',
            type: 'Replacement',
            reason: 'Damaged',
            requestDate: '2025-02-06T09:00:00Z',
            status: 'Shipped',
        },
    ];

    // Fetch Replacements
    const { data: replacementsData = DUMMY_REPLACEMENTS } = useQuery({
        queryKey: ['replacements'],
        queryFn: async () => {
            try {
                const res = await fetch('http://localhost:5000/api/replacements');
                if (!res.ok) throw new Error('Failed to fetch replacements');
                const data = await res.json();
                return data.length > 0 ? data : DUMMY_REPLACEMENTS;
            } catch (error) {
                console.error("Fetch failed, using dummy data", error);
                return DUMMY_REPLACEMENTS;
            }
        }
    });

    // Update Status Mutation (Mock)
    const updateReturnStatus = useMutation({
        mutationFn: async ({ id, status }) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { id, status };
        },
        onSuccess: () => {
            toast.success('Replacement status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const allReplacements = useMemo(() => {
        if (Array.isArray(replacementsData)) {
            return [...replacementsData].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        }
        return [];
    }, [replacementsData]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredReplacements = useMemo(() => {
        return allReplacements.filter(ret => {
            const matchesSearch =
                ret.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ret.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ret.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || ret.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [allReplacements, searchTerm, statusFilter]);

    const paginatedReplacements = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredReplacements.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReplacements, currentPage]);

    const totalPages = Math.ceil(filteredReplacements.length / itemsPerPage);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed':
            case 'Shipped': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Approved': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const stats = [
        { label: 'Total Replacements', value: allReplacements.length, icon: ArrowLeftRight, color: 'bg-indigo-50 text-indigo-500' },
        { label: 'Pending', value: allReplacements.filter(r => r.status === 'Pending').length, icon: Clock, color: 'bg-amber-50 text-amber-500' },
        { label: 'Completed', value: allReplacements.filter(r => r.status === 'Completed').length, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-500' }
    ];

    return (
        <div className="space-y-8 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                    <h1 className="text-xl font-black text-footerBg uppercase tracking-tight">Replacement Management</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-[0.2em]">Manage Product Replacements & Exchanges</p>
                </div>
            </div>

            {/* Stats Overview */}
            {statusFilter === 'All' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black text-footerBg">{stat.value}</p>
                                </div>
                                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0`}>
                                    <stat.icon size={22} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 text-left">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, Order or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold outline-none focus:bg-white focus:border-primary transition-all"
                    />
                </div>
                {statusFilter === 'All' && (
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                            {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-footerBg'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Replacements Table */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <AdminTable>
                    <AdminTableHeader>
                        <AdminTableHead className="min-w-[140px] px-6 py-4">Replacement ID</AdminTableHead>
                        <AdminTableHead className="min-w-[120px] px-6 py-4">Order ID</AdminTableHead>
                        <AdminTableHead className="min-w-[160px] px-6 py-4">Customer</AdminTableHead>
                        <AdminTableHead className="min-w-[160px] px-6 py-4">Reason</AdminTableHead>
                        <AdminTableHead className="min-w-[140px] px-6 py-4">Request Date</AdminTableHead>
                        <AdminTableHead className="min-w-[140px] px-6 py-4">Status</AdminTableHead>
                        <AdminTableHead className="text-right min-w-[100px] px-6 py-4">Action</AdminTableHead>
                    </AdminTableHeader>
                    <AdminTableBody>
                        {paginatedReplacements.map((ret) => (
                            <AdminTableRow key={ret.id}>
                                <AdminTableCell className="font-bold text-xs text-footerBg select-all px-6 py-4">
                                    RPL-{ret.id?.toString().slice(-4).toUpperCase()}
                                </AdminTableCell>
                                <AdminTableCell className="font-bold text-xs text-gray-500 select-all px-6 py-4">
                                    ORD-{ret.orderId?.toString().slice(-4).toUpperCase()}
                                </AdminTableCell>
                                <AdminTableCell className="px-6 py-4">
                                    <span className="font-bold text-footerBg text-sm">{ret.userName}</span>
                                </AdminTableCell>
                                <AdminTableCell className="text-xs text-gray-600 font-medium truncate max-w-[150px] px-6 py-4">
                                    {ret.reason}
                                </AdminTableCell>
                                <AdminTableCell className="text-xs font-bold text-gray-500 px-6 py-4">
                                    {(new Date(ret.requestDate)).toLocaleDateString('en-GB')}
                                </AdminTableCell>
                                <AdminTableCell className="px-6 py-4">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusStyles(ret.status)}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{ret.status}</span>
                                    </div>
                                </AdminTableCell>
                                <AdminTableCell className="text-right px-6 py-4">
                                    <button
                                        onClick={() => navigate(`/admin/replacements/${ret.id}`)}
                                        className="px-3 py-1.5 bg-footerBg text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-footerBg/10"
                                    >
                                        View
                                    </button>
                                </AdminTableCell>
                            </AdminTableRow>
                        ))}
                        {paginatedReplacements.length === 0 && (
                            <AdminTableRow>
                                <AdminTableCell colSpan="7" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs opacity-50">
                                    No replacement requests found
                                </AdminTableCell>
                            </AdminTableRow>
                        )}
                    </AdminTableBody>
                </AdminTable>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    totalItems={filteredReplacements.length}
                    itemsPerPage={itemsPerPage}
                />
            </div>
        </div>
    );
};

export default ReplacementRequestsPage;
