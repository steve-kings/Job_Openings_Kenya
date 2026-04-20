'use client'

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Calendar, MapPin, Building2, TrendingUp, AlertCircle, CheckCircle, Clock, Share2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminOpportunitiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        expired: 0,
        draft: 0
    });
    const supabase = createClient();

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const { data, error } = await supabase
                .from('opportunities')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            const opps = data || [];
            setOpportunities(opps);
            
            // Calculate stats
            const today = new Date();
            const active = opps.filter(o => o.status === 'active' && new Date(o.deadline) >= today).length;
            const expired = opps.filter(o => new Date(o.deadline) < today).length;
            const draft = opps.filter(o => o.status === 'draft').length;
            
            setStats({
                total: opps.length,
                active,
                expired,
                draft
            });
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('opportunities')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchOpportunities();
        } catch (error) {
            console.error('Error deleting opportunity:', error);
            alert('Error deleting opportunity');
        }
    };

    const getStatus = (opp: any) => {
        const deadline = new Date(opp.deadline);
        const today = new Date();
        if (deadline < today) return 'Expired';
        return opp.status === 'active' ? 'Active' : 'Draft';
    };

    const filteredOpportunities = opportunities.filter(opp => {
        const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opp.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || opp.type === filterType;
        const status = getStatus(opp);
        const matchesStatus = filterStatus === 'All' || status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Opportunities</h1>
                    <p className="text-sm sm:text-base text-gray-600">Create, edit, and manage job postings, grants, scholarships, and trainings</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => {
                            const url = `${window.location.origin}/jobs?urgent=true`;
                            const text = `🚨 Urgent! Several opportunities are expiring in the next 3 days on 1000Jobs. Apply now before they close:\n\n${url}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="btn btn-sm sm:btn-md bg-[#25D366] text-white hover:bg-[#128C7E] border-none gap-2 w-full sm:w-auto shadow-md"
                        title="Share Expiring Opportunities via WhatsApp"
                    >
                        <Share2 size={18} />
                        Share Expiring
                    </button>
                    <Link href="/admin/opportunities/create" className="btn btn-sm sm:btn-md bg-[#1976D2] text-white hover:bg-[#1565C0] border-none gap-2 w-full sm:w-auto shadow-md">
                        <Plus size={18} />
                        Add New
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="card bg-white shadow-lg border-l-4 border-[#1976D2]">
                    <div className="card-body p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-[#1976D2] rounded-lg">
                                <TrendingUp className="text-white" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-white shadow-lg border-l-4 border-green-500">
                    <div className="card-body p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 font-medium">Active</p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-500 rounded-lg">
                                <CheckCircle className="text-white" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-white shadow-lg border-l-4 border-red-500">
                    <div className="card-body p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 font-medium">Expired</p>
                                <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.expired}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-red-500 rounded-lg">
                                <AlertCircle className="text-white" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-white shadow-lg border-l-4 border-yellow-500">
                    <div className="card-body p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-600 font-medium">Draft</p>
                                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.draft}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-yellow-500 rounded-lg">
                                <Clock className="text-white" size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="card bg-white shadow-lg mb-6">
                <div className="card-body p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div className="form-control flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search opportunities..."
                                    className="input input-bordered input-sm sm:input-md w-full pl-10 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                className="select select-bordered select-sm sm:select-md w-full sm:flex-1 text-sm"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option>All Types</option>
                                <option>Job</option>
                                <option>Grant</option>
                                <option>Scholarship</option>
                                <option>Training</option>
                            </select>
                            <select
                                className="select select-bordered select-sm sm:select-md w-full sm:flex-1 text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Expired</option>
                                <option>Draft</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Opportunities Table */}
            <div className="card bg-white shadow-xl">
                <div className="card-body p-0 sm:p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <span className="loading loading-spinner loading-lg text-[#1976D2]"></span>
                            <p className="mt-4 text-gray-600">Loading opportunities...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="table table-xs sm:table-sm lg:table-md">
                                <thead>
                                    <tr className="border-b-2">
                                        <th className="font-bold text-gray-700">Title</th>
                                        <th className="font-bold text-gray-700 hidden sm:table-cell">Type</th>
                                        <th className="font-bold text-gray-700 hidden md:table-cell">Company</th>
                                        <th className="font-bold text-gray-700 hidden lg:table-cell">Location</th>
                                        <th className="font-bold text-gray-700 hidden md:table-cell">Deadline</th>
                                        <th className="font-bold text-gray-700">Status</th>
                                        <th className="font-bold text-gray-700 hidden lg:table-cell">Views</th>
                                        <th className="font-bold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOpportunities.map((opp) => {
                                        const status = getStatus(opp);
                                        const daysUntilDeadline = Math.ceil((new Date(opp.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                        
                                        return (
                                            <tr key={opp.id} className="hover:bg-gray-50">
                                                <td className="font-medium max-w-[150px] sm:max-w-xs">
                                                    <div className="flex flex-col">
                                                        <span className="truncate text-xs sm:text-sm" title={opp.title}>{opp.title}</span>
                                                        <span className="text-[10px] sm:text-xs text-gray-500 sm:hidden">
                                                            {opp.type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="hidden sm:table-cell">
                                                    <span className={`badge badge-xs sm:badge-sm ${
                                                        opp.type === 'Job' ? 'bg-[#1976D2] text-white border-none' :
                                                        opp.type === 'Grant' ? 'badge-success' :
                                                        opp.type === 'Scholarship' ? 'badge-info' :
                                                        'badge-secondary'
                                                    }`}>
                                                        {opp.type}
                                                    </span>
                                                </td>
                                                <td className="hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={12} className="text-gray-400 hidden lg:block" />
                                                        <span className="text-xs sm:text-sm truncate max-w-[100px]">{opp.company}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden lg:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={12} className="text-gray-400" />
                                                        <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px]">{opp.location}</span>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            <span className="text-xs">{new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                        {status === 'Active' && daysUntilDeadline <= 7 && (
                                                            <span className="text-[10px] text-orange-600 font-medium">
                                                                {daysUntilDeadline}d left
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-xs sm:badge-sm ${
                                                        status === 'Active' ? 'badge-success' :
                                                        status === 'Expired' ? 'badge-error' : 
                                                        'badge-warning'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="hidden lg:table-cell">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Eye size={12} />
                                                        <span className="text-xs">{opp.views || 0}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Link 
                                                            href={`/admin/opportunities/${opp.id}`} 
                                                            className="btn btn-ghost btn-xs hover:bg-blue-50 hover:text-blue-600 p-1" 
                                                            title="Edit"
                                                        >
                                                            <Edit size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(opp.id)}
                                                            className="btn btn-ghost btn-xs hover:bg-red-50 hover:text-red-600 p-1"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filteredOpportunities.length === 0 && (
                        <div className="text-center py-12">
                            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 text-lg font-medium">No opportunities found</p>
                            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                        </div>
                    )}

                    {!loading && filteredOpportunities.length > 0 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{filteredOpportunities.length}</span> of <span className="font-semibold">{opportunities.length}</span> opportunities
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
