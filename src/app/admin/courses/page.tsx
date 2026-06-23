'use client'

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle, X, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface Course {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    status: string;
    level?: string;
    duration_hours?: number;
    created_at: string;
    lesson_count?: number;
}

export default function AdminCoursesPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const s = useMemo(() => createClient(), []);

    useEffect(() => {
        s.from('courses')
            .select('*, lessons(count)')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                const formatted = (data || []).map((c: Course & { lessons?: { count: number }[] }) => ({
                    ...c,
                    lesson_count: c.lessons?.[0]?.count ?? 0,
                }));
                setCourses(formatted);
                setLoading(false);
            });
    }, [s]);

    const del = async (id: string) => {
        if (!confirm('Delete this course and all its lessons?')) return;
        await s.from('courses').delete().eq('id', id);
        setCourses(prev => prev.filter(c => c.id !== id));
    };

    const filtered = courses.filter(c => {
        return (
            (search === '' || c.title.toLowerCase().includes(search.toLowerCase())) &&
            (statusFilter === 'All' || c.status === statusFilter)
        );
    });

    const levelBadge: Record<string, string> = {
        beginner: 'bg-emerald-50 text-emerald-700',
        intermediate: 'bg-amber-50 text-amber-700',
        advanced: 'bg-red-50 text-red-700',
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Courses</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {courses.length} total · {courses.filter(c => c.status === 'published').length} published
                    </p>
                </div>
                <Link
                    href="/admin/courses/create"
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
                >
                    <Plus size={16} /> New Course
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-500 bg-white"
                >
                    <option value="All">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            {/* Courses Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                        {/* Thumbnail */}
                        <div className="h-40 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
                            {course.thumbnail_url ? (
                                <Image src={course.thumbnail_url} alt={course.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BookOpen size={40} className="text-white/40" />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex gap-1.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${course.status === 'published' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                                    {course.status}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-extrabold text-gray-900 line-clamp-2 text-sm leading-snug flex-1">{course.title}</h3>
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/courses/${course.slug}`} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                                        <Eye size={13} />
                                    </Link>
                                    <Link href={`/admin/courses/${course.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                        <Edit size={13} />
                                    </Link>
                                    <button onClick={() => del(course.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>

                            {course.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                            )}

                            <div className="flex items-center gap-2 flex-wrap text-[10px] font-semibold">
                                {course.level && (
                                    <span className={`px-2 py-0.5 rounded-full ${levelBadge[course.level] || 'bg-gray-50 text-gray-600'}`}>
                                        {course.level}
                                    </span>
                                )}
                                {course.duration_hours && (
                                    <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                                        {course.duration_hours}h
                                    </span>
                                )}
                                <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                                    {course.lesson_count} lessons
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-50 px-5 py-3 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">
                                Added {new Date(course.created_at).toLocaleDateString()}
                            </span>
                            <Link
                                href={`/admin/courses/${course.id}`}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                            >
                                Manage →
                            </Link>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-400">
                        <AlertCircle size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">No courses found</p>
                        <Link href="/admin/courses/create" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:underline">
                            <Plus size={14} /> Create your first course
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
