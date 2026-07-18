import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight, BellRing, BookOpen, Briefcase, Building2, Calendar,
    CheckCircle, Clock, Eye, Home, Layers,
    MapPin, MessageCircle, Search, Shield, ShieldCheck, Sparkles,
    TrendingUp, Users, Wallet, X, Zap, Star, Clock3, ArrowUpRight,
} from 'lucide-react';
import type { Metadata } from 'next';
import JobsFilter from '@/components/JobsFilter';
import NoJobsSubscribe from '@/components/NoJobsSubscribe';
import ExternalJobFeed from '@/components/ExternalJobFeed';
import HeroSlider from '@/components/HeroSlider';
import ListingsView from '@/components/ListingsView';
import ScrollReveal from '@/components/ScrollReveal';
import WeatherWidget from '@/components/WeatherWidget';
import NewsWidget from '@/components/NewsWidget';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { createClient } from '@/lib/supabase/server';
import { type JobData, type OpportunityType, typeConfig, getDaysLeft, formatDaysRemaining, getPostedDaysAgo, isNew, fmtDate, cleanSummary } from '@/lib/utils/jobs';

export const metadata: Metadata = {
    title: 'Job Openings Kenya | Quality-Screened Jobs & Training',
    description: 'Find Kenya-focused jobs, internships, and training screened for freshness, useful details, and valid application links. Always verify before applying.',
};

export const revalidate = 3600;

type Timeframe = 'any' | '24h' | 'week' | '2weeks';

