import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ExternalLink, Clock, BarChart2, BookOpen, ArrowRight, CheckCircle, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 3600;

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
    created_at: string;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (!course) return { title: 'Course Not Found | Job Openings Kenya' };

    return {
        title: `${course.title} | Job Openings Kenya`,
        description: course.description || `Enroll in ${course.title} — available on KingsLearn`,
    };
}

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
    beginner:     { label: 'Beginner',     color: 'text-emerald-700', bg: 'bg-emerald-50' },
    intermediate: { label: 'Intermediate', color: 'text-amber-700',   bg: 'bg-amber-50'   },
    advanced:     { label: 'Advanced',     color: 'text-red-700',     bg: 'bg-red-50'     },
};

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single() as { data: Course | null };

    if (!course) notFound();

    const level = levelConfig[course.level || ''] || null;
    const enrollUrl = course.external_url || 'https://kingslearn.co.ke';

    // Fetch other published courses as suggestions
    const { data: related } = await supabase
        .from('courses')
        .select('id, title, slug, thumbnail_url, level, duration_hours')
        .eq('status', 'published')
        .neq('id', course.id)
        .limit(3);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-[#1a2e1a] via-[#2d5a1b] to-[#5CB800] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-white/60 text-sm mb-6">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <span>/</span>
                                <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
                                <span>/</span>
                                <span className="text-white/90 line-clamp-1">{course.title}</span>
                            </nav>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                {level && (
                                    <span className={`${level.bg} ${level.color} px-3 py-1 rounded-full text-xs font-bold`}>
                                        {level.label}
                                    </span>
                                )}
                                {course.category && (
                                    <span className="bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <Tag size={10} /> {course.category}
                                    </span>
                                )}
                                <span className="bg-[#5CB800]/30 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <BookOpen size={10} /> KingsLearn
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-5">
                                {course.title}
                            </h1>

                            {course.description && (
                                <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-xl">
                                    {course.description}
                                </p>
                            )}

                            {/* Stats row */}
                            <div className="flex flex-wrap gap-6 mb-8 text-sm text-white/70">
                                {course.duration_hours && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={15} className="text-[#5CB800]" />
                                        {course.duration_hours} hours
                                    </span>
                                )}
                                {level && (
                                    <span className="flex items-center gap-1.5">
                                        <BarChart2 size={15} className="text-[#5CB800]" />
                                        {level.label} level
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle size={15} className="text-[#5CB800]" />
                                    Certificate on completion
                                </span>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={enrollUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5CB800] hover:bg-[#4A9900] text-white font-bold px-8 py-4 text-base transition-all shadow-xl shadow-black/20 hover:shadow-[#5CB800]/30 hover:-translate-y-0.5"
                                >
                                    Enroll Now
                                    <ExternalLink size={18} />
                                </a>
                                <a
                                    href="https://kingslearn.co.ke"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 text-white font-bold px-8 py-4 text-base hover:bg-white/10 transition-all"
                                >
                                    Browse All Courses
                                </a>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-[#5CB800]/20 rounded-3xl blur-2xl" />
                                {course.thumbnail_url ? (
                                    <Image
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        fill
                                        unoptimized
                                        className="rounded-2xl shadow-2xl object-cover border-4 border-white/20"
                                    />
                                ) : (
                                    <div className="relative rounded-2xl shadow-2xl w-full aspect-video bg-white/10 border-4 border-white/20 flex items-center justify-center">
                                        <BookOpen size={80} className="text-white/30" />
                                    </div>
                                )}
                                {/* Floating enroll card */}
                                <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#5CB800] rounded-xl flex items-center justify-center shrink-0">
                                        <CheckCircle size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Hosted on</p>
                                        <p className="text-sm font-black text-gray-900">KingsLearn LMS</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What you'll learn */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* About */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-4">About This Course</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {course.description || 'This course is designed to help you build practical skills and advance your career. Enroll now on KingsLearn to get started.'}
                            </p>
                        </div>

                        {/* What you'll learn */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-5">What You&apos;ll Gain</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    'Practical, job-ready skills',
                                    'Industry-recognised knowledge',
                                    'Self-paced, flexible learning',
                                    'Certificate of completion',
                                    'Access to learning community',
                                    'Expert-curated content',
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle size={16} className="text-[#5CB800] mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar CTA */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                            {course.thumbnail_url && (
                                <Image src={course.thumbnail_url} alt={course.title} width={400} height={225} unoptimized className="w-full rounded-xl aspect-video object-cover mb-5" />
                            )}

                            <div className="space-y-3 mb-6">
                                {course.duration_hours && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-2"><Clock size={14} /> Duration</span>
                                        <span className="font-bold text-gray-900">{course.duration_hours} hours</span>
                                    </div>
                                )}
                                {level && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-2"><BarChart2 size={14} /> Level</span>
                                        <span className={`font-bold ${level.color}`}>{level.label}</span>
                                    </div>
                                )}
                                {course.category && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-2"><Tag size={14} /> Category</span>
                                        <span className="font-bold text-gray-900">{course.category}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-2"><CheckCircle size={14} /> Certificate</span>
                                    <span className="font-bold text-[#5CB800]">Included</span>
                                </div>
                            </div>

                            <a
                                href={enrollUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5CB800] hover:bg-[#4A9900] text-white font-bold py-3.5 text-sm transition-all"
                            >
                                Enroll on KingsLearn <ExternalLink size={15} />
                            </a>
                            <p className="text-center text-xs text-gray-400 mt-3">
                                You&apos;ll be redirected to KingsLearn LMS
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Courses */}
            {related && related.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-900">More Courses</h2>
                        <a href="https://kingslearn.co.ke" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#5CB800] hover:underline flex items-center gap-1">
                            View all <ArrowRight size={14} />
                        </a>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {related.map(c => (
                            <Link key={c.id} href={`/courses/${c.slug}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                                <div className="h-36 bg-gradient-to-br from-[#5CB800] to-[#2d5a1b] relative overflow-hidden">
                                    {c.thumbnail_url
                                        ? <Image src={c.thumbnail_url} alt={c.title} fill unoptimized className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        : <div className="absolute inset-0 flex items-center justify-center"><BookOpen size={32} className="text-white/30" /></div>
                                    }
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-[#5CB800] transition-colors mb-2">{c.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        {c.duration_hours && <span className="flex items-center gap-1"><Clock size={11} />{c.duration_hours}h</span>}
                                        {c.level && <span className="capitalize">{c.level}</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
