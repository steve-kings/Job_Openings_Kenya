import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MessageSquare, Pin, ArrowUp, Eye, ArrowLeft, Plus, Clock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'All Discussions | Job Openings Kenya Community',
    description: 'Browse every discussion in the Job Openings Kenya community — career advice, interview experiences, scholarships, and more.',
};

export const revalidate = 60;

interface ThreadRow {
    id: string; title: string; created_at: string;
    upvotes: number; comment_count: number; views: number; is_pinned: boolean;
    profiles?: { full_name?: string; avatar_url?: string };
    forum_categories?: { name?: string; color?: string };
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default async function AllThreadsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const params = await searchParams;
    const categoryId = typeof params.category === 'string' ? params.category : '';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('forum_threads')
        .select('*, forum_categories(name, icon, color), profiles(full_name, username, avatar_url)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data } = await query;
    const threads = (data || []) as ThreadRow[];

    let categoryName = '';
    if (categoryId) {
        const { data: cat } = await supabase.from('forum_categories').select('name').eq('id', categoryId).single();
        categoryName = cat?.name || '';
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-700 transition-colors mb-4">
                        <ArrowLeft size={15} /> Back to Community
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                {categoryName || 'All Discussions'}
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">{threads.length} {threads.length === 1 ? 'discussion' : 'discussions'}{categoryName ? ` in ${categoryName}` : ''}</p>
                        </div>
                        <Link href={user ? '/community/new' : '/login?redirect=/community/new'}
                            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm shrink-0 self-start">
                            <Plus size={16} /> Start a Discussion
                        </Link>
                    </div>
                </div>

                {/* Thread list */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {threads.length > 0 ? threads.map((thread) => {
                        const initials = thread.profiles?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                        const color = thread.forum_categories?.color || '#1976D2';
                        return (
                            <Link key={thread.id} href={`/community/${thread.id}`}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {thread.profiles?.avatar_url ? <img src={thread.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {thread.is_pinned && <span className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600"><Pin size={9} /> Pinned</span>}
                                        {thread.forum_categories?.name && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                                                {thread.forum_categories.name}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-[10px] text-slate-400"><Clock size={9} /> {timeAgo(thread.created_at)}</span>
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{thread.title}</h3>
                                </div>
                                <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 shrink-0">
                                    <span className="flex items-center gap-1"><ArrowUp size={11} /> {thread.upvotes}</span>
                                    <span className="flex items-center gap-1"><MessageSquare size={11} /> {thread.comment_count}</span>
                                    <span className="flex items-center gap-1"><Eye size={11} /> {thread.views}</span>
                                </div>
                            </Link>
                        );
                    }) : (
                        <div className="px-5 py-16 text-center text-slate-400">
                            <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">No discussions{categoryName ? ` in ${categoryName}` : ''} yet. Be the first!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
