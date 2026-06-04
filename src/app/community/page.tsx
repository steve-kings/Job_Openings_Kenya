import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageSquare, TrendingUp, Clock, Pin, ArrowRight, Plus } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Community Forum | Job Openings Kenya - Career Q&A for Kenyan job seekers',
    description: 'Join the Job Openings Kenya community forum. Ask career questions, share interview experiences, discuss scholarships and connect with other Kenyan job seekers.',
};

export const revalidate = 60;

export default async function ForumPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: categories }, { data: recentThreads }] = await Promise.all([
        supabase
            .from('forum_categories')
            .select('*, forum_threads(count)')
            .order('name'),
        supabase
            .from('forum_threads')
            .select('*, forum_categories(name, icon, color), profiles(full_name, username, avatar_url)')
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-[#4A9900] via-[#5CB800] to-[#5CB800] text-white py-16">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                <MessageSquare size={16} />
                                Community Forum
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black mb-3">Ask. Share. Grow.</h1>
                            <p className="text-white/85 text-lg max-w-xl">
                                Get career advice, share interview experiences, discuss opportunities and connect with thousands of Kenyan job seekers on their career journeys.
                            </p>
                        </div>
                        {user ? (
                            <Link
                                href="/community/new"
                                className="btn bg-[#5CB800] hover:bg-[#4A9900] text-white border-none btn-lg gap-2 shadow-2xl"
                            >
                                <Plus size={22} />
                                Start a Discussion
                            </Link>
                        ) : (
                            <Link href="/login?redirect=/community" className="btn bg-white text-[#5CB800] border-none btn-lg font-bold shadow-2xl hover:bg-gray-100">
                                Login to Join
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: categories + recent threads */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Categories */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Topic</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {categories?.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/community/category/${cat.id}`}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 group-hover:text-[#5CB800] transition-colors">{cat.name}</h3>
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{cat.description}</p>
                                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                                    {cat.forum_threads?.[0]?.count || 0} discussions
                                                </p>
                                            </div>
                                            <ArrowRight size={18} className="text-gray-300 group-hover:text-[#5CB800] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent Threads */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Clock size={20} className="text-[#5CB800]" /> Recent Discussions</h2>
                                <Link href="/community/all" className="text-sm text-[#5CB800] font-semibold hover:underline">View all →</Link>
                            </div>
                            <div className="space-y-3">
                                {recentThreads && recentThreads.length > 0 ? recentThreads.map((thread) => {
                                    const initials = thread.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
                                    const timeAgo = (date: string) => {
                                        const diff = Date.now() - new Date(date).getTime();
                                        const mins = Math.floor(diff / 60000);
                                        if (mins < 60) return `${mins}m ago`;
                                        const hrs = Math.floor(mins / 60);
                                        if (hrs < 24) return `${hrs}h ago`;
                                        return `${Math.floor(hrs / 24)}d ago`;
                                    };
                                    return (
                                        <Link
                                            key={thread.id}
                                            href={`/community/${thread.id}`}
                                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#5CB800]/30 transition-all group flex items-start gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#5CB800] flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    {thread.is_pinned && <span className="flex items-center gap-1 text-xs font-bold text-orange-500"><Pin size={11} /> Pinned</span>}
                                                    {thread.forum_categories && (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${thread.forum_categories.color}20`, color: thread.forum_categories.color }}>
                                                            {thread.forum_categories.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-[#5CB800] transition-colors line-clamp-2">{thread.title}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                    <span>by <span className="font-semibold text-gray-600">{thread.profiles?.full_name || 'Anonymous'}</span></span>
                                                    <span>{timeAgo(thread.created_at)}</span>
                                                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {thread.comment_count}</span>
                                                    <span className="flex items-center gap-1"><TrendingUp size={12} /> {thread.upvotes}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                }) : (
                                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
                                        <MessageSquare size={48} className="text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No discussions yet. Be the first!</p>
                                        {user && (
                                            <Link href="/community/new" className="btn bg-[#5CB800] text-white border-none mt-4 btn-sm">
                                                Start a Discussion
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* CTA */}
                        {!user ? (
                            <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] rounded-2xl p-6 text-white">
                                <h3 className="font-bold text-xl mb-2">Join the Community!</h3>
                                <p className="text-white/80 text-sm mb-4">Ask questions, share experiences and help other students navigate their career journey.</p>
                                <Link href="/login?redirect=/community" className="btn bg-white text-[#5CB800] border-none w-full font-bold hover:bg-gray-100">
                                    Login to Participate
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-[#5CB800]/10 to-[#5CB800]/5 border border-[#5CB800]/20 rounded-2xl p-6">
                                <h3 className="font-bold text-gray-900 mb-2">Share Your Experience!</h3>
                                <p className="text-sm text-gray-600 mb-4">Help other students by sharing what you know.</p>
                                <Link href="/community/new" className="btn bg-[#5CB800] text-white border-none w-full gap-2 hover:bg-[#4A9900]">
                                    <Plus size={18} /> Start a Discussion
                                </Link>
                            </div>
                        )}

                        {/* Guidelines */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">📋 Community Guidelines</h3>
                            <ul className="space-y-2.5 text-sm text-gray-600">
                                {[
                                    'Be respectful and supportive to fellow members',
                                    'Share genuine experiences and verified information',
                                    'Keep discussions relevant to careers & opportunities',
                                    'No spamming, self-promotion or advertisements',
                                    'Help others — what goes around comes around!',
                                ].map((g, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="w-5 h-5 bg-[#5CB800]/10 rounded-full flex items-center justify-center text-[#5CB800] text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        {g}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Link to Talent Directory */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-2">🌟 Talent Directory</h3>
                            <p className="text-sm text-gray-600 mb-4">Create a public profile and get discovered by employers!</p>
                            <Link href="/talent" className="btn bg-[#5CB800] text-white border-none w-full hover:bg-[#4A9900] text-sm">
                                Browse Talent →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