function buildUrl(f: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString() ? `/?${p.toString()}` : '/';
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    const params = await searchParams;
    const ft = typeof params.type === 'string' ? params.type : 'All';
    const fq = typeof params.q === 'string' ? params.q : '';
    const fl = typeof params.location === 'string' ? params.location : '';
    const fmin = typeof params.salary_min === 'string' ? params.salary_min : '';
    const fmax = typeof params.salary_max === 'string' ? params.salary_max : '';
    const urgent = params.urgent === 'true';
    const timeframe = (typeof params.timeframe === 'string' ? params.timeframe : 'any') as Timeframe;

    const { count: totalCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: compCount } = await supabase.from('opportunities').select('company', { count: 'exact', head: true }).eq('status', 'active');

    // Timeframe filter
    const now = new Date();
    let timeFilterDate: Date | null = null;
    if (timeframe === '24h') { timeFilterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); }
    else if (timeframe === 'week') { timeFilterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); }
    else if (timeframe === '2weeks') { timeFilterDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); }

    let q = supabase.from('opportunities').select('*').neq('type', 'Banner').or(`deadline.gte.${today},deadline.is.null`).eq('status', 'active');
    if (timeFilterDate) q = q.gte('created_at', timeFilterDate.toISOString());
    if (urgent) { const d = new Date(); d.setDate(d.getDate() + 3); q = q.lte('deadline', d.toISOString().split('T')[0]).order('deadline', { ascending: true }); }
    else { q = q.order('created_at', { ascending: false }); }
    if (ft !== 'All') q = q.eq('type', ft);
    if (fq) q = q.or(`title.ilike.%${fq}%,company.ilike.%${fq}%,location.ilike.%${fq}%`);
    if (fl) q = q.ilike('location', `%${fl}%`);
    if (fmin) q = q.gte('salary_max', parseInt(fmin, 10));
    if (fmax) q = q.lte('salary_min', parseInt(fmax, 10));

    const { data: opps } = await q;
    const jobs = (opps || []) as JobData[];
    const companies = [...new Set(jobs.map(o => o.company))].filter(Boolean).slice(0, 8);
    const urgentJobs = jobs.filter(j => { const d = getDaysLeft(j.deadline); return d !== null && d <= 3 && d > 0; });
    const featuredUrgent = urgentJobs.slice(0, 3);

    // Category sections — fetch top jobs per category for WWR-style discovery
    const { data: catJobs } = await supabase.from('opportunities').select('*').eq('type', 'Job').neq('type', 'Banner').or(`deadline.gte.${today},deadline.is.null`).eq('status', 'active').order('created_at', { ascending: false }).limit(6);
    const { data: catTrainings } = await supabase.from('opportunities').select('*').eq('type', 'Training').neq('type', 'Banner').or(`deadline.gte.${today},deadline.is.null`).eq('status', 'active').order('created_at', { ascending: false }).limit(6);
    const { count: jobCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'Job').eq('status', 'active');
    const { count: trainingCount } = await supabase.from('opportunities').select('*', { count: 'exact', head: true }).eq('type', 'Training').eq('status', 'active');
    const categoryJobs = (catJobs || []) as JobData[];
    const categoryTrainings = (catTrainings || []) as JobData[];

    const isFiltered = ft !== 'All' || fq || fl || urgent || fmin || fmax || timeframe !== 'any';

    const timeframeLinks = [
        { value: 'any', label: 'Any Time', icon: Clock3 },
        { value: '24h', label: 'Past 24 Hours', icon: Zap },
        { value: 'week', label: 'Past Week', icon: Calendar },
        { value: '2weeks', label: 'Past 2 Weeks', icon: Clock },
    ];

    return (
        <div className="bg-white">
            {/* ═══════ HERO ═══════ */}
            <section className="relative overflow-hidden min-h-[420px] sm:min-h-[520px] lg:min-h-[600px] flex items-center">
                {/* Background image slider */}
                <div className="absolute inset-0">
                    <HeroSlider />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 sm:py-20 overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Left: Content */}
                        <div className="max-w-full">
                            <h1 className="text-[26px] xs:text-[32px] sm:text-5xl lg:text-[56px] font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
                                Find your{' '}
                                <span className="relative inline-block">
                                    <span className="text-emerald-300">dream job</span>
                                    <svg className="absolute -bottom-1 left-0 w-full h-3 text-emerald-300/40 overflow-visible" viewBox="0 0 240 12" preserveAspectRatio="none">
                                        <path d="M0,6 Q30,12 60,6 Q90,0 120,6 Q150,12 180,6 Q210,0 240,6" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </span>{' '}
                                in Kenya
                            </h1>
                            <p className="mt-3 text-sm sm:text-lg text-white/75 max-w-md leading-relaxed">
                                Browse Kenya-focused jobs and training screened for freshness and useful application details.
                            </p>

                            {/* Search bar */}
                            <div className="mt-5 max-w-full sm:max-w-lg"><JobsFilter /></div>

                            {/* Trending keyword tags */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-4 max-w-full">
                                <span className="text-[10px] font-bold text-white/50 whitespace-nowrap">Trending:</span>
                                {['Nairobi', 'Remote', 'Technology', 'Finance', 'Entry Level', 'Internships'].map(tag => (
                                    <a key={tag} href={`/?q=${encodeURIComponent(tag)}`}
                                        className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:text-white transition-colors border border-white/10 whitespace-nowrap">
                                        {tag}
                                    </a>
                                ))}
                            </div>

                            {/* Trust badges */}
                            <div className="flex items-center gap-8 sm:gap-10 mt-8 pt-6 border-t border-white/10">
                                {[
                                    { number: (totalCount || 0).toLocaleString(), label: 'Live Jobs' },
                                    { number: (compCount ?? 10) + '+', label: 'Companies' },
                                    { number: 'Daily', label: 'Screened' },
                                ].map(s => (
                                    <div key={s.label} className="text-center">
                                        <p className="text-xl sm:text-2xl font-black text-white">{s.number}</p>
                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Lead Image */}
                        <div className="hidden lg:flex items-center justify-center relative">
                            <div className="relative w-full max-w-md">
                                {/* Glow behind image */}
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl blur-3xl scale-75" />
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/30 border-2 border-white/20">
                                    <Image
                                        src="/images/advance-your-career.png"
                                        alt="Professional job seeker in Kenya"
                                        width={500}
                                        height={400}
                                        className="w-full h-auto object-cover aspect-[5/4]"
                                        priority
                                    />
                                    {/* Floating badge */}
                                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-xs font-extrabold text-slate-800">{totalCount || 0}+ Active Jobs</p>
                                        </div>
                                    </div>
                                    {/* Floating card top-right */}
                                    <div className="absolute -top-3 -right-3 bg-white rounded-xl px-3.5 py-2 shadow-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Updated</p>
                                        <p className="text-sm font-extrabold text-emerald-600">Daily</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ STATS BAR ═══════ */}
            <section className="bg-emerald-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-white">
                        {[
                            { value: (totalCount || 0).toLocaleString(), label: 'Active Jobs', sub: 'Current listings' },
                            { value: (compCount ?? 10) + '+', label: 'Top Employers', sub: 'Hiring now' },
                            { value: 'Quality', label: 'Listing Checks', sub: 'Automated + editorial' },
                            { value: 'Daily', label: 'Fresh Updates', sub: 'New listings' },
                        ].map((s) => (
                            <div key={s.label} className="text-left sm:text-center">
                                <p className="text-xl sm:text-2xl font-black">{s.value}</p>
                                <p className="text-sm font-bold">{s.label}</p>
                                <p className="text-[11px] text-white/70">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ BROWSE BY CATEGORY ═══════ */}
            {!isFiltered && (
                <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">Popular Categories</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Browse by Industry</h2>
                            <p className="mt-2 text-gray-500 max-w-lg mx-auto">Find opportunities in your field of expertise</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2.5">
                            {[
                                { label: 'Technology', icon: Zap },
                                { label: 'Finance', icon: Wallet },
                                { label: 'Healthcare', icon: ShieldCheck },
                                { label: 'Education', icon: BookOpen },
                                { label: 'Engineering', icon: Building2 },
                                { label: 'Marketing', icon: TrendingUp },
                                { label: 'Hospitality', icon: Users },
                                { label: 'Agriculture', icon: Layers },
                            ].map((cat) => (
                                <Link key={cat.label} href={`/?q=${encodeURIComponent(cat.label)}`}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-sm font-semibold text-gray-700">
                                    <cat.icon size={15} />
                                    {cat.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════ FEATURED URGENT JOBS ═══════ */}
            {featuredUrgent.length > 0 && !isFiltered && (
                <section className="py-10 sm:py-14 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#85bb23] bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-slate-700 mb-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#85bb23]" /> Up to 3 Days Remaining
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Urgent Opportunities</h2>
                            </div>
                            <Link href="/?urgent=true" className="hidden sm:flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                View all urgent <ArrowRight size={15} />
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featuredUrgent.map((job: JobData) => {
                                const dl = getDaysLeft(job.deadline);
                                return (
                                    <Link key={job.id} href={`/jobs/${job.id}`} className="group block bg-white rounded-2xl border border-gray-100 hover:border-[#85bb23] hover:shadow-xl transition-all duration-300 overflow-hidden">
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                                                    {job.company.charAt(0).toUpperCase()}
                                                </div>
                                                {dl !== null && (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#85bb23] text-slate-950">{formatDaysRemaining(dl)}</span>
                                                )}
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">{job.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{cleanSummary(job)}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 font-semibold text-slate-700"><Building2 size={12} /> {job.company}</span>
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {job.location || 'Kenya'}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {fmtDate(job.deadline)}</span>
                                            </div>
                                        </div>
                                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-emerald-600">Apply Now</span>
                                            <ArrowUpRight size={14} className="text-emerald-600" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════ LISTINGS ═══════ */}
            <section className="py-8 sm:py-12 bg-gray-50/50">
                <div className="mx-auto grid grid-cols-1 max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
                    <main className="min-w-0">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-6">
                            <Link href="/" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                <Home size={12} /> Home
                            </Link>
                            {isFiltered && (
                                <>
                                    <span>/</span>
                                    <span className="text-emerald-600">
                                        {urgent ? 'Up to 3 Days Remaining' : ft !== 'All' ? ft + 's' : timeframe !== 'any' ? timeframeLinks.find(t => t.value === timeframe)?.label : 'Search'}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Section Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-emerald-600">{ft === 'All' ? 'All Opportunities' : ft + 's'}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{urgent ? 'Jobs With Up to 3 Days Remaining' : 'Latest Listings'}</h2>
                            <p className="mt-1 text-sm text-gray-500">{jobs.length} {jobs.length === 1 ? 'opportunity' : 'opportunities'}{fq ? ` for "${fq}"` : ''}{timeframe !== 'any' ? ` (${timeframeLinks.find(t => t.value === timeframe)?.label})` : ''}</p>
                        </div>

                        {/* Active Filters (Chips) */}
                        {(ft !== 'All' || fq || fl || urgent || fmin || fmax) && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {urgent && <Link href={buildUrl({ type: ft === 'All' ? undefined : ft, q: fq || undefined, location: fl || undefined, timeframe: timeframe !== 'any' ? timeframe : undefined })} className="chip border-[#85bb23] bg-white text-slate-700 hover:bg-slate-50">Up to 3 Days Remaining <X size={11} /></Link>}
                                {ft !== 'All' && <Link href={buildUrl({ q: fq || undefined, location: fl || undefined, timeframe: timeframe !== 'any' ? timeframe : undefined })} className="chip bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">{ft} <X size={11} /></Link>}
                                {fq && <Link href={buildUrl({ type: ft === 'All' ? undefined : ft, location: fl || undefined, timeframe: timeframe !== 'any' ? timeframe : undefined })} className="chip bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100">&ldquo;{fq}&rdquo; <X size={11} /></Link>}
                                {fl && <Link href={buildUrl({ type: ft === 'All' ? undefined : ft, q: fq || undefined, timeframe: timeframe !== 'any' ? timeframe : undefined })} className="chip bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"><MapPin size={11} /> {fl} <X size={11} /></Link>}
                                <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-gray-600 ml-1">Clear all</Link>
                            </div>
                        )}

                        {/* Timeframe Quick-Filter Tabs (WWR-style) */}
                        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mr-2 shrink-0">Time:</span>
                            {timeframeLinks.map(tf => {
                                const Icon = tf.icon;
                                const active = timeframe === tf.value;
                                return (
                                    <Link
                                        key={tf.value}
                                        href={buildUrl({
                                            type: ft === 'All' ? undefined : ft,
                                            q: fq || undefined,
                                            location: fl || undefined,
                                            timeframe: tf.value === 'any' ? undefined : tf.value,
                                        })}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                            active
                                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                                                : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200'
                                        }`}
                                    >
                                        <Icon size={12} />
                                        {tf.label}
                                    </Link>
                                );
                            })}
                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-200 shadow-sm ml-auto shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {urgent ? 'Soonest first' : 'Newest'}
                            </span>
                        </div>

                        {/* Job Listings — using client component for grid/list toggle */}
                        {!jobs.length ? (
                            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white px-8 py-20 text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6"><Search size={32} className="text-gray-300" /></div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No matches yet</h3>
                                <p className="text-gray-500 max-w-md mx-auto text-sm mb-8">We don&apos;t have any listings matching your criteria right now. New opportunities are added daily.</p>
                                <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                                    <a href="https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C" target="_blank" rel="noopener noreferrer"
                                        className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-green-200 bg-green-50 p-6 hover:border-green-400 hover:shadow-lg transition-all">
                                        <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-[#25D366]/30 group-hover:scale-105 transition-transform"><WhatsAppIcon size={26} /></div>
                                        <p className="font-extrabold text-green-800 text-sm">WhatsApp Alerts</p>
                                        <p className="text-xs text-green-600">Get jobs on your phone instantly</p>
                                    </a>
                                    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25"><BellRing size={24} /></div>
                                        <p className="font-extrabold text-blue-800 text-sm">Email Alerts</p>
                                        <div className="w-full"><NoJobsSubscribe query={fq} type={ft} location={fl} /></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <ListingsView jobs={jobs} urgent={urgent} />
                        )}
                    </main>

                    {/* ═══════ SIDEBAR ═══════ */}
                    <aside className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:self-start">
                        {/* Weather Widget */}
                        <WeatherWidget />

                        <div className="rounded-2xl bg-[#25D366] text-white p-6 shadow-[0_20px_50px_-12px_rgba(37,211,102,0.45)]">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4"><WhatsAppIcon size={26} /></div>
                            <h3 className="text-lg font-extrabold mb-1">WhatsApp Job Alerts</h3>
                            <p className="text-sm text-white/90 mb-5 leading-relaxed">Get jobs delivered to your phone. Instant, no spam.</p>
                            <a href="https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C" target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full rounded-full bg-white px-5 py-3 text-sm font-extrabold text-[#075E54] hover:bg-gray-50 transition-all active:scale-[0.98]"><WhatsAppIcon size={18} /> Join Channel</a>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Jobs', icon: Briefcase, href: '/?type=Job', c: 'emerald' },
                                { label: 'Training', icon: BookOpen, href: '/?type=Training', c: 'violet' },
                            ].map(({ label, icon: Ic, href, c }) => (
                                <Link key={label} href={href}
                                    className={`flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-lg hover:border-${c}-200 hover:-translate-y-0.5 transition-all duration-300 group`}>
                                    <div className={`w-12 h-12 rounded-2xl bg-${c}-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Ic size={22} className={`text-${c}-600`} />
                                    </div>
                                    <span className="text-sm font-extrabold text-gray-700">{label}</span>
                                </Link>
                            ))}
                        </div>

                        {urgentJobs.length > 0 && (
                            <div className="rounded-2xl border border-[#85bb23] bg-white p-5 shadow-sm">
                                <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-[#85bb23]" /> Days Remaining
                                </h3>
                                <div className="space-y-3">
                                    {urgentJobs.slice(0, 4).map(j => (
                                        <Link key={j.id} href={`/jobs/${j.id}`} className="block pb-3 border-b border-slate-100 last:border-0 last:pb-0 group">
                                            <p className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 line-clamp-2">{j.title}</p>
                                            <p className="mt-1 text-xs font-semibold text-slate-700">{formatDaysRemaining(getDaysLeft(j.deadline) ?? 0)}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900 mb-4"><ShieldCheck size={16} className="text-emerald-500" /> Why Choose Us?</h3>
                            <div className="space-y-3.5">
                                {[
                                    { i: Shield, t: 'Kenya, freshness and content checks', c: 'text-emerald-500' },
                                    { i: Zap, t: 'Updated daily — fresh opportunities', c: 'text-amber-500' },
                                    { i: CheckCircle, t: 'Never pay merely to apply', c: 'text-green-500' },
                                    { i: Eye, t: 'External listings link to their source', c: 'text-blue-500' },
                                ].map(({ i: Ic, t, c }) => (
                                    <div key={t} className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0`}><Ic size={14} className={c} /></div>
                                        <span className="text-sm text-gray-600 leading-5">{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <NewsWidget />

                        {companies.length > 0 && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-gray-900"><Building2 size={16} className="text-emerald-500" /> Hiring Now</h3>
                                    <Link href="/companies" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">All →</Link>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {companies.map(c => (
                                        <Link key={c} href={`/?q=${encodeURIComponent(c)}`}
                                            className="px-3 py-1.5 rounded-full bg-gray-50 text-xs font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-gray-100 hover:border-emerald-200">{c}</Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </section>

            {/* ═══════ CATEGORY DISCOVERY SECTIONS (WWR-Style) ═══════ */}
            <section className="py-12 sm:py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-emerald-700 mb-4">
                                <Layers size={13} /> Browse by Category
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Explore Opportunities</h2>
                            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Find exactly what you&apos;re looking for across every sector and region.</p>
                        </div>
                    </ScrollReveal>

                    <div className="space-y-10">
                        {/* Jobs Section */}
                        {categoryJobs.length > 0 && (
                            <div>
                                <ScrollReveal>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <Briefcase size={20} className="text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-gray-900">Latest Jobs</h3>
                                                <p className="text-xs text-gray-400">Latest posting {getPostedDaysAgo(categoryJobs[0]?.created_at) || 'recently'}</p>
                                            </div>
                                        </div>
                                        <Link href="/?type=Job" className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                            View all {(jobCount || 0).toLocaleString()} jobs <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                </ScrollReveal>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categoryJobs.slice(0, 6).map((job, idx) => {
                                        const cfg = typeConfig[job.type as OpportunityType] || typeConfig.Job;
                                        const showNew = isNew(job.created_at);
                                        const dl = getDaysLeft(job.deadline);
                                        return (
                                            <ScrollReveal key={job.id} delay={idx * 80}>
                                                <Link href={`/jobs/${job.id}`}
                                                    className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-extrabold shadow-sm`}>
                                                            {job.company.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {showNew && <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-700">New</span>}
                                                            {dl !== null && dl <= 3 && dl > 0 && <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#85bb23] text-slate-950">{formatDaysRemaining(dl)}</span>}
                                                        </div>
                                                    </div>
                                                    <h4 className="font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm leading-snug mb-2">{job.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1 font-semibold text-gray-700"><Building2 size={11} /> {job.company}</span>
                                                        <span className="flex items-center gap-1"><MapPin size={11} /> {job.location || 'Kenya'}</span>
                                                        {(job.salary_min || job.salary_max) && (
                                                            <span className="font-bold text-emerald-700">{job.salary_currency || 'KES'} {(job.salary_min || 0).toLocaleString()}+</span>
                                                        )}
                                                    </div>
                                                </Link>
                                            </ScrollReveal>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Training Section */}
                        {categoryTrainings.length > 0 && (
                            <div>
                                <ScrollReveal>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                                <BookOpen size={20} className="text-violet-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-extrabold text-gray-900">Training & Courses</h3>
                                                <p className="text-xs text-gray-400">Latest posting {getPostedDaysAgo(categoryTrainings[0]?.created_at) || 'recently'}</p>
                                            </div>
                                        </div>
                                        <Link href="/?type=Training" className="flex items-center gap-1 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">
                                            View all {(trainingCount || 0).toLocaleString()} training <ArrowRight size={15} />
                                        </Link>
                                    </div>
                                </ScrollReveal>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categoryTrainings.slice(0, 6).map((job, idx) => {
                                        const cfg = typeConfig[job.type as OpportunityType] || typeConfig.Training;
                                        const showNew = isNew(job.created_at);
                                        const dl = getDaysLeft(job.deadline);
                                        return (
                                            <ScrollReveal key={job.id} delay={idx * 80}>
                                                <Link href={`/jobs/${job.id}`}
                                                    className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-violet-200 hover:-translate-y-0.5 transition-all duration-300">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-extrabold shadow-sm`}>
                                                            {job.company.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {showNew && <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-700">New</span>}
                                                            {dl !== null && dl <= 3 && dl > 0 && <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#85bb23] text-slate-950">{formatDaysRemaining(dl)}</span>}
                                                        </div>
                                                    </div>
                                                    <h4 className="font-extrabold text-gray-900 group-hover:text-violet-700 transition-colors line-clamp-2 text-sm leading-snug mb-2">{job.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1 font-semibold text-gray-700"><Building2 size={11} /> {job.company}</span>
                                                        <span className="flex items-center gap-1"><MapPin size={11} /> {job.location || 'Kenya'}</span>
                                                    </div>
                                                </Link>
                                            </ScrollReveal>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════ FEATURES ═══════ */}
            <section className="py-16 sm:py-20 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-emerald-700 mb-4">
                                <Star size={13} /> Why Job Seekers Love Us
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Everything you need to land your next role</h2>
                            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">We make finding jobs in Kenya simple and transparent.</p>
                        </div>
                    </ScrollReveal>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { i: Shield, t: 'Quality-Screened Listings', d: 'Listings pass Kenya, freshness, content, and application-link checks. External listings are clearly sourced.', c: 'emerald' },
                            { i: BellRing, t: 'Instant Alerts', d: 'Get notified on WhatsApp and email the moment new jobs matching your criteria are posted.', c: 'amber' },
                            { i: Eye, t: 'Track Applications', d: 'Save jobs, track your applications with a visual kanban board, and never miss a deadline.', c: 'blue' },
                            { i: Zap, t: 'Daily Updates', d: 'New opportunities added every single day. Fresh listings from companies across Kenya.', c: 'violet' },
                            { i: Users, t: 'For Everyone', d: 'Jobs for all levels — from entry-level to executive. Plus training programs and scholarships.', c: 'orange' },
                            { i: MessageCircle, t: 'AI-Powered Help', d: 'Get AI-generated cover letters, interview prep, and CV tips tailored to each job.', c: 'teal' },
                        ].map(({ i: Ic, t, d, c }, idx: number) => (
                            <ScrollReveal key={t} delay={idx * 100}>
                                <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300">
                                    <div className={`w-12 h-12 rounded-2xl bg-${c}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <Ic size={22} className={`text-${c}-600`} />
                                    </div>
                                    <h3 className="font-extrabold text-gray-900 mb-2">{t}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ NEWSLETTER CTA ═══════ */}
            <section className="py-16 sm:py-20 bg-emerald-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-extrabold border border-white/20 mb-6 text-white">
                            <BellRing size={16} /> Weekly Newsletter
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                            Get the best jobs delivered to your inbox
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-lg text-white/80 leading-relaxed">
                            Join our newsletter for curated job listings, career tips, and exclusive opportunities every week.
                        </p>
                        <form action="/api/newsletter/subscribe" method="POST" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="your@email.com"
                                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:border-white/40 transition-colors text-sm"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3.5 rounded-xl bg-white text-emerald-700 font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Subscribe
                            </button>
                        </form>
                        <p className="mt-4 text-sm text-white/50">Unsubscribe anytime • No spam</p>
                    </ScrollReveal>
                </div>
            </section>

            {/* ═══════ WHATSAPP CTA ═══════ */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-[#0a0f1a] via-[#0f1724] to-emerald-950 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-5 py-2 text-sm font-extrabold backdrop-blur-sm border border-white/10 mb-6">
                            <Sparkles size={16} className="text-amber-400" /> Never Miss an Opportunity
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                            Latest Kenyan jobs,{' '}
                            <span className="text-amber-400">straight to your phone.</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-lg text-white/65 leading-relaxed">
                            Join thousands of Kenyan youth getting instant job alerts via WhatsApp. Fast and spam-free.
                        </p>
                        <a href="https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C" target="_blank" rel="noopener noreferrer"
                            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-[#25D366]/30 hover:bg-[#1FB855] hover:shadow-2xl transition-all active:scale-[0.98]">
                            <WhatsAppIcon size={22} /> Join WhatsApp Channel
                        </a>
                        <p className="mt-4 text-sm text-white/40">No Spam • Instant Delivery</p>
                    </ScrollReveal>
                </div>
            </section>

            {/* ═══════ EXTERNAL FEED ═══════ */}
            <ExternalJobFeed keywords="jobs" location="Nairobi, Kenya" />
        </div>
    );
}
