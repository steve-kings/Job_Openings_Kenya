'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Briefcase, Calendar, MapPin, ExternalLink,
    Loader2, Trash2, Columns, List
} from 'lucide-react';
import { formatDaysRemaining } from '@/lib/utils/jobs';

interface Application {
    id: string;
    status: string;
    notes: string;
    applied_at: string;
    updated_at: string;
    opportunity: {
        id: string;
        title: string;
        company: string;
        type: string;
        location: string;
        deadline: string | null;
        apply_url: string;
        salary_min?: number;
        salary_max?: number;
        salary_currency?: string;
    };
}

const KANBAN_COLS = [
    { key: 'applied', label: 'Applied', color: 'border-l-blue-500 bg-blue-50/30' },
    { key: 'interviewing', label: 'Interviewing', color: 'border-l-amber-500 bg-amber-50/30' },
    { key: 'offered', label: 'Offered', color: 'border-l-emerald-500 bg-emerald-50/30' },
    { key: 'rejected', label: 'Rejected', color: 'border-l-red-500 bg-red-50/30' },
];

const statusMeta: Record<string, { label: string; bg: string; text: string }> = {
    applied: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-700' },
    interviewing: { label: 'Interviewing', bg: 'bg-amber-50', text: 'text-amber-700' },
    offered: { label: 'Offered', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700' },
    saved: { label: 'Saved', bg: 'bg-gray-50', text: 'text-gray-600' },
};

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
    const [updatingId, setUpdatingId] = useState('');
    const [deletingId, setDeletingId] = useState('');

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/applications');
            const data = await res.json();
            if (res.ok) setApplications(data.applications || []);
        } catch { /* ignore */ } finally { setLoading(false); }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            }
        } catch { /* ignore */ } finally { setUpdatingId(''); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this application?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
            if (res.ok) setApplications(prev => prev.filter(a => a.id !== id));
        } catch { /* ignore */ } finally { setDeletingId(''); }
    };

    const totalApps = applications.length;
    const interviewCount = applications.filter(a => a.status === 'interviewing').length;
    const offerCount = applications.filter(a => a.status === 'offered').length;

    const renderApplicationCard = (app: Application) => {
        const opp = app.opportunity;
        const daysLeft = opp.deadline
            ? Math.ceil((new Date(opp.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null;
        const deadlineText = daysLeft === null ? 'Rolling Basis' : daysLeft < 0 ? 'Expired' : formatDaysRemaining(daysLeft);
        const meta = statusMeta[app.status] || statusMeta.applied;

        return (
            <div key={app.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 group">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.bg} ${meta.text}`}>
                        {meta.label}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            disabled={updatingId === app.id}
                            className="text-[10px] font-bold px-1.5 py-1 rounded border border-gray-200 bg-white text-gray-600 outline-none cursor-pointer"
                        >
                            {Object.entries(statusMeta).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                        <button onClick={() => handleDelete(app.id)} disabled={deletingId === app.id}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                            {deletingId === app.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                    </div>
                </div>
                <Link href={`/jobs/${opp.id}`} className="block">
                    <h4 className="font-bold text-sm text-gray-900 hover:text-emerald-700 transition-colors line-clamp-2">{opp.title}</h4>
                </Link>
                <p className="text-xs text-gray-500 mt-1 font-medium">{opp.company}</p>
                <div className="flex items-center gap-x-2 gap-y-1 mt-2 text-[10px] text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10} />{opp.location}</span>
                    <span className={`flex items-center gap-1 ${daysLeft !== null && daysLeft < 0 ? 'text-red-600' : ''}`}><Calendar size={10} />{deadlineText}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Applied {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <a href={opp.apply_url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                        Apply <ExternalLink size={9} />
                    </a>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700 transition-colors mb-3">
                            <ArrowLeft size={16} /> Dashboard
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Applications</h1>
                        <p className="text-sm text-gray-500 mt-1">Track every opportunity you apply to</p>
                    </div>

                    {/* Stats + View Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="text-center">
                                <p className="font-extrabold text-gray-900 text-lg">{totalApps}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="text-center">
                                <p className="font-extrabold text-amber-600 text-lg">{interviewCount}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Interview</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="text-center">
                                <p className="font-extrabold text-emerald-600 text-lg">{offerCount}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Offers</p>
                            </div>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setViewMode('kanban')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                <Columns size={16} />
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {!applications.length ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                            <Briefcase className="text-gray-400" size={28} />
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900">No applications yet</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6 max-w-md mx-auto">
                            When you click &quot;I&apos;ve Applied&quot; on a job listing, it appears here so you can track your progress.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm">
                            Browse Opportunities <ExternalLink size={14} />
                        </Link>
                    </div>
                ) : viewMode === 'kanban' ? (
                    /* ── Kanban Board ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {KANBAN_COLS.map(col => {
                            const colApps = applications.filter(a => a.status === col.key);
                            return (
                                <div key={col.key} className={`rounded-2xl border-l-4 ${col.color} p-4 min-h-[200px]`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-extrabold text-gray-700">{col.label}</h3>
                                        <span className="text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full">{colApps.length}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {colApps.map(renderApplicationCard)}
                                        {colApps.length === 0 && (
                                            <div className="text-center py-8 text-xs text-gray-400">
                                                Drop applications here
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── List View ── */
                    <div className="space-y-3">
                        {applications.map(renderApplicationCard)}
                    </div>
                )}
            </div>
        </div>
    );
}
