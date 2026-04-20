'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewThreadPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [form, setForm] = useState({
        title: '',
        content: '',
        category_id: '',
    });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login?redirect=/community/new'); return; }
            setUser(user);
            const { data: cats } = await supabase.from('forum_categories').select('*').order('name');
            setCategories(cats || []);
            if (cats && cats.length > 0) setForm(f => ({ ...f, category_id: cats[0].id }));
            setLoading(false);
        };
        init();
    }, []);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        setSubmitting(true);
        try {
            const { data, error } = await supabase.from('forum_threads').insert({
                title: form.title.trim(),
                content: form.content.trim(),
                category_id: form.category_id || null,
                user_id: user.id,
            }).select().single();

            if (error) throw error;
            showToast('success', 'Thread posted successfully!');
            setTimeout(() => router.push(`/community/${data.id}`), 1000);
        } catch (err: any) {
            showToast('error', err.message || 'Failed to post thread.');
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none text-sm text-gray-700 transition-all bg-white";

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#1976D2]" size={40} /></div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            <div className="bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white py-12">
                <div className="container mx-auto px-6 lg:px-12">
                    <Link href="/community" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Community
                    </Link>
                    <h1 className="text-3xl font-bold">Start a Discussion</h1>
                    <p className="text-white/80 mt-1">Ask a question, share an experience, or spark a conversation!</p>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 py-10 max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Choose a Category</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setForm({ ...form, category_id: cat.id })}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${form.category_id === cat.id
                                        ? 'border-[#1976D2] bg-[#1976D2]/5 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="text-2xl">{cat.icon}</span>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your Question or Topic</h3>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none text-lg font-bold text-gray-800 transition-all bg-white"
                            placeholder="e.g. Has anyone applied for the WFP Kenya internship?"
                            maxLength={200}
                        />
                        <p className="text-xs text-gray-400">{200 - form.title.length} characters remaining</p>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Details</h3>
                        <textarea
                            required
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            rows={10}
                            className={`${inputCls} resize-none`}
                            placeholder="Provide more context, share your experience, or explain what specific help you need..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <Link href="/community" className="btn border-2 border-gray-200 text-gray-700 hover:bg-gray-50 flex-1">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || !form.title.trim() || !form.content.trim()}
                            className="btn bg-[#1976D2] hover:bg-[#1565C0] text-white border-none flex-1 gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {submitting ? 'Posting...' : 'Post Discussion'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
