'use client'

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminOpportunitiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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
            setOpportunities(data || []);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) return;

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
        return opp.status === 'active' ? 'Active' : 'Draft'; // Assuming 'active' is the DB value
    };

    const filteredOpportunities = opportunities.filter(opp => {
        const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opp.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || opp.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Manage Opportunities</h1>
                    <p className="text-gray-600">Create, edit, and manage job postings, grants, scholarships, and trainings</p>
                </div>
                <Link href="/admin/opportunities/create" className="btn btn-primary gap-2">
                    <Plus size={20} />
                    Add New Opportunity
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="form-control flex-1">
                            <div className="input-group">
                                <span className="bg-base-200">
                                    <Search size={20} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search opportunities..."
                                    className="input input-bordered w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <select
                            className="select select-bordered w-full md:w-auto"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option>All</option>
                            <option>Job</option>
                            <option>Grant</option>
                            <option>Scholarship</option>
                            <option>Training</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Opportunities Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-8">Loading opportunities...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Deadline</th>
                                        <th>Status</th>
                                        <th>Views</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOpportunities.map((opp) => {
                                        const status = getStatus(opp);
                                        return (
                                            <tr key={opp.id}>
                                                <td className="font-medium max-w-xs truncate" title={opp.title}>{opp.title}</td>
                                                <td>
                                                    <span className={`badge badge-sm ${opp.type === 'Job' ? 'badge-primary' :
                                                        opp.type === 'Grant' ? 'badge-success' :
                                                            opp.type === 'Scholarship' ? 'badge-info' :
                                                                'badge-secondary'
                                                        }`}>
                                                        {opp.type}
                                                    </span>
                                                </td>
                                                <td className="text-sm">{opp.company}</td>
                                                <td className="text-sm text-gray-600">{opp.location}</td>
                                                <td className="text-sm">{new Date(opp.deadline).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge badge-sm ${status === 'Active' ? 'badge-success' :
                                                        status === 'Expired' ? 'badge-error' : 'badge-warning'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="text-sm text-gray-600">{opp.views || 0}</td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <Link href={`/admin/opportunities/${opp.id}`} className="btn btn-ghost btn-xs" title="Edit">
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(opp.id)}
                                                            className="btn btn-ghost btn-xs text-error"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
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
                        <div className="text-center py-8">
                            <p className="text-gray-500">No opportunities found matching your criteria.</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-6">
                        <p className="text-sm text-gray-600">Showing {filteredOpportunities.length} of {opportunities.length} opportunities</p>
                        <div className="btn-group">
                            <button className="btn btn-sm">«</button>
                            <button className="btn btn-sm btn-active">1</button>
                            <button className="btn btn-sm">»</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
