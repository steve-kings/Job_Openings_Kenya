'use client'

import { useState, useEffect, useMemo } from 'react';
import { Briefcase, FileText, Users, TrendingUp, Settings, ArrowRight, Sparkles, Clock, GraduationCap, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ScrollReveal from '@/components/ScrollReveal';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ opps: 0, posts: 0, users: 0, partners: 0, activeOpps: 0, publishedPosts: 0 });
    const [recent, setRecent] = useState<{ opps: Array<Record<string,unknown>>; posts: Array<Record<string,unknown>>; users: Array<Record<string,unknown>> }>({ opps: [], posts: [], users: [] });
    const [chartData, setChartData] = useState<Array<Record<string,unknown>>>([]);
    const [pieData, setPieData] = useState<Array<{name:string;value:number;color:string}>>([]);
    const [loading, setLoading] = useState(true);
    const supabase = useMemo(() => createClient(), []);

    const computeAgo = (createdAt: string) => {
        const s = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
        if (s < 60) return 'Just now';
        if (s < 3600) return `${Math.floor(s/60)}m ago`;
        if (s < 86400) return `${Math.floor(s/3600)}h ago`;
        return new Date(createdAt).toLocaleDateString();
    };

    useEffect(() => {
        (async () => {
            const [o, p, u, pt] = await Promise.all([
                supabase.from('opportunities').select('count'),
                supabase.from('blog_posts').select('count'),
                supabase.from('profiles').select('count'),
                supabase.from('partners').select('count'),
            ]);
            const [{ data: ao }, { data: pp }] = await Promise.all([
                supabase.from('opportunities').select('count').eq('status','active'),
                supabase.from('blog_posts').select('count').eq('status','published'),
            ]);

            const currentOpps = o.data?.[0]?.count || 0;
            const currentPosts = p.data?.[0]?.count || 0;
            const currentUsers = u.data?.[0]?.count || 0;
            const currentPartners = pt.data?.[0]?.count || 0;

            setStats({
                opps: currentOpps,
                posts: currentPosts,
                users: currentUsers,
                partners: currentPartners,
                activeOpps: ao?.[0]?.count || 0,
                publishedPosts: pp?.[0]?.count || 0,
            });

            const [ro, rp, ru] = await Promise.all([
                supabase.from('opportunities').select('id,title,type,status,created_at').order('created_at',{ascending:false}).limit(5),
                supabase.from('blog_posts').select('id,title,status,category,created_at').order('created_at',{ascending:false}).limit(5),
                supabase.from('profiles').select('id,full_name,email,role,created_at').order('created_at',{ascending:false}).limit(5),
            ]);
            setRecent({
                opps: (ro.data||[]).map(r => ({...r, _ago: computeAgo(String(r.created_at))})),
                posts: (rp.data||[]).map(r => ({...r, _ago: computeAgo(String(r.created_at))})),
                users: (ru.data||[]).map(r => ({...r, _ago: computeAgo(String(r.created_at))})),
            });

            // Chart — last 6 months placeholder
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const now = new Date();
            const trend: Array<Record<string,unknown>> = [];
            for (let i = 5; i >= 0; i--) {
                const t = new Date(now.getFullYear(), now.getMonth() - i, 1);
                trend.push({ name: months[t.getMonth()], Opportunities: 0, Users: 0 });
            }
            setChartData(trend);

            // Pie
            const { data: all } = await supabase.from('opportunities').select('type');
            const tc: Record<string,number> = {};
            (all||[]).forEach((x:{type:string}) => { tc[x.type] = (tc[x.type]||0) + 1; });
            setPieData([
                { name:'Jobs', value: tc['Job']||0, color: '#10b981' },
                { name:'Training', value: tc['Training']||0, color: '#8b5cf6' },
            ].filter(x => x.value > 0));

            setLoading(false);
        })();
    }, [supabase]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-5 text-slate-400 text-sm font-medium">Loading dashboard...</p>
            </div>
        </div>
    );

    const statCards = [
        { label: 'Opportunities', value: stats.opps, sub: `${stats.activeOpps} active`, icon: Briefcase, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { label: 'Blog Posts', value: stats.posts, sub: `${stats.publishedPosts} published`, icon: FileText, gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600' },
        { label: 'Users', value: stats.users, sub: 'Registered members', icon: Users, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600' },
        { label: 'Partners', value: stats.partners, sub: 'Active organizations', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <ScrollReveal>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back — here&apos;s what&apos;s happening</p>
                </div>
            </ScrollReveal>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, sub, icon: Icon, gradient, bg, text }, i) => (
                    <ScrollReveal key={label} delay={100 + i * 80} variant="scale">
                        <div className="group relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={18} className={text} />
                                </div>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                            <p className="text-xs text-slate-400 mt-1">{sub}</p>
                        </div>
                    </ScrollReveal>
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
                <ScrollReveal delay={200} className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full">
                        <h3 className="text-sm font-extrabold text-slate-900 mb-1">Platform Overview</h3>
                        <p className="text-xs text-slate-400 mb-6">Monthly trend</p>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" dataKey="Opportunities" stroke="#10b981" strokeWidth={2.5} fill="url(#c1)" />
                                    <Area type="monotone" dataKey="Users" stroke="#6366f1" strokeWidth={2.5} fill="url(#c2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={250} variant="scale">
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 h-full">
                        <h3 className="text-sm font-extrabold text-slate-900 mb-1">Opportunity Mix</h3>
                        <p className="text-xs text-slate-400 mb-4">Jobs vs Training</p>
                        <div className="h-[220px] flex items-center justify-center">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                            {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-slate-400 text-sm">No data yet</p>
                            )}
                        </div>
                        <div className="flex justify-center gap-5 mt-3">
                            {pieData.map(e => (
                                <div key={e.name} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} /> {e.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Quick Actions */}
            <ScrollReveal delay={300}>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2"><Sparkles size={16} className="text-emerald-500" /> Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {[
                            { href: '/admin/opportunities/create', label: 'Add Opportunity', icon: Briefcase, c: 'emerald' },
                            { href: '/admin/blog/create', label: 'Write Blog Post', icon: FileText, c: 'violet' },
                            { href: '/admin/courses/create', label: 'Add Course', icon: GraduationCap, c: 'blue' },
                            { href: '/admin/partners/create', label: 'Add Partner', icon: Users, c: 'amber' },
                            { href: '/admin/settings', label: 'Settings', icon: Settings, c: 'slate' },
                        ].map(({ href, label, icon: Icon, c }) => (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 p-3.5 rounded-xl bg-${c}-50 hover:bg-${c}-100 transition-all group`}>
                                <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                    <Icon size={17} className={`text-${c}-600`} />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </ScrollReveal>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                {[
                    { title: 'Recent Opportunities', data: recent.opps, icon: Briefcase, href: '/admin/opportunities', c: 'emerald',
                        render: (r: Record<string,unknown>) => (
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 text-sm truncate">{String(r.title)}</p>
                                <div className="flex gap-1.5 mt-1">
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">{String(r.type)}</span>
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">{String(r.status)}</span>
                                </div>
                            </div>
                        )
                    },
                    { title: 'Recent Posts', data: recent.posts, icon: FileText, href: '/admin/blog', c: 'violet',
                        render: (r: Record<string,unknown>) => (
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 text-sm truncate">{String(r.title)}</p>
                                <div className="flex gap-1.5 mt-1">
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700">{String(r.category||'General')}</span>
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">{String(r.status)}</span>
                                </div>
                            </div>
                        )
                    },
                    { title: 'New Members', data: recent.users, icon: Users, href: '/admin/members', c: 'blue',
                        render: (r: Record<string,unknown>) => (
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 text-sm truncate">{String(r.full_name||'Anonymous')}</p>
                                <div className="flex gap-1.5 mt-1">
                                    <span className="text-xs text-slate-400 truncate">{String(r.email||'')}</span>
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">{String(r.role||'user')}</span>
                                </div>
                            </div>
                        )
                    },
                ].map(({ title, data, icon: Icon, href, c, render }, i) => (
                    <ScrollReveal key={title} delay={350 + i * 80} variant="fade">
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
                                <div className={`w-7 h-7 rounded-lg bg-${c}-50 flex items-center justify-center`}>
                                    <Icon size={14} className={`text-${c}-500`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {data.length > 0 ? data.map((r: Record<string,unknown>, i: number) => (
                                    <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                        {render(r)}
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 mt-0.5">
                                            <Clock size={9} />{String((r as Record<string,unknown>)._ago)}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-slate-300">
                                        <Icon size={28} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-xs font-medium">Nothing yet</p>
                                    </div>
                                )}
                            </div>
                            <Link href={href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                View all <ArrowRight size={12} />
                            </Link>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
        </div>
    );
}
