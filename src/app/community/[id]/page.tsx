'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Loader2, ArrowUp, Clock } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

interface Profile { full_name?: string; username?: string; avatar_url?: string; }
interface Thread {
    id: string; title: string; content: string; created_at: string;
    upvotes: number; comment_count: number; views: number; is_locked: boolean;
    profiles?: Profile; forum_categories?: { icon: string; name: string; color?: string };
}
interface Comment {
    id: string; content: string; created_at: string; upvotes: number; profiles?: Profile;
}

export default function ThreadDetailPage() {
    const { id } = useParams<{ id: string }>();
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    const [user, setUser] = useState<{ id: string } | null>(null);
    const [thread, setThread] = useState<Thread | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            const [{ data: threadData }, { data: commentsData }] = await Promise.all([
                supabase.from('forum_threads').select('*, forum_categories(name, icon, color), profiles(full_name, username, avatar_url)').eq('id', id).single(),
                supabase.from('forum_comments').select('*, profiles(full_name, username, avatar_url)').eq('thread_id', id).order('created_at', { ascending: true }),
            ]);
            setThread(threadData);
            setComments(commentsData || []);
            if (user) {
                const { data: votes } = await supabase.from('forum_votes').select('thread_id, comment_id').eq('user_id', user.id);
                setUserVotes(new Set(votes?.map(v => v.thread_id || v.comment_id).filter(Boolean) as string[]));
            }
            try { await supabase.rpc('increment_thread_views', { thread_id: id }); } catch {}
            setLoading(false);
        };
        init();
    }, [id, supabase]);

    const handleVote = async (targetId: string, isThread: boolean, currentVotes: number) => {
        if (!user) { router.push('/login?redirect=/community/' + id); return; }
        if (userVotes.has(targetId)) return;
        const table = isThread ? 'forum_threads' : 'forum_comments';
        const field = isThread ? 'thread_id' : 'comment_id';
        await supabase.from('forum_votes').insert({ user_id: user.id, [field]: targetId, vote_type: 'up' });
        await supabase.from(table).update({ upvotes: currentVotes + 1 }).eq('id', targetId);
        if (isThread) setThread(t => t ? { ...t, upvotes: t.upvotes + 1 } : null);
        else setComments(prev => prev.map(c => c.id === targetId ? { ...c, upvotes: c.upvotes + 1 } : c));
        setUserVotes(prev => new Set([...prev, targetId]));
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !user) return;
        setSubmittingComment(true);
        try {
            const { data: comment, error } = await supabase.from('forum_comments').insert({
                thread_id: id, user_id: user.id, content: newComment.trim(),
            }).select('*, profiles(full_name, username, avatar_url)').single();
            if (error) throw error;
            setComments(prev => [...prev, { ...comment, upvotes: 0 }]);
            await supabase.from('forum_threads').update({ comment_count: (thread?.comment_count || 0) + 1 }).eq('id', id);
            setThread(t => t ? { ...t, comment_count: t.comment_count + 1 } : null);
            setNewComment('');
        } catch (err) { console.error('Failed to post comment:', err); }
        finally { setSubmittingComment(false); }
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const getInitials = (name?: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>;
    if (!thread) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-500">Thread not found.</p></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="relative overflow-hidden min-h-[220px] sm:min-h-[260px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <Link href="/community" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white mb-4 text-sm font-medium transition-colors">
                        <ArrowLeft size={15} /> Back to Community
                    </Link>
                    {thread.forum_categories && (
                        <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold mb-3">
                            {thread.forum_categories.icon} {thread.forum_categories.name}
                        </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-lg max-w-3xl">{thread.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-white/60">
                        <span>by <span className="text-white font-bold">{thread.profiles?.full_name || 'Anonymous'}</span></span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>{timeAgo(thread.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="flex items-center gap-1"><MessageSquare size={13} /> {thread.comment_count} replies</span>
                        <span className="flex items-center gap-1"><ArrowUp size={13} /> {thread.upvotes} upvotes</span>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Original post */}
                <ScrollReveal>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                                    {thread.profiles?.avatar_url ? (
                                        <img src={thread.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : getInitials(thread.profiles?.full_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="font-extrabold text-sm text-slate-900">{thread.profiles?.full_name || 'Anonymous'}</p>
                                        <span className="text-xs text-slate-400">{timeAgo(thread.created_at)}</span>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">{thread.content}</div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 sm:px-8 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center gap-4">
                            <button onClick={() => handleVote(thread.id, true, thread.upvotes)}
                                disabled={userVotes.has(thread.id)}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                    userVotes.has(thread.id) ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-600'
                                }`}>
                                <ArrowUp size={13} /> {thread.upvotes}
                            </button>
                            {thread.is_locked && <span className="text-xs text-amber-600 font-bold ml-auto">🔒 Thread locked</span>}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Comments */}
                {comments.length > 0 && (
                    <div className="space-y-3">
                        <ScrollReveal><h3 className="font-extrabold text-slate-900">{comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}</h3></ScrollReveal>
                        {comments.map((comment, i) => (
                            <ScrollReveal key={comment.id} delay={i * 50}>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                                            {getInitials(comment.profiles?.full_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <p className="font-extrabold text-sm text-slate-900">{comment.profiles?.full_name || 'Anonymous'}</p>
                                                <span className="text-xs text-slate-400">{timeAgo(comment.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                            <button onClick={() => handleVote(comment.id, false, comment.upvotes)}
                                                disabled={userVotes.has(comment.id)}
                                                className={`mt-3 flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-all ${
                                                    userVotes.has(comment.id) ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
                                                }`}>
                                                <ArrowUp size={11} /> {comment.upvotes}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}

                {/* Reply form */}
                <ScrollReveal delay={200}>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                        <h3 className="font-extrabold text-sm text-slate-900 mb-3">Leave a Reply</h3>
                        {user ? (
                            <div className="flex items-start gap-3">
                                <textarea
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                    disabled={thread.is_locked}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 resize-none disabled:opacity-50"
                                />
                                <button onClick={handlePostComment} disabled={submittingComment || !newComment.trim() || thread.is_locked}
                                    className="shrink-0 p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40">
                                    {submittingComment ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-500 mb-3">Sign in to join the conversation</p>
                                <Link href={`/login?redirect=/community/${id}`}
                                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">
                                    Login to Reply
                                </Link>
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </div>

            <div className="h-12" />
        </div>
    );
}
