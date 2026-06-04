'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Loader2, Share2, Pin, Lock } from 'lucide-react';

export default function ThreadDetailPage() {
    const { id } = useParams<{ id: string }>();
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [thread, setThread] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
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
                const voted = new Set(votes?.map(v => v.thread_id || v.comment_id).filter(Boolean) as string[]);
                setUserVotes(voted);
            }

            // Increment views
            try { await supabase.rpc('increment_thread_views', { thread_id: id }); } catch {}

            setLoading(false);
        };
        init();
    }, [id]);

    const handleVoteThread = async () => {
        if (!user) { router.push('/login?redirect=/community/' + id); return; }
        if (userVotes.has(id)) return;

        await supabase.from('forum_votes').insert({ user_id: user.id, thread_id: id, vote_type: 'up' });
        await supabase.from('forum_threads').update({ upvotes: (thread.upvotes || 0) + 1 }).eq('id', id);
        setThread((t: any) => ({ ...t, upvotes: (t.upvotes || 0) + 1 }));
        setUserVotes(prev => new Set([...prev, id]));
    };

    const handleVoteComment = async (commentId: string, currentVotes: number) => {
        if (!user) { router.push('/login?redirect=/community/' + id); return; }
        if (userVotes.has(commentId)) return;

        await supabase.from('forum_votes').insert({ user_id: user.id, comment_id: commentId, vote_type: 'up' });
        await supabase.from('forum_comments').update({ upvotes: currentVotes + 1 }).eq('id', commentId);
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c));
        setUserVotes(prev => new Set([...prev, commentId]));
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !user) return;
        setSubmittingComment(true);
        try {
            const { data: comment, error } = await supabase.from('forum_comments').insert({
                thread_id: id,
                user_id: user.id,
                content: newComment.trim(),
            }).select('*, profiles(full_name, username, avatar_url)').single();

            if (error) throw error;
            setComments(prev => [...prev, { ...comment, upvotes: 0 }]);
            await supabase.from('forum_threads').update({ comment_count: (thread.comment_count || 0) + 1 }).eq('id', id);
            setThread((t: any) => ({ ...t, comment_count: (t.comment_count || 0) + 1 }));
            setNewComment('');
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(false);
        }
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

    const getInitials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#5CB800]" size={40} /></div>;
    if (!thread) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Thread not found</p></div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            <div className="bg-gradient-to-r from-[#5CB800] to-[#4A9900] text-white py-10">
                <div className="container mx-auto px-6 lg:px-12">
                    <Link href="/community" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Community
                    </Link>
                    {thread.forum_categories && (
                        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold mb-3">
                            {thread.forum_categories.icon} {thread.forum_categories.name}
                        </div>
                    )}
                    <h1 className="text-2xl lg:text-3xl font-black leading-tight max-w-3xl">{thread.title}</h1>
                    <div className="flex items-center gap-4 mt-3 text-white/70 text-sm flex-wrap">
                        <span>by <span className="text-white font-semibold">{thread.profiles?.full_name || 'Anonymous'}</span></span>
                        <span>{timeAgo(thread.created_at)}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={14}/> {thread.comment_count} replies</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={14}/> {thread.upvotes} upvotes</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 py-8 max-w-3xl">
                {/* Original Thread */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                    <div className="p-6 lg:p-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#5CB800] flex items-center justify-center text-white font-bold shrink-0">
                                {getInitials(thread.profiles?.full_name || 'U')}
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
                            </div>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="px-6 lg:px-8 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-4">
                        <button
                            onClick={handleVoteThread}
                            disabled={userVotes.has(id)}
                            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${userVotes.has(id) ? 'bg-[#5CB800] text-white' : 'bg-gray-100 text-gray-600 hover:bg-[#5CB800]/10 hover:text-[#5CB800]'}`}
                        >
                            <ThumbsUp size={16} /> {thread.upvotes} Helpful
                        </button>
                        <button
                            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#5CB800] transition-colors"
                        >
                            <Share2 size={16} /> Share
                        </button>
                    </div>
                </div>

                {/* Comments */}
                <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-[#5CB800]" />
                    {thread.comment_count} {thread.comment_count === 1 ? 'Reply' : 'Replies'}
                </h2>

                <div className="space-y-4 mb-8">
                    {comments.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                            <MessageSquare size={40} className="text-gray-200 mx-auto mb-2" />
                            <p className="text-gray-500">No replies yet. Be the first to respond!</p>
                        </div>
                    ) : comments.map((comment, i) => (
                        <div key={comment.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${i % 2 === 1 ? 'ml-4' : ''}`}>
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#5CB800] flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {getInitials(comment.profiles?.full_name || 'U')}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900 text-sm">{comment.profiles?.full_name || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                    <button
                                        onClick={() => handleVoteComment(comment.id, comment.upvotes)}
                                        disabled={userVotes.has(comment.id)}
                                        className={`mt-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${userVotes.has(comment.id) ? 'bg-[#5CB800] text-white' : 'bg-gray-100 text-gray-500 hover:bg-[#5CB800]/10 hover:text-[#5CB800]'}`}
                                    >
                                        <ThumbsUp size={13} /> {comment.upvotes} Helpful
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Box */}
                {thread.is_locked ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center flex items-center justify-center gap-2 text-yellow-700 font-bold">
                        <Lock size={18} /> This thread has been locked
                    </div>
                ) : user ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Share Your Reply</h3>
                        <textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm text-gray-700 resize-none transition-all"
                            placeholder="Share your thoughts, advice or experience..."
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handlePostComment}
                                disabled={submittingComment || !newComment.trim()}
                                className="btn bg-[#5CB800] hover:bg-[#4A9900] text-white border-none gap-2 disabled:opacity-50"
                            >
                                {submittingComment ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {submittingComment ? 'Posting...' : 'Post Reply'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                        <p className="text-gray-600 mb-4">Login to join the conversation and share your experience</p>
                        <Link href={`/login?redirect=/community/${id}`} className="btn bg-[#5CB800] text-white border-none">
                            Login to Reply
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
