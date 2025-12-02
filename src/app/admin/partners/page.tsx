'use client'

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminPartnersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPartners(data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this partner?')) return;

        try {
            const { error } = await supabase
                .from('partners')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchPartners();
        } catch (error) {
            console.error('Error deleting partner:', error);
            alert('Error deleting partner');
        }
    };

    const filteredPartners = partners.filter(partner =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Manage Partners</h1>
                    <p className="text-gray-600">Add and manage partner organizations and sponsors</p>
                </div>
                <Link href="/admin/partners/create" className="btn btn-primary gap-2">
                    <Plus size={20} />
                    Add New Partner
                </Link>
            </div>

            {/* Search */}
            <div className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                    <div className="form-control">
                        <div className="input-group">
                            <span className="bg-base-200">
                                <Search size={20} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search partners..."
                                className="input input-bordered w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-8">Loading partners...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Logo</th>
                                        <th>Name</th>
                                        <th>Website</th>
                                        <th>Date Added</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPartners.map((partner) => (
                                        <tr key={partner.id}>
                                            <td>
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img src={partner.logo_url || 'https://via.placeholder.com/50'} alt={partner.name} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-medium">{partner.name}</td>
                                            <td>
                                                {partner.website_url && (
                                                    <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="link link-hover flex items-center gap-1 text-sm">
                                                        Visit <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </td>
                                            <td className="text-sm text-gray-600">{new Date(partner.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/partners/${partner.id}`} className="btn btn-ghost btn-xs" title="Edit">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(partner.id)}
                                                        className="btn btn-ghost btn-xs text-error"
                                                        title="Delete"
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

                    {!loading && filteredPartners.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No partners found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
