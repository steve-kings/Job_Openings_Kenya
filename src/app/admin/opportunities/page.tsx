'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, TrendingUp, AlertCircle, CheckCircle, Clock, X, Building2, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Opp { id: string; title: string; type: string; company: string; location: string; deadline: string; status: string; views?: number; displayStatus?: string; }

export default function AdminOpportunitiesPage() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [opps, setOpps] = useState<Opp[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, draft: 0 });
    const s = useMemo(() => createClient(), []);

    const loadData = useCallback(async () => {
        const { data } = await s.from('opportunities').select('*').order('created_at', { ascending: false });
        const now = new Date();
        const list: Opp[] = (data || []).map(o => {
            // If deadline is explicitly set and past due, mark as Expired.
            // Null/empty deadline means "Rolling Basis" — never expires.
            const isExpired = o.deadline ? new Date(o.deadline) < now : false;
            const displayStatus = isExpired ? 'Expired'
                : o.status === 'active' ? 'Active'
                : o.status === 'draft' ? 'Draft'
                : o.status === 'inactive' ? 'Inactive'
                : o.status === 'closed' ? 'Closed'
                : o.status;
            return { ...o, displayStatus };
        });
        return list;
    }, [s]);

    const applyData = (list: Opp[]) => {
        const now = new Date();
        setOpps(list);
        setStats({
            total: list.length,
            active: list.filter(o => o.status === 'active' && (!o.deadline || new Date(o.deadline) >= now)).length,
            expired: list.filter(o => o.displayStatus === 'Expired').length,
            draft: list.filter(o => o.status === 'draft').length,
        });
        setLoading(false);
    };

    useEffect(() => { loadData().then(applyData); }, [loadData]);

    const del = async (id: string) => {
        if (!confirm('Delete this opportunity?')) return;
        await s.from('opportunities').delete().eq('id', id);
        loadData().then(applyData);
    };

    const filtered = opps.filter(o => {
        const m = o.title.toLowerCase().includes(search.toLowerCase()) || o.company.toLowerCase().includes(search.toLowerCase());
        const mt = typeFilter === 'All' || o.type === typeFilter;
        const ms = statusFilter === 'All' || o.displayStatus === statusFilter;
        return m && mt && ms;
    });

    const statCards = [
        { label: 'Total', value: stats.total, icon: TrendingUp, c: 'blue' },
        { label: 'Active', value: stats.active, icon: CheckCircle, c: 'emerald' },
        { label: 'Expired', value: stats.expired, icon: AlertCircle, c: 'red' },
        { label: 'Draft', value: stats.draft, icon: Clock, c: 'amber' },
    ];

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Opportunities</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{stats.total} total listing{stats.total !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/opportunities/create"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200">
                        <Plus size={16} /> Add New
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, c }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                            <div className={`w-9 h-9 rounded-xl bg-${c}-50 flex items-center justify-center`}><Icon size={18} className={`text-${c}-600`} /></div>
                        </div>
                        <p className="text-3xl font-black text-gray-900">{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search by title or company..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-emerald-500 bg-white">
                    <option value="All">All Types</option><option value="Job">Job</option><option value="Training">Training</option><option value="Banner">Banner</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-emerald-500 bg-white">
                    <option value="All">All Status</option><option value="Active">Active</option><option value="Draft">Draft</option><option value="Expired">Expired</option><option value="Inactive">Inactive</option><option value="Closed">Closed</option>
                </select>
            </div>

            {/* Listings */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-gray-50">
                    {filtered.map(o => {
                        const status = o.displayStatus;
                        const days = o.deadline ? Math.ceil((new Date(o.deadline).getTime() - new Date().getTime()) / 86400000) : null;
                        return (
                            <div key={o.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <Link href={`/admin/opportunities/${o.id}`} className="font-semibold text-gray-900 text-sm hover:text-emerald-700 line-clamp-2 flex-1">{o.title}</Link>
                                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${status === 'Active' ? 'bg-emerald-50 text-emerald-700' : status === 'Expired' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{status}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${o.type === 'Job' ? 'bg-emerald-50 text-emerald-700' : o.type === 'Training' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>{o.type}</span>
                                    <span className="flex items-center gap-1 min-w-0"><Building2 size={12} className="shrink-0" /> <span className="truncate">{o.company || '—'}</span></span>
                                    <span className="flex items-center gap-1 min-w-0"><MapPin size={12} className="shrink-0" /> <span className="truncate">{o.location || '—'}</span></span>
                                </div>
                                <div className="mt-2.5 flex items-center justify-between border-t border-gray-50 pt-2.5">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {o.deadline ? new Date(o.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : <span className="italic text-gray-400">Rolling</span>}
                                            {status === 'Active' && days !== null && days <= 7 && days >= 0 && <span className="font-bold text-red-500"> · {days}d</span>}
                                        </span>
                                        <span className="flex items-center gap-1"><Eye size={12} /> {o.views || 0}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Link href={`/admin/opportunities/${o.id}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit size={14} /></Link>
                                        <button onClick={() => del(o.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {['Title','Type','Company','Location','Deadline','Status','Views',''].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(o => {
                                const status = o.displayStatus;
                                const days = Math.ceil((new Date(o.deadline).getTime() - new Date().getTime()) / 86400000);
                                return (
                                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <Link href={`/admin/opportunities/${o.id}`} className="font-semibold text-gray-900 text-sm hover:text-emerald-700 transition-colors line-clamp-1 max-w-[200px]">{o.title}</Link>
                                        </td>
                                        <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${o.type === 'Job' ? 'bg-emerald-50 text-emerald-700' : o.type === 'Training' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>{o.type}</span></td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600 font-medium">{o.company}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500">{o.location}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-sm text-gray-600">
                                                {o.deadline ? new Date(o.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : <span className="text-gray-400 italic">Rolling</span>}
                                            </div>
                                            {status === 'Active' && o.deadline && days <= 7 && days >= 0 && <div className="text-[10px] font-bold text-red-500">{days}d left</div>}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${status === 'Active' ? 'bg-emerald-50 text-emerald-700' : status === 'Expired' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{status}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-400">{o.views || 0}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex gap-1">
                                                <Link href={`/admin/opportunities/${o.id}`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit size={14} /></Link>
                                                <button onClick={() => del(o.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">No opportunities found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                )}
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 font-medium">
                        Showing {filtered.length} of {opps.length} opportunities
                    </div>
                )}
            </div>
        </div>
    );
}
