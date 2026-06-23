'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Briefcase, FileText, User, Mail, Calendar, Award,
    LogOut, Search, CheckCircle2, BellRing, TrendingUp,
    ArrowRight, Bookmark, Sparkles, MapPin, Clock, ExternalLink,
} from 'lucide-react';
import DashboardHeroSlider from '@/components/DashboardHeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

function getRoleDisplay(role: string) {
    if (role === 'admin') return 'Admin';
    if (role === 'employer') return 'Employer';
    return 'Job Seeker';
}

interface Profile {
    id: string;
    role: string;
    full_name?: string;
    avatar_url?: string;
    headline?: string;
    location?: string;
    created_at: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ opportunities: 0, blogPosts: 0, partners: 0, applications: 0, savedSearches: 0 });
    const [recentJobs, setRecentJobs] = useState<{ id: string; title: string; company: string; type: string; location: string; created_at: string }[]>([]);
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login?redirect=/dashboard');
                return;
            }

            setUser(user);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData?.role === 'admin') {
                router.push('/admin');
                return;
            }

            if (profileData?.role === 'employer') {
                router.push('/employer/dashboard');
                return;
            }

            setProfile(profileData);

            const [oppCount, postCount, partnerCount, appCount, recent] = await Promise.all([
                supabase.from('opportunities').select('count').eq('status', 'active'),
                supabase.from('blog_posts').select('count').eq('status', 'published'),
                supabase.from('partners').select('count'),
                supabase.from('applications').select('count').eq('user_id', user.id),
                supabase.from('opportunities').select('id,title,company,type,location,created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
            ]);

            const { count: savedCount } = await supabase
                .from('saved_searches')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            setStats({
                opportunities: oppCount.data?.[0]?.count || 0,
                blogPosts: postCount.data?.[0]?.count || 0,
                partners: partnerCount.data?.[0]?.count || 0,
                applications: appCount.data?.[0]?.count || 0,
                savedSearches: savedCount || 0,
            });

            setRecentJobs((recent.data || []) as typeof recentJobs);

            setLoading(false);
        };

        init();
    }, [router, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-5 text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ═══════ HERO WITH SLIDER ═══════ */}
            <section className="relative h-[420px] sm:h-[480px] overflow-hidden">
                <DashboardHeroSlider />

                {/* Profile card overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                        <ScrollReveal variant="scale">
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0 overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="" fill unoptimized className="object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">Welcome back, {userName} 👋</h1>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                                        {profile?.headline && <span>{profile.headline}</span>}
                                        {profile?.location && (
                                            <span className="flex items-center gap-1"><MapPin size={13} />{profile.location}</span>
                                        )}
                                        <span className="flex items-center gap-1"><Calendar size={13} />Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <Link href="/dashboard/profile" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors">
                                        Edit Profile
                                    </Link>
                                    <button onClick={handleSignOut} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Sign Out">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* ═══════ STATS ═══════ */}
                <ScrollReveal variant="fade" delay={100}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                        {[
                            { label: 'Live Jobs', value: stats.opportunities, icon: Briefcase, color: 'emerald', href: '/' },
                            { label: 'My Applications', value: stats.applications, icon: CheckCircle2, color: 'blue', href: '/dashboard/applications' },
                            { label: 'Saved Jobs', value: stats.applications, icon: Bookmark, color: 'amber', href: '/dashboard/saved' },
                            { label: 'Job Alerts', value: stats.savedSearches, icon: BellRing, color: 'violet', href: '/dashboard/saved-searches' },
                            { label: 'Articles', value: stats.blogPosts, icon: FileText, color: 'rose', href: '/blog' },
                        ].map(({ label, value, icon: Icon, color, href }, i) => (
                            <ScrollReveal key={label} delay={150 + i * 80} variant="scale">
                                <Link
                                    href={href}
                                    className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3 overflow-hidden"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={20} className={`text-${color}-600`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{label}</p>
                                    </div>
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-${color}-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </ScrollReveal>

                {/* ═══════ RECENT JOBS + QUICK ACTIONS ═══════ */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Jobs */}
                    <div className="lg:col-span-2">
                        <ScrollReveal variant="fade" delay={200}>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                    <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
                                        <Sparkles size={18} className="text-amber-500" /> Latest Opportunities
                                    </h2>
                                    <Link href="/" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                        View all <ArrowRight size={13} />
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {recentJobs.length > 0 ? recentJobs.map((job, i) => (
                                        <ScrollReveal key={job.id} delay={250 + i * 60} variant="fade">
                                            <Link
                                                href={`/jobs/${job.id}`}
                                                className="flex items-center gap-4 px-5 py-4 hover:bg-emerald-50/50 transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-black text-sm shrink-0">
                                                    {job.company.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{job.title}</h3>
                                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1"><Briefcase size={11} />{job.company}</span>
                                                        {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${job.type === 'Job' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                                                        {job.type}
                                                    </span>
                                                    <p className="text-[10px] text-slate-400 mt-1">
                                                        <Clock size={9} className="inline mr-0.5" />
                                                        {Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000) || 0}d ago
                                                    </p>
                                                </div>
                                            </Link>
                                        </ScrollReveal>
                                    )) : (
                                        <div className="px-5 py-10 text-center text-slate-400">
                                            <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No jobs to show yet</p>
                                            <Link href="/" className="text-xs font-bold text-emerald-600 hover:underline mt-1 inline-block">Browse jobs →</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                        <ScrollReveal variant="slide" direction="right" delay={300}>
                            <h2 className="font-extrabold text-slate-900 mb-1">Quick Actions</h2>
                        </ScrollReveal>
                        {[
                            { href: '/', icon: Search, label: 'Browse All Jobs', sub: `${stats.opportunities} active listings`, color: 'emerald' },
                            { href: '/dashboard/applications', icon: CheckCircle2, label: 'My Applications', sub: 'Track your progress', color: 'blue' },
                            { href: '/dashboard/saved', icon: Bookmark, label: 'Saved Jobs', sub: 'Your bookmarked jobs', color: 'amber' },
                            { href: '/dashboard/profile', icon: User, label: 'Update Profile', sub: 'Get noticed by employers', color: 'violet' },
                        ].map(({ href, icon: Icon, label, sub, color }, i) => (
                            <ScrollReveal key={href} delay={350 + i * 80} variant="slide" direction="right">
                                <Link
                                    href={href}
                                    className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={20} className={`text-${color}-600`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-slate-900">{label}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>

                {/* ═══════ PROFILE COMPLETION ═══════ */}
                <ScrollReveal variant="scale" delay={500}>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-extrabold text-slate-900">Profile Overview</h2>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                {getRoleDisplay(profile?.role || 'student')}
                            </span>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { icon: User, label: 'Full Name', value: profile?.full_name || 'Not set' },
                                { icon: Mail, label: 'Email', value: user?.email || '' },
                                { icon: MapPin, label: 'Location', value: profile?.location || 'Not set' },
                                { icon: Calendar, label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                        <Icon className="text-slate-400" size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
