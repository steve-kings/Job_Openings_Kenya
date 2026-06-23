import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageSquare, TrendingUp, Clock, Pin, ArrowRight, Plus, Users, Eye, ArrowUp, Rocket, GraduationCap, DollarSign, Mic, MessageCircle, Trophy } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata: Metadata = {
    title: 'Community Forum | Job Openings Kenya',
    description: 'Join the community. Ask career questions, share interview experiences, and connect with other Kenyan job seekers.',
};

export const revalidate = 60;

export default async function ForumPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: categories }, { data: recentThreads }, { data: stats }] = await Promise.all([
        supabase.from('forum_categories').select('*, forum_threads(count)').order('name'),
        supabase.from('forum_threads').select('*, forum_categories(name, icon, color), profiles(full_name, username, avatar_url)').order('created_at', { ascending: false }).limit(10),
        supabase.from('forum_threads').select('id, upvotes, comment_count, views'),
    ]);

    const totalThreads = stats?.length || 0;
    const totalComments = stats?.reduce((s, t) => s + (t.comment_count || 0), 0) || 0;
    const totalMembers = [...new Set(recentThreads?.map(t => t.profiles?.full_name).filter(Boolean))].length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ═══════ HERO ═══════ */}
            <section className="relative overflow-hidden min-h-[320px] sm:min-h-[380px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <ScrollReveal>
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white mb-4">
                                    <MessageSquare size={13} /> Community Forum
                                </div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-lg">Ask. Share. Grow.</h1>
                                <p className="mt-3 text-white/70 max-w-lg leading-relaxed">
                                    Get career advice, share interview experiences, and connect with thousands of Kenyan job seekers.
                                </p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal direction="right">
                            {user ? (
                                <Link href="/community/new"
                                    className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-3 rounded-xl font-extrabold text-sm hover:bg-gray-100 transition-all shadow-xl">
                                    <Plus size={18} /> Start a Discussion
                                </Link>
                            ) : (
                                <Link href="/login?redirect=/community"
                                    className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white px-5 py-3 rounded-xl font-extrabold text-sm hover:bg-white/20 transition-all">
                                    Login to Join
                                </Link>
                            )}
                        </ScrollReveal>
                    </div>

                    {/* Stats row */}
                    <ScrollReveal delay={150}>
                        <div className="flex items-center gap-8 sm:gap-12 mt-10 pt-6 border-t border-white/10">
                            {[
                                { value: totalThreads, label: 'Discussions', icon: MessageSquare },
                                { value: totalComments, label: 'Replies', icon: ArrowUp },
                                { value: totalMembers, label: 'Members', icon: Users },
                            ].map(({ value, label, icon: Icon }) => (
                                <div key={label} className="flex items-center gap-2.5">
                                    <Icon size={15} className="text-white/40" />
                                    <div>
                                        <p className="text-xl font-black text-white">{value}</p>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Categories + Threads */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Categories */}
                        <ScrollReveal>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900 mb-4">Browse by Topic</h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {categories?.map((cat) => {
                                        const iconMap: Record<string, React.ReactNode> = {
                                            'Career Advice': <Rocket size={20} />,
                                            'Scholarships': <GraduationCap size={20} />,
                                            'Grants & Funding': <DollarSign size={20} />,
                                            'Interview Experiences': <Mic size={20} />,
                                            'General Discussion': <MessageCircle size={20} />,
                                            'Success Stories': <Trophy size={20} />,
                                        };
                                        const IconEl = iconMap[cat.name] || <MessageSquare size={20} />;
                                        return (
                                        <Link key={cat.id} href={`/community/category/${cat.id}`}
                                            className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: `${(cat as unknown as {color?:string}).color || '#1976D2'}15`, color: (cat as unknown as {color?:string}).color || '#1976D2' }}>
                                                {IconEl}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">{cat.name}</h3>
                                                {cat.description && (
                                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-black text-slate-300 group-hover:text-emerald-500 transition-colors">
                                                    {cat.forum_threads?.[0]?.count || 0}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400">threads</p>
                                            </div>
                                        </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Recent Threads */}
                        <ScrollReveal delay={100}>
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                        <Clock size={17} className="text-emerald-500" /> Recent Discussions
                                    </h2>
                                    <Link href="/community/all" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                        View all <ArrowRight size={12} />
                                    </Link>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                                    {recentThreads && recentThreads.length > 0 ? recentThreads.map((thread) => {
                                        const initials = thread.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                                        return (
                                            <Link key={thread.id} href={`/community/${thread.id}`}
                                                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
                                                {/* Author avatar */}
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                                                    {thread.profiles?.avatar_url ? (
                                                        <img src={thread.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        {thread.is_pinned && (
                                                            <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600"><Pin size={9} /> Pinned</span>
                                                        )}
                                                        {thread.forum_categories && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                                style={{ backgroundColor: `${(thread.forum_categories as unknown as {color?:string}).color || '#1976D2'}15`, color: (thread.forum_categories as unknown as {color?:string}).color || '#1976D2' }}>
                                                                {(thread.forum_categories as unknown as {name?:string}).name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{thread.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                                                    <span className="flex items-center gap-1"><ArrowUp size={11} /> {thread.upvotes}</span>
                                                    <span className="flex items-center gap-1"><MessageSquare size={11} /> {thread.comment_count}</span>
                                                    <span className="flex items-center gap-1"><Eye size={11} /> {thread.views}</span>
                                                </div>
                                            </Link>
                                        );
                                    }) : (
                                        <div className="px-5 py-16 text-center text-slate-400">
                                            <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No discussions yet. Be the first!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-5">
                        {/* CTA Card */}
                        <ScrollReveal direction="right" variant="scale">
                            {!user ? (
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                                    <MessageSquare size={28} className="mb-3 opacity-80" />
                                    <h3 className="font-extrabold text-lg mb-1">Join the Community!</h3>
                                    <p className="text-white/70 text-sm mb-5">Ask questions, share experiences, and help others on their career journey.</p>
                                    <Link href="/login?redirect=/community"
                                        className="block text-center bg-white text-emerald-700 font-extrabold text-sm py-2.5 rounded-xl hover:bg-gray-100 transition-all">
                                        Login to Participate
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl p-6">
                                    <MessageSquare size={28} className="mb-3 text-emerald-500" />
                                    <h3 className="font-extrabold text-slate-900 mb-1">Share Your Experience!</h3>
                                    <p className="text-slate-500 text-sm mb-5">Help others by sharing what you know about careers in Kenya.</p>
                                    <Link href="/community/new"
                                        className="block text-center bg-emerald-600 text-white font-extrabold text-sm py-2.5 rounded-xl hover:bg-emerald-700 transition-all">
                                        Start a Discussion
                                    </Link>
                                </div>
                            )}
                        </ScrollReveal>

                        {/* Guidelines */}
                        <ScrollReveal direction="right" delay={100}>
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <h3 className="font-extrabold text-sm text-slate-900 mb-3">📋 Community Guidelines</h3>
                                <ul className="space-y-2.5">
                                    {[
                                        'Be respectful and supportive',
                                        'Share genuine experiences',
                                        'Keep discussions career-focused',
                                        'No spam or self-promotion',
                                        'Help others — what goes around comes around!',
                                    ].map((g, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
                                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5">{i + 1}</span>
                                            {g}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            <div className="h-8" />
        </div>
    );
}
