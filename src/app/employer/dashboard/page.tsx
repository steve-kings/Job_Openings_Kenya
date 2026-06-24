'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Plus, Briefcase, Clock, CheckCircle2, XCircle, LogOut, Trash2,
    Calendar, MapPin, TrendingUp, Loader2, Home,
    Users, BarChart3, Sparkles, ExternalLink,
} from 'lucide-react';
import DashboardHeroSlider from '@/components/DashboardHeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

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
            {icons[status]}{status}
        </span>
    );
}

interface Submission {
    id: string;
    job_title: string;
    company_name: string;
    job_type: string;
    location: string;
    deadline?: string;
    status: string;
    created_at: string;
}

export default function EmployerDashboardPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<{ id: string; role: string; full_name?: string; avatar_url?: string } | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login?redirect=/employer/dashboard'); return; }
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profileData?.role !== 'employer' && profileData?.role !== 'admin') { router.push('/dashboard'); return; }
            setUser(user);
            setProfile(profileData);

            const query = profileData?.role === 'admin'
                ? supabase.from('employer_job_submissions').select('*').order('created_at', { ascending: false })
                : supabase.from('employer_job_submissions').select('*').eq('employer_id', user.id).order('created_at', { ascending: false });

            const { data } = await query;
            setSubmissions(data || []);
            setLoading(false);
        };
        init();
    }, [router, supabase]);

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this job posting? This cannot be undone.')) return;
        try {
            const { error } = await supabase.from('employer_job_submissions').delete().eq('id', id);
            if (error) throw error;
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to delete. You may not have permission.');
        }
    };

    const filtered = activeTab === 'all'
        ? submissions
        : submissions.filter(s => s.status === activeTab);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    const initials = (profile?.full_name || user?.email || 'E').charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ═══════ HERO WITH SLIDER ═══════ */}
            <section className="relative h-[320px] sm:h-[380px] overflow-hidden">
                <DashboardHeroSlider />

                {/* Employer profile overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                        <ScrollReveal variant="scale">
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="" fill unoptimized className="object-cover rounded-xl" />
                                    ) : initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl font-black text-slate-900">Employer Dashboard</h1>
                                    <p className="text-sm text-slate-500 mt-0.5">{profile?.full_name || user?.email} • Manage your job postings</p>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <Link href="/employer/post" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg">
                                        <Plus size={16} /> Post New Job
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats */}
                <ScrollReveal variant="fade" delay={100}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: 'Total Posted', value: stats.total, icon: Briefcase, color: 'emerald' },
                            { label: 'Live / Active', value: stats.approved, icon: CheckCircle2, color: 'green' },
                            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'amber' },
                            { label: 'Approval Rate', value: `${approvalRate}%`, icon: TrendingUp, color: 'indigo' },
                        ].map(({ label, value, icon: Icon, color }, i) => (
                            <ScrollReveal key={label} delay={150 + i * 80} variant="scale">
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                        <div className={`w-9 h-9 rounded-xl bg-${color}-50 flex items-center justify-center`}>
                                            <Icon size={18} className={`text-${color}-600`} />
                                        </div>
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </ScrollReveal>

                {/* Pipeline + Quick Links */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <ScrollReveal variant="slide" delay={200} className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
                                    <BarChart3 size={18} className="text-emerald-500" /> Approval Pipeline
                                </h2>
                                <div className="flex gap-1">
                                    {['all', 'pending', 'approved', 'rejected'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                                activeTab === tab ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {stats.total > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center gap-0 h-3 rounded-full overflow-hidden bg-slate-100">
                                        {stats.approved > 0 && <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(stats.approved / stats.total) * 100}%` }} />}
                                        {stats.pending > 0 && <div className="h-full bg-amber-400 transition-all" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />}
                                        {stats.rejected > 0 && <div className="h-full bg-red-400 transition-all" style={{ width: `${(stats.rejected / stats.total) * 100}%` }} />}
                                    </div>
                                    <div className="flex items-center gap-5 mt-2 text-[11px] font-semibold text-slate-500">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{stats.approved} approved</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />{stats.pending} pending</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />{stats.rejected} rejected</span>
                                    </div>
                                </div>
                            )}
                            {filtered.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm font-medium">No submissions yet</p>
                                    <Link href="/employer/post" className="text-xs font-bold text-emerald-600 hover:underline mt-1 inline-block">Post your first job →</Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filtered.slice(0, 8).map(sub => (
                                        <div key={sub.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                                                {sub.company_name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-slate-900 truncate">{sub.job_title}</p>
                                                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                                    <span>{sub.company_name}</span>
                                                    <span className="flex items-center gap-1"><MapPin size={10} />{sub.location}</span>
                                                </div>
                                            </div>
                                            <StatusBadge status={sub.status} />
                                            <button onClick={() => handleDelete(sub.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete submission">
                                                <XCircle size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollReveal>

                    {/* Quick Links */}
                    <ScrollReveal variant="slide" direction="right" delay={300}>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <h3 className="font-extrabold text-slate-900 text-sm">Quick Links</h3>
                            {[
                                { href: '/employer/post', icon: Plus, label: 'Post a New Job', color: 'emerald' },
                                { href: '/talent', icon: Users, label: 'Browse Talent', color: 'blue' },
                                { href: '/', icon: Briefcase, label: 'View Job Board', color: 'violet' },
                            ].map(({ href, icon: Icon, label, color }) => (
                                <Link key={href} href={href}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                >
                                    <div className={`w-9 h-9 rounded-lg bg-${color}-50 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                        <Icon size={18} className={`text-${color}-600`} />
                                    </div>
                                    <span className="font-semibold text-sm text-slate-700">{label}</span>
                                    <ExternalLink size={13} className="ml-auto text-slate-300" />
                                </Link>
                            ))}
                            <hr className="border-slate-100" />
                            <button
                                onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors w-full group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                                    <LogOut size={18} className="text-red-500" />
                                </div>
                                <span className="font-semibold text-sm text-red-600">Sign Out</span>
                            </button>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
