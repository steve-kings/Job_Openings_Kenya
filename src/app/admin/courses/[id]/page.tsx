'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    ArrowLeft, BookOpen, Link2, Save, Image as ImageIcon,
    Clock, BarChart, Trash2, ExternalLink, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import { use } from 'react';

interface Course {
    id: string;
    title: string;
    slug: string;
    description?: string;
    external_url?: string;
    level?: string;
    duration_hours?: number;
    category?: string;
    status: string;
    thumbnail_url?: string;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [thumbnail, setThumbnail] = useState('');
    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        external_url: '',
        level: 'beginner',
        duration_hours: '',
        category: '',
        status: 'draft',
    });

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    useEffect(() => {
        supabase.from('courses').select('*').eq('id', id).single().then(({ data }) => {
            if (data) {
                const c = data as Course;
                setForm({
                    title: c.title || '',
                    slug: c.slug || '',
                    description: c.description || '',
                    external_url: c.external_url || '',
                    level: c.level || 'beginner',
                    duration_hours: c.duration_hours ? String(c.duration_hours) : '',
                    category: c.category || '',
                    status: c.status || 'draft',
                });
                setThumbnail(c.thumbnail_url || '');
            }
            setFetching(false);
        });
    }, [id, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('courses').update({
                ...form,
                duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
                thumbnail_url: thumbnail || null,
            }).eq('id', id);
            if (error) throw error;
            router.push('/admin/courses');
            router.refresh();
        } catch (err: unknown) {
            alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Permanently delete this course?')) return;
        setDeleting(true);
        await supabase.from('courses').delete().eq('id', id);
        router.push('/admin/courses');
        router.refresh();
    };

    if (fetching) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-4 text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-xl">
                            <BookOpen className="text-emerald-600" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Edit Course</h1>
                            <p className="text-gray-500 text-sm mt-0.5">{form.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {form.external_url && (
                            <a
                                href={form.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                <ExternalLink size={14} /> Preview
                            </a>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen size={18} className="text-emerald-600" /> Course Information
                    </h2>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Title <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={e => set('slug', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            <span className="flex items-center gap-1.5"><Link2 size={14} /> External Course URL (KingsLearn)</span>
                        </label>
                        <input
                            type="url"
                            value={form.external_url}
                            onChange={e => set('external_url', e.target.value)}
                            placeholder="https://kingslearn.co.ke/course/..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <AlertTriangle size={11} className="text-amber-500" />
                            Users will be redirected here when they click &quot;Enroll Now&quot;
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <BarChart size={18} className="text-emerald-600" /> Course Details
                    </h2>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Level</label>
                            <select
                                value={form.level}
                                onChange={e => set('level', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 bg-white"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                <span className="flex items-center gap-1"><Clock size={13} /> Duration (hours)</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.duration_hours}
                                onChange={e => set('duration_hours', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={e => set('category', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <div className="flex gap-3">
                            {['draft', 'published'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => set('status', s)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all capitalize ${form.status === s
                                        ? s === 'published' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-amber-500 bg-amber-50 text-amber-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Thumbnail */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <ImageIcon size={18} className="text-emerald-600" /> Course Thumbnail
                    </h2>
                    <CloudinaryUpload
                        onUploadComplete={(url) => setThumbnail(url)}
                        currentImage={thumbnail}
                        folder="job-openings-kenya-courses"
                        label="Upload Thumbnail"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Link href="/admin/courses" className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-60 shadow-sm shadow-emerald-200"
                    >
                        {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
