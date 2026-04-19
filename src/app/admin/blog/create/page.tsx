'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, FileText, Save, Link2, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function CreateBlogPostPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Success Story',
        author_name: '1000Jobs Team',
        status: 'draft'
    });

    const [imageUrl, setImageUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatingAi, setGeneratingAi] = useState(false);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setGeneratingAi(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_blog', prompt: aiPrompt })
            });
            const data = await res.json();
            if (data.title && data.content) {
                setFormData({
                    ...formData,
                    title: data.title,
                    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                    excerpt: data.excerpt || '',
                    content: data.content
                });
                showToast('success', 'AI generated post successfully!');
                setAiPrompt('');
            } else {
                throw new Error(data.error || 'Failed to generate');
            }
        } catch (error: any) {
            showToast('error', error.message || 'Error generating AI content.');
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('blog_posts').insert({
                ...formData,
                featured_image: imageUrl || null,
                published_at: formData.status === 'published' ? new Date().toISOString() : null
            });
            if (error) throw error;
            showToast('success', 'Post created successfully!');
            setTimeout(() => { router.push('/admin/blog'); router.refresh(); }, 1500);
        } catch (error: any) {
            showToast('error', error?.message || 'Error creating post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Success Story', 'Career Insights', 'Organization News', 'How-To', 'Events', 'Opportunities'];

    const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
                {hint && <span className="text-xs text-gray-400">{hint}</span>}
            </div>
            {children}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-16">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1976D2] transition-colors text-sm mb-5 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Blog Posts
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4CAF50] to-[#388E3C] flex items-center justify-center shadow-lg">
                        <FileText className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Share stories & insights with the 1000Jobs community</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ── Left: Main Content ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* AI Generator Box */}
                        <div className="bg-gradient-to-r from-[#1976D2]/10 to-[#1976D2]/5 rounded-2xl border border-[#1976D2]/20 p-6 space-y-3 shadow-sm">
                            <div className="flex items-center gap-2 text-[#1976D2]">
                                <Sparkles size={20} />
                                <h3 className="font-bold text-sm uppercase tracking-widest">1000Jobs AI Generator</h3>
                            </div>
                            <div className="flex gap-3">
                                <input 
                                    type="text" 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="E.g., Write a blog post about the top 5 interview tips for 2026..."
                                    className="flex-1 px-4 py-3 rounded-xl border border-white focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none text-sm text-gray-700 transition-all shadow-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAIGenerate())}
                                />
                                <button 
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={!aiPrompt || generatingAi}
                                    className="px-6 py-3 bg-[#1976D2] text-white font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-[#1565C0] disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {generatingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    Generate
                                </button>
                            </div>
                        </div>

                        {/* Title & Slug */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Post Details</h3>
                            <Field label="Title" required>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="Enter an engaging post title..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none text-gray-900 font-medium text-lg transition-all"
                                />
                            </Field>
                            <Field label="URL Slug" hint="Auto-generated">
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                                    <Link2 size={15} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-500 font-mono truncate">{formData.slug || 'your-post-slug-here'}</span>
                                </div>
                            </Field>
                            <Field label="Excerpt" required hint={`${formData.excerpt.length} chars`}>
                                <textarea
                                    required
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="A compelling summary shown on listing cards (150–200 characters recommended)"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none text-sm text-gray-700 resize-none transition-all"
                                />
                            </Field>
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Post Content</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Markdown & HTML supported</span>
                            </div>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder={`# Your Heading\n\nWrite your full article content here...\n\n## Section Title\n\nMore content...`}
                                rows={22}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20 outline-none text-sm text-gray-700 font-mono resize-none transition-all"
                            />
                        </div>
                    </div>

                    {/* ── Right: Sidebar ── */}
                    <div className="space-y-5">

                        {/* Publish card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Publish</h3>

                            {/* Status toggle */}
                            <div className="flex gap-2">
                                {['draft', 'published'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${formData.status === s
                                            ? s === 'published'
                                                ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow'
                                                : 'bg-gray-900 text-white border-gray-900 shadow'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {s === 'published' ? '✅ Publish' : '📝 Draft'}
                                    </button>
                                ))}
                            </div>

                            <Field label="Category" required>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none text-sm text-gray-700 bg-white transition-all"
                                >
                                    {categories.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </Field>

                            <Field label="Author Name">
                                <input
                                    type="text"
                                    value={formData.author_name}
                                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none text-sm text-gray-700 transition-all"
                                />
                            </Field>

                            <hr className="border-gray-100" />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#1976D2]/30 transition-all disabled:opacity-60"
                            >
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><Save size={16} /> {formData.status === 'published' ? 'Publish Post' : 'Save Draft'}</>
                                )}
                            </button>
                        </div>

                        {/* Featured Image */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Featured Image</h3>
                            <CloudinaryUpload
                                onUploadComplete={(url) => setImageUrl(url)}
                                currentImage={imageUrl}
                                folder="1000jobs-blog"
                                label="Upload Image"
                            />
                            <p className="text-xs text-gray-400">Optional — default 1000Jobs branding used if empty.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
