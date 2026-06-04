'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, XCircle, Clock, Eye, Filter, Calendar, MapPin, Building2, Loader2, AlertCircle } from 'lucide-react';

type Status = 'all' | 'pending' | 'approved' | 'rejected';

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    const icons: Record<string, React.ReactNode> = {
        pending: <Clock size={12} />,
        approved: <CheckCircle2 size={12} />,
        rejected: <XCircle size={12} />,
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${map[status] || 'bg-gray-100 text-gray-600'} capitalize`}>
            {icons[status]}
            {status}
        </span>
    );
}

export default function AdminJobSubmissionsPage() {
    const supabase = createClient();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Status>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [viewSub, setViewSub] = useState<any | null>(null);

    const fetchSubmissions = async () => {
        const { data } = await supabase
            .from('employer_job_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        setSubmissions(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchSubmissions(); }, []);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleApprove = async (sub: any) => {
        setActionLoading(sub.id);
        try {
            // Create opportunity from submission
            const { error: oppError } = await supabase.from('opportunities').insert({
                title: sub.job_title,
                type: 'Job',
                company: sub.company_name,
                location: sub.location,
                deadline: sub.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                apply_url: sub.apply_url,
                short_description: sub.short_description,
                description: sub.description,
                thumbnail_url: sub.logo_url || null,
                requirements: sub.requirements ? sub.requirements.split('\n').filter(Boolean) : [],
                status: 'active',
            });
            if (oppError) throw oppError;

            // Update submission status
            await supabase.from('employer_job_submissions').update({ status: 'approved' }).eq('id', sub.id);

            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'approved' } : s));
            setViewSub(null);
            showToast('success', `"${sub.job_title}" approved and published to opportunities!`);
        } catch (err: any) {
            showToast('error', err.message || 'Failed to approve submission');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (sub: any) => {
        setActionLoading(`reject-${sub.id}`);
        try {
            await supabase.from('employer_job_submissions').update({ status: 'rejected' }).eq('id', sub.id);
            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'rejected' } : s));
            setViewSub(null);
            showToast('success', `"${sub.job_title}" rejected.`);
        } catch (err: any) {
            showToast('error', err.message || 'Failed to reject submission');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = filter === 'all' ? submissions : submissions.filter(s => s.status === filter);
    const counts = {
        all: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-[#5CB800]' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] text-white p-6 sm:p-8 rounded-2xl shadow-xl">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Employer Job Submissions</h1>
                <p className="text-white/80">Review and approve or reject employer job postings</p>
                {counts.pending > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-100 px-3 py-1.5 rounded-lg text-sm font-semibold">
                        <Clock size={14} /> {counts.pending} pending review
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as Status[]).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === s ? 'bg-[#5CB800] text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#5CB800] hover:text-[#5CB800]'}`}
                    >
                        {s} <span className="ml-1 opacity-70">({counts[s]})</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-16 text-center">
                        <Loader2 size={40} className="animate-spin text-[#5CB800] mx-auto" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No {filter === 'all' ? '' : filter} submissions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Company / Job</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Deadline</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900 truncate max-w-[220px]">{sub.job_title}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Building2 size={12} /> {sub.company_name}
                                                </p>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md mt-1 inline-block">{sub.job_type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-600">
                                            <span className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" />{sub.location}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-600">
                                            <span className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" />
                                                {sub.deadline ? new Date(sub.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Rolling'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-sm text-gray-500">
                                            {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setViewSub(sub)} className="btn btn-xs btn-outline border-gray-300 text-gray-600 gap-1">
                                                    <Eye size={12} /> View
                                                </button>
                                                {sub.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(sub)}
                                                            disabled={!!actionLoading}
                                                            className="btn btn-xs bg-[#5CB800] text-white border-none hover:bg-[#4A9900] gap-1"
                                                        >
                                                            {actionLoading === sub.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(sub)}
                                                            disabled={!!actionLoading}
                                                            className="btn btn-xs bg-red-100 text-red-700 border-none hover:bg-red-200 gap-1"
                                                        >
                                                            {actionLoading === `reject-${sub.id}` ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewSub && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewSub(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{viewSub.job_title}</h2>
                                <p className="text-gray-500">{viewSub.company_name} · {viewSub.location}</p>
                            </div>
                            <StatusBadge status={viewSub.status} />
                        </div>
                        <div className="p-6 space-y-4 text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Job Type</p><p>{viewSub.job_type}</p></div>
                                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Deadline</p><p>{viewSub.deadline || 'Rolling'}</p></div>
                                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Contact Email</p><p className="truncate">{viewSub.contact_email}</p></div>
                                <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Apply URL</p><a href={viewSub.apply_url} target="_blank" rel="noopener noreferrer" className="text-[#5CB800] underline truncate block">{viewSub.apply_url}</a></div>
                            </div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Short Description</p><p>{viewSub.short_description}</p></div>
                            <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Full Description</p><p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-xl">{viewSub.description}</p></div>
                            {viewSub.requirements && <div><p className="text-xs font-bold text-gray-400 uppercase mb-1">Requirements</p><p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-xl">{viewSub.requirements}</p></div>}
                        </div>
                        {viewSub.status === 'pending' && (
                            <div className="p-6 border-t border-gray-100 flex gap-3">
                                <button onClick={() => handleApprove(viewSub)} disabled={!!actionLoading} className="btn bg-[#5CB800] text-white border-none hover:bg-[#4A9900] flex-1 gap-2">
                                    {actionLoading === viewSub.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    Approve & Publish
                                </button>
                                <button onClick={() => handleReject(viewSub)} disabled={!!actionLoading} className="btn bg-red-100 text-red-700 border-none hover:bg-red-200 flex-1 gap-2">
                                    {actionLoading === `reject-${viewSub.id}` ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
