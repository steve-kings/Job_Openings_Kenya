'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, CheckCircle, AlertCircle, Sparkles, MessageSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

interface ForumCategory { id: string; name: string; icon: string; description?: string; color?: string; }
interface Thread { id: string; title: string; content: string; category_id: string | null; user_id: string; }

export default function EditThreadPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [user, setUser] = useState<{ id: string } | null>(null);
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatingAi, setGeneratingAi] = useState(false);

    const [form, setForm] = useState({ title: '', content: '', category_id: '' });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push(`/login?redirect=/community/${id}/edit`); return; }
            setUser(user);

            // Fetch categories and thread data
            const [catsRes, threadRes] = await Promise.all([
                supabase.from('forum_categories').select('*').order('name'),
                supabase.from('forum_threads').select('*').eq('id', id).single()
            ]);

            const threadData = threadRes.data as Thread;
            if (threadRes.error || !threadData) {
                showToast('error', 'Thread not found.');
                setTimeout(() => router.push('/community'), 1500);
                return;
            }

            if (threadData.user_id !== user.id) {
                showToast('error', 'Unauthorized. You can only edit your own posts.');
                setTimeout(() => router.push(`/community/${id}`), 1500);
                return;
            }

            setCategories(catsRes.data || []);
            setForm({
                title: threadData.title || '',
                content: threadData.content || '',
                category_id: threadData.category_id || ''
            });
            setLoading(false);
        };
        init();
    }, [id, router, supabase]);

    const showToast = (type: 'success' | 'error', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

    const handleAiWrite = async () => {
        if (!aiPrompt.trim()) return;
        setGeneratingAi(true);
        try {
            const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate_forum_post', prompt: aiPrompt }) });
            const data = await res.json();
            if (data.content) { setForm(f => ({ ...f, content: data.content })); setAiPrompt(''); }
            else throw new Error(data.error || 'Failed');
        } catch { showToast('error', 'AI could not generate content. Try again.'); }
        finally { setGeneratingAi(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim() || !user) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('forum_threads').update({
                title: form.title.trim(),
                content: form.content.trim(),
                category_id: form.category_id || null,
            }).eq('id', id);
            
            if (error) throw error;
            showToast('success', 'Post updated successfully!');
            setTimeout(() => router.push(`/community/${id}`), 1200);
        } catch (err: unknown) {
            showToast('error', err instanceof Error ? err.message : 'Failed to update post.');
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) return;
        setDeleting(true);
        try {
            const { error } = await supabase.from('forum_threads').delete().eq('id', id);
            if (error) throw error;
            showToast('success', 'Post deleted!');
            setTimeout(() => router.push('/community'), 1000);
        } catch (err: unknown) {
            showToast('error', err instanceof Error ? err.message : 'Failed to delete post.');
            setDeleting(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all";

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{toast.msg}
                </div>
            )}

            {/* Hero */}
            <section className="relative overflow-hidden min-h-[200px] sm:min-h-[240px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <Link href={`/community/${id}`} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white mb-4 text-sm font-medium transition-colors">
                        <ArrowLeft size={15} /> Back to Thread
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                            <MessageSquare size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-lg">Edit Discussion</h1>
                            <p className="text-sm text-white/60">Update your post title, content, or category</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ScrollReveal>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Category + Title */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(cat => (
                                        <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, category_id: cat.id }))}
                                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                form.category_id === cat.id
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}>
                                            <span>{cat.icon}</span> {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title <span className="text-red-400">*</span></label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    className={inputCls} placeholder="Title your discussion..." required />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content <span className="text-red-400">*</span></label>
                                {/* AI helper */}
                                <div className="flex items-center gap-2">
                                    <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="AI: rewrite content..."
                                        className="w-48 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-violet-400" />
                                    <button type="button" onClick={handleAiWrite} disabled={generatingAi || !aiPrompt.trim()}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors disabled:opacity-50">
                                        {generatingAi ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                                        Write
                                    </button>
                                </div>
                            </div>
                            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                rows={10} className={`${inputCls} resize-none`}
                                placeholder="Share your thoughts, questions, or experiences in detail..." required />
                        </div>

                        {/* Submit & Delete */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button type="submit" disabled={submitting || deleting}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50">
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save Changes
                                </button>
                                <Link href={`/community/${id}`}
                                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
                                    Cancel
                                </Link>
                            </div>
                            <button type="button" onClick={handleDelete} disabled={submitting || deleting}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold transition-all disabled:opacity-50">
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Delete Post
                            </button>
                        </div>
                    </form>
                </ScrollReveal>
            </div>
            <div className="h-12" />
        </div>
    );
}
