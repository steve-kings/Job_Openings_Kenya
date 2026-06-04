'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus, Briefcase, Clock, CheckCircle2, XCircle, LogOut,
    Building2, Calendar, MapPin, TrendingUp, Loader2, Home
} from 'lucide-react';

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

export default function EmployerDashboardPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/employer/dashboard');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData?.role !== 'employer' && profileData?.role !== 'admin') {
                router.push('/dashboard');
                return;
            }

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
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#5CB800]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar + Main layout */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 min-h-screen flex-col p-6">
                    <div className="mb-8">
                        <img src="/job_openings_kenya_logo.jpeg" alt="Job Openings Kenya" className="h-12 w-auto object-contain mb-4" />
                        <h2 className="text-lg font-bold text-gray-900">Employer Portal</h2>
                        <p className="text-xs text-gray-500 mt-1">{profile?.full_name || user?.email}</p>
                    </div>
                    <nav className="flex-1 space-y-1">
                        {[
                            { href: '/employer/dashboard', label: 'Dashboard', icon: Building2, active: true },
                            { href: '/employer/post', label: 'Post a Job', icon: Plus },
                            { href: '/talent', label: 'Search Resumes', icon: Briefcase },
                            { href: '/', label: 'Browse Jobs', icon: TrendingUp },
                        ].map(({ href, label, icon: Icon, active }) => (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active ? 'bg-[#5CB800]/10 text-[#5CB800]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Icon size={20} className={active ? 'text-[#5CB800]' : 'text-gray-400'} />
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className="space-y-2 pt-6 border-t border-gray-100">
                        <Link href="/" className="btn btn-outline border-gray-200 text-gray-600 hover:bg-gray-50 w-full gap-2 btn-sm">
                            <Home size={14} /> Back to Home
                        </Link>
                        <button onClick={handleSignOut} className="btn bg-red-50 text-red-600 hover:bg-red-100 border-none w-full gap-2 btn-sm">
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-5xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#5CB800] to-[#4A9900] text-white p-8 rounded-3xl shadow-xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">Employer Dashboard</h1>
                                <p className="text-white/80 mt-1">Manage your job postings on Job Openings Kenya</p>
                            </div>
                            <Link href="/employer/post" className="btn bg-white text-[#5CB800] hover:bg-gray-50 border-none gap-2 shadow-lg font-bold">
                                <Plus size={20} /> Post New Job
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Posted', value: stats.total, color: '#5CB800', icon: Briefcase },
                            { label: 'Pending Review', value: stats.pending, color: '#F59E0B', icon: Clock },
                            { label: 'Live / Active', value: stats.approved, color: '#5CB800', icon: CheckCircle2 },
                            { label: 'Rejected', value: stats.rejected, color: '#EF4444', icon: XCircle },
                        ].map(({ label, value, color, icon: Icon }) => (
                            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-gray-600 font-medium">{label}</p>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                                        <Icon size={16} style={{ color }} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-gray-900">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Submissions Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">My Job Postings</h2>
                            <Link href="/employer/post" className="btn btn-sm bg-[#5CB800] text-white border-none hover:bg-[#4A9900] gap-2">
                                <Plus size={14} /> New Posting
                            </Link>
                        </div>

                        {submissions.length === 0 ? (
                            <div className="p-16 text-center">
                                <Briefcase size={56} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No job postings yet</h3>
                                <p className="text-gray-500 mb-6">Post your first job and reach thousands of Kenyan job seekers</p>
                                <Link href="/employer/post" className="btn bg-[#5CB800] text-white border-none hover:bg-[#4A9900] gap-2">
                                    <Plus size={18} /> Post Your First Job
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title</th>
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Deadline</th>
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {submissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 truncate max-w-[200px]">{sub.job_title}</p>
                                                        <p className="text-sm text-gray-500">{sub.company_name}</p>
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{sub.job_type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                                        <MapPin size={14} className="text-gray-400" /> {sub.location}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 hidden lg:table-cell">
                                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {sub.deadline ? new Date(sub.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Rolling'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={sub.status} />
                                                    {sub.status === 'pending' && (
                                                        <p className="text-xs text-gray-400 mt-1">Reviewing within 24h</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                                                    {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
