'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, BellRing, Search, Trash2, Loader2, AlertCircle,
    CheckCircle2, Mail, MapPin, Briefcase
} from 'lucide-react';

interface SavedSearch {
    id: string;
    email: string;
    query: string;
    type: string;
    location: string;
    notify_email: boolean;
    created_at: string;
}

export default function SavedSearchesPage() {
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const fetchSearches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/saved-searches');
            const data = await res.json();
            if (res.ok) setSearches(data.searches || []);
        } catch {
            showToast('error', 'Failed to load saved searches');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSearches();
    }, [fetchSearches]);

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this job alert?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSearches(prev => prev.filter(s => s.id !== id));
                showToast('success', 'Alert removed');
            } else {
                showToast('error', 'Failed to remove');
            }
        } catch {
            showToast('error', 'Network error');
        } finally {
            setDeletingId('');
        }
    };

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700 transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Job Alerts</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your saved search alerts and email notifications.</p>
                </div>

                {/* Toast */}
                {toast && (
                    <div className={`mb-5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold ${
                        toast.type === 'success'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {toast.msg}
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-emerald-600" />
                    </div>
                ) : !searches.length ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <BellRing className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No job alerts yet</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6 max-w-md mx-auto">
                            Save a search from the homepage to get email alerts when matching jobs are posted.
                        </p>
                        <Link href="/" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                            <Search size={14} /> Create an Alert
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {searches.map(s => (
                            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                                <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <Mail size={10} /> Email Alert
                                            </span>
                                            {s.notify_email && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-gray-700">
                                            {s.query && (
                                                <span className="flex items-center gap-1.5">
                                                    <Search size={14} className="text-gray-400" />
                                                    {s.query}
                                                </span>
                                            )}
                                            {s.type && s.type !== 'All' && (
                                                <span className="flex items-center gap-1.5">
                                                    <Briefcase size={14} className="text-gray-400" />
                                                    {s.type}
                                                </span>
                                            )}
                                            {s.location && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {s.location}
                                                </span>
                                            )}
                                            {!s.query && !s.type && !s.location && (
                                                <span className="text-gray-400 italic">All opportunities</span>
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 font-medium">
                                            <Mail size={12} />
                                            {s.email}
                                            <span className="text-gray-200">|</span>
                                            Saved {formatDate(s.created_at)}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        disabled={deletingId === s.id}
                                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
