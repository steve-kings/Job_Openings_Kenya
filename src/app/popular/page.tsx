import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { FileText, TrendingUp, Briefcase, BookOpen, Eye, Calendar, ArrowRight, Sparkles, Clock, MapPin, Zap } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata: Metadata = {
    title: 'Trending | Job Openings Kenya',
    description: 'Discover the most viewed articles and opportunities on Job Openings Kenya.',
};

export const revalidate = 3600;

export default async function PopularPage() {
    const supabase = await createClient();

    const { data: popularBlogs } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, created_at, featured_image, views, category')
        .order('views', { ascending: false, nullsFirst: false })
        .limit(9);

    const { data: popularJobs } = await supabase
        .from('opportunities')
        .select('id, title, company, type, location, created_at, views, deadline')
        .order('views', { ascending: false, nullsFirst: false })
        .limit(6);

    const totalViews = (popularBlogs || []).reduce((s, b) => s + (b.views || 0), 0) +
        (popularJobs || []).reduce((s, j) => s + (j.views || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ═══════ HERO ═══════ */}
            <section className="relative overflow-hidden min-h-[380px] sm:min-h-[440px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">
                        <ScrollReveal>
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white mb-5">
                                    <TrendingUp size={13} className="text-amber-400" /> What&apos;s Hot
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.06] drop-shadow-lg">
                                    Trending{' '}
                                    <span className="text-amber-400">Now</span>
                                </h1>
                                <p className="mt-4 text-lg text-white/70 max-w-md leading-relaxed">
                                    The most viewed articles, career tips, and opportunities — ranked by what Kenya&apos;s job seekers are looking at right now.
                                </p>
                                <div className="flex items-center gap-6 mt-8">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-white">{totalViews.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Total Views</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-white">{(popularBlogs || []).length + (popularJobs || []).length}</p>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Trending Items</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Featured card */}
                        {(popularBlogs && popularBlogs[0]) && (
                            <ScrollReveal direction="right" variant="scale">
                                <div className="hidden lg:block relative">
                                    <div className="absolute inset-0 bg-amber-400/20 rounded-3xl blur-3xl scale-75" />
                                    <div className="relative bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                                        <div className="relative h-44 bg-gradient-to-br from-slate-700 to-slate-900">
                                            {popularBlogs[0].featured_image ? (
                                                <Image src={popularBlogs[0].featured_image} alt="" fill unoptimized className="object-cover opacity-60" />
                                            ) : null}
                                            <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">#1 Trending</div>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-xs font-bold text-amber-300 mb-1">{popularBlogs[0].category || 'Article'}</p>
                                            <h3 className="font-extrabold text-white text-lg leading-snug line-clamp-2">{popularBlogs[0].title}</h3>
                                            <div className="flex items-center gap-3 mt-3 text-xs text-white/50">
                                                <span className="flex items-center gap-1"><Eye size={11} /> {popularBlogs[0].views || 0} views</span>
                                                <Link href={`/blog/${popularBlogs[0].slug}`} className="ml-auto text-xs font-bold text-white/80 hover:text-white flex items-center gap-1">Read <ArrowRight size={12} /></Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        )}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* ═══════ TRENDING ARTICLES ═══════ */}
                <section className="mb-16">
                    <ScrollReveal>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <FileText size={14} className="text-amber-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Most Read Articles</h2>
                                </div>
                                <p className="text-sm text-slate-500 ml-10">Ranked by highest views</p>
                            </div>
                            <Link href="/blog" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                View all articles <ArrowRight size={13} />
                            </Link>
                        </div>
                    </ScrollReveal>

                    {(!popularBlogs || popularBlogs.length === 0) ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
                            <FileText size={40} className="text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">No articles gaining traction yet.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularBlogs.map((post, i) => (
                                <ScrollReveal key={post.id} delay={i * 80} variant="scale">
                                    <Link href={`/blog/${post.slug}`}
                                        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                        {/* Image */}
                                        <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                            {post.featured_image ? (
                                                <Image src={post.featured_image} alt={post.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <FileText size={36} className="text-slate-300" />
                                                </div>
                                            )}
                                            {/* Rank */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold text-white shadow-lg border-2 border-white ${
                                                    i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-500' : i === 2 ? 'bg-amber-700' : 'bg-slate-400'
                                                }`}>#{i + 1}</span>
                                            </div>
                                            {/* Views */}
                                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                                                <Eye size={10} /> {post.views || 0}
                                            </div>
                                        </div>
                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1">
                                            {post.category && (
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">{post.category}</span>
                                            )}
                                            <h3 className="font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
                                            )}
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <Calendar size={11} />
                                                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                                                    Read <ArrowRight size={11} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </ScrollReveal>
                            ))}
                        </div>
                    )}
                </section>

                {/* ═══════ HOT OPPORTUNITIES ═══════ */}
                <section>
                    <ScrollReveal>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Zap size={14} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Hot Opportunities</h2>
                                </div>
                                <p className="text-sm text-slate-500 ml-10">Jobs and training getting the most attention</p>
                            </div>
                            <Link href="/" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                Browse all jobs <ArrowRight size={13} />
                            </Link>
                        </div>
                    </ScrollReveal>

                    {(!popularJobs || popularJobs.length === 0) ? (
                        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
                            <Briefcase size={40} className="text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-medium">No trending opportunities yet.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularJobs.map((job, i) => (
                                <ScrollReveal key={job.id} delay={i * 100} variant="scale">
                                    <Link href={`/jobs/${job.id}`}
                                        className="group relative bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        {/* Rank */}
                                        <div className={`absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-md border-2 border-white ${
                                            i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-600' : i === 2 ? 'bg-emerald-700' : 'bg-slate-400'
                                        }`}>#{i + 1}</div>

                                        {/* Company avatar */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                                                {job.company.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                <Eye size={11} /> {job.views || 0}
                                            </span>
                                        </div>

                                        <h3 className="font-extrabold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm mb-2">
                                            {job.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-4">{job.company}</p>

                                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-extrabold ${
                                                job.type === 'Job' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'
                                            }`}>
                                                {job.type === 'Job' ? <Briefcase size={10} /> : <BookOpen size={10} />}
                                                {job.type}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500">
                                                <MapPin size={10} /> {job.location}
                                            </span>
                                            {job.deadline && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-red-50 text-red-500 ml-auto">
                                                    <Clock size={10} /> {Math.max(0, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86400000))}d left
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </ScrollReveal>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <div className="h-12" />
        </div>
    );
}
