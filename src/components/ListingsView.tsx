'use client'

import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight, Building2, Calendar, Clock, ExternalLink,
    LayoutGrid, List, MapPin, Wallet, Star,
} from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import { useViewMode } from './ViewToggle';
import { type JobData, type OpportunityType, typeConfig, getDaysLeft, getPostedDaysAgo, isNew, fmtDate, cleanSummary } from '@/lib/utils/jobs';
export type { JobData } from '@/lib/utils/jobs';

export default function ListingsView({ jobs }: { jobs: JobData[]; urgent?: boolean }) {
    const { view, toggleView } = useViewMode();

    if (!jobs.length) return null;

    return (
        <>
            {/* View Toggle */}
            <div className="flex items-center gap-1.5 ml-auto">
                <button
                    onClick={() => toggleView('grid')}
                    className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    title="Card view"
                >
                    <LayoutGrid size={16} />
                </button>
                <button
                    onClick={() => toggleView('list')}
                    className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    title="List view"
                >
                    <List size={16} />
                </button>
            </div>

            {/* Grid View */}
            {view === 'grid' && (
                <div className="space-y-4">
                    {jobs.map((job) => {
                        const cfg = typeConfig[job.type as OpportunityType] || typeConfig.Job;
                        const Icon = cfg.icon;
                        const dl = getDaysLeft(job.deadline);
                        const expiring = dl !== null && dl <= 3 && dl > 0;
                        const postedAgo = getPostedDaysAgo(job.created_at);
                        const showNew = isNew(job.created_at);
                        return (
                            <article key={job.id}
                                className="group relative bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                <div className={`h-1 bg-gradient-to-r ${cfg.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                <div className="p-5 sm:p-6">
                                    <div className="flex gap-4 sm:gap-5">
                                        {/* Image */}
                                        <div className="hidden sm:block shrink-0">
                                            {job.thumbnail_url ? (
                                                <Image src={job.thumbnail_url} alt={job.company} width={64} height={64} unoptimized
                                                    className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-300`}>
                                                    {(job.company || 'J').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${cfg.softBg} ${cfg.softText}`}>
                                                    <Icon size={11} /> {job.type}
                                                </span>
                                                {showNew && <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-600 flex items-center gap-1"><Star size={10} className="fill-amber-500 text-amber-500" /> New</span>}
                                                {expiring && <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-50 text-red-600 flex items-center gap-1"><Clock size={10} /> {dl}d left</span>}
                                                {postedAgo && !showNew && (
                                                    <span className="text-[10px] font-semibold text-gray-400">{postedAgo}</span>
                                                )}
                                            </div>
                                            <Link href={`/jobs/${job.id}`} className="block">
                                                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors duration-200">{job.title}</h3>
                                            </Link>
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-sm">
                                                <span className="flex items-center gap-1.5 font-semibold text-gray-700"><Building2 size={14} className="text-gray-400" /> {job.company}</span>
                                                <span className="flex items-center gap-1.5 text-gray-500"><MapPin size={14} className="text-gray-400" /> {job.location || 'Kenya'}</span>
                                                <span className="flex items-center gap-1.5 text-gray-500"><Calendar size={14} className="text-gray-400" /> {fmtDate(job.deadline)}</span>
                                                {(job.salary_min || job.salary_max) && (
                                                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold"><Wallet size={14} className="text-emerald-400" /> {job.salary_currency || 'KES'} {(job.salary_min || 0).toLocaleString()}{job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}</span>
                                                )}
                                            </div>
                                            <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-2">{cleanSummary(job)}</p>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {[job.requirements?.[0], job.benefits?.[0], job.responsibilities?.[0]].filter(Boolean).slice(0, 3).map(chip => (
                                                    <span key={chip} className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.softBg} ${cfg.softText}`}>{chip}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex flex-col items-end justify-between shrink-0">
                                            <BookmarkButton job={{ id: job.id, title: job.title, company: job.company, type: job.type, location: job.location }}
                                                className="p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100" />
                                            <span className={`text-xs font-bold ${expiring ? 'text-red-500' : 'text-gray-400'}`}>{dl === null ? 'Ongoing' : dl === 0 ? 'Today' : `${dl}d`}</span>
                                        </div>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
                                        <Link href={`/jobs/${job.id}`} className="text-sm font-extrabold text-gray-500 hover:text-emerald-700 transition-colors flex items-center gap-1 group/link shrink-0">
                                            View Details <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                                        </Link>
                                        <Link href={`/jobs/${job.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 hover:shadow-md active:scale-[0.98] shrink-0">
                                            Apply Now <ExternalLink size={13} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* List View (Compact Horizontal Rows — WWR Style) */}
            {view === 'list' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* List header */}
                    <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_140px_140px_120px_80px] gap-3 px-5 py-3 bg-gray-50/50 border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                        <span>Position</span>
                        <span>Company</span>
                        <span>Location</span>
                        <span>Salary</span>
                        <span className="text-right">Posted</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {jobs.map((job) => {
                            const dl = getDaysLeft(job.deadline);
                            const expiring = dl !== null && dl <= 3 && dl > 0;
                            const postedAgo = getPostedDaysAgo(job.created_at);
                            const showNew = isNew(job.created_at);
                            return (
                                <Link key={job.id} href={`/jobs/${job.id}`}
                                    className="block sm:grid sm:grid-cols-[minmax(0,2fr)_140px_140px_120px_80px] gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors group/list items-center">
                                    {/* Position */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-lg bg-gray-100 items-center justify-center text-xs font-extrabold text-gray-500 group-hover/list:bg-emerald-100 group-hover/list:text-emerald-700 transition-colors">
                                            {(job.company || 'J').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 min-w-0 w-full">
                                                <span className="font-bold text-sm text-gray-900 group-hover/list:text-emerald-700 transition-colors truncate flex-1 min-w-0">{job.title}</span>
                                                {showNew && <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-700">New</span>}
                                                {expiring && <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-100 text-red-600">{dl}d</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                                                <span className="text-xs text-gray-500">{job.company}</span>
                                                <span className="text-[10px] text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{job.location || 'Kenya'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Company */}
                                    <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 truncate">
                                        <Building2 size={12} className="text-gray-300 shrink-0" /> {job.company}
                                    </span>
                                    {/* Location */}
                                    <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 truncate">
                                        <MapPin size={12} className="text-gray-300 shrink-0" /> {job.location || 'Kenya'}
                                    </span>
                                    {/* Salary */}
                                    <span className="hidden sm:block text-sm font-semibold text-emerald-700 truncate">
                                        {(job.salary_min || job.salary_max) ? `${job.salary_currency || 'KES'} ${(job.salary_min || 0).toLocaleString()}` : '—'}
                                    </span>
                                    {/* Posted */}
                                    <span className="hidden sm:flex items-center justify-end gap-1 text-xs text-gray-400">
                                        {showNew ? <span className="text-amber-600 font-bold">New</span> : postedAgo}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
