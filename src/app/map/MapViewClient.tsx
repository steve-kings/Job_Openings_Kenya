'use client'

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Briefcase, BookOpen, Search, X, ExternalLink, Clock, Layers, ArrowRight, ChevronRight } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

interface Opportunity {
    id: string;
    title: string;
    company: string;
    type: string;
    location: string;
    deadline: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'Nairobi': { lat: -1.2921, lng: 36.8219 },
    'Mombasa': { lat: -4.0435, lng: 39.6682 },
    'Kisumu': { lat: -0.0917, lng: 34.7680 },
    'Nakuru': { lat: -0.3031, lng: 36.0800 },
    'Eldoret': { lat: 0.5204, lng: 35.2699 },
    'Nyeri': { lat: -0.4202, lng: 36.9516 },
    'Thika': { lat: -1.0396, lng: 37.0699 },
    'Malindi': { lat: -3.2175, lng: 40.1199 },
    'Kitale': { lat: 1.0153, lng: 35.0062 },
    'Machakos': { lat: -1.5189, lng: 37.2649 },
    'Nanyuki': { lat: 0.0095, lng: 37.0736 },
    'Kericho': { lat: -0.3684, lng: 35.2834 },
    'Embu': { lat: -0.5390, lng: 37.4596 },
    'Meru': { lat: 0.0473, lng: 37.6496 },
    'Garissa': { lat: -0.4528, lng: 39.6463 },
    'Remote': { lat: -0.2867, lng: 36.8000 },
};

function getCoords(location: string) {
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (location.toLowerCase().includes(city.toLowerCase())) return coords;
    }
    return { lat: -1.0, lng: 37.0 };
}

function getDaysLeft(deadline: string) {
    return Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
}

function fmtSalary(job: Opportunity) {
    if (!job.salary_min && !job.salary_max) return null;
    const c = job.salary_currency || 'KES';
    const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
    if (job.salary_min && job.salary_max) return `${c} ${fmt(job.salary_min)}–${fmt(job.salary_max)}`;
    if (job.salary_min) return `${c} ${fmt(job.salary_min)}+`;
    return `Up to ${c} ${fmt(job.salary_max!)}`;
}

export default function MapViewClient({ opportunities }: { opportunities: Opportunity[] }) {
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['Job', 'Training']));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedJobs, setSelectedJobs] = useState<Opportunity[]>([]);
    const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

    const toggleType = (t: string) => {
        const next = new Set(selectedTypes);
        if (next.has(t)) next.delete(t); else next.add(t);
        setSelectedTypes(next);
    };

    const filtered = useMemo(() => {
        return opportunities.filter(o => {
            if (!selectedTypes.has(o.type)) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q) || o.location.toLowerCase().includes(q);
            }
            return true;
        });
    }, [opportunities, selectedTypes, searchQuery]);

    const locationGroups = useMemo(() => {
        const groups: Record<string, { coords: { lat: number; lng: number }; count: number; jobs: Opportunity[] }> = {};
        for (const opp of filtered) {
            const key = opp.location;
            if (!groups[key]) groups[key] = { coords: getCoords(opp.location), count: 0, jobs: [] };
            groups[key].count++;
            groups[key].jobs.push(opp);
        }
        return Object.entries(groups).sort((a, b) => b[1].count - a[1].count);
    }, [filtered]);

    const handleLocationClick = (location: string, jobs: Opportunity[]) => {
        if (selectedJobs.length > 0 && selectedJobs[0].location === location) {
            setSelectedJobs([]);
        } else {
            setSelectedJobs(jobs);
        }
    };

    const jobCount = filtered.filter(o => o.type === 'Job').length;
    const trainingCount = filtered.filter(o => o.type === 'Training').length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ═══════ HERO ═══════ */}
            <section className="relative overflow-hidden h-[280px] sm:h-[340px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <ScrollReveal>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                                <MapPin size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-lg">Job Map</h1>
                                <p className="text-sm text-white/60">Explore {opportunities.length} opportunities across Kenya</p>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Search + Filters */}
                    <ScrollReveal delay={100}>
                        <div className="flex flex-wrap items-center gap-2.5 mt-5 max-w-2xl">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input type="text" placeholder="Search by title, company, or location..." value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-8 py-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-sm text-white placeholder-white/40 outline-none focus:border-white/30 focus:bg-white/15 transition-all" />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            {['Job', 'Training'].map(t => (
                                <button key={t} onClick={() => toggleType(t)}
                                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        selectedTypes.has(t)
                                            ? t === 'Job'
                                                ? 'bg-emerald-500/90 border-emerald-400 text-white'
                                                : 'bg-violet-500/90 border-violet-400 text-white'
                                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                    }`}>
                                    {t === 'Job' ? <Briefcase size={12} /> : <BookOpen size={12} />}
                                    {t}s
                                </button>
                            ))}
                            <span className="text-xs text-white/40 ml-auto">{filtered.length} results</span>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ═══════ MAIN CONTENT ═══════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ── LEFT: Location List ── */}
                    <div className="lg:col-span-1">
                        <ScrollReveal>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-extrabold text-sm text-slate-900">Locations</h3>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{locationGroups.length} cities</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Jobs ({jobCount})</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Training ({trainingCount})</span>
                                    </div>
                                </div>

                                {/* List */}
                                <div className="divide-y divide-slate-50 max-h-[calc(100vh-380px)] overflow-y-auto">
                                    {locationGroups.map(([location, { count, coords, jobs }]) => {
                                        const isSelected = selectedJobs.length > 0 && selectedJobs[0].location === location;
                                        const isHovered = hoveredLocation === location;
                                        const color = count > 5 ? 'red' : count > 2 ? 'amber' : 'emerald';
                                        return (
                                            <button key={location} onClick={() => handleLocationClick(location, jobs)}
                                                onMouseEnter={() => setHoveredLocation(location)}
                                                onMouseLeave={() => setHoveredLocation(null)}
                                                className={`w-full text-left px-5 py-3.5 transition-all flex items-center gap-4 ${
                                                    isSelected ? 'bg-emerald-50/50' : isHovered ? 'bg-slate-50' : ''
                                                }`}>
                                                {/* Location dot */}
                                                <div className={`relative shrink-0`}>
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? `bg-${color}-100 text-${color}-600 scale-110`
                                                            : `bg-slate-100 text-slate-500`
                                                    }`}>
                                                        <MapPin size={16} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm text-slate-900 truncate">{location}</p>
                                                        <span className={`shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                                            count > 5 ? 'bg-red-50 text-red-600' : count > 2 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                        }`}>{count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        {jobs.slice(0, 2).map(j => (
                                                            <span key={j.id} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                                j.type === 'Job' ? 'bg-emerald-50/50 text-emerald-600' : 'bg-violet-50/50 text-violet-600'
                                                            }`}>{j.type}</span>
                                                        ))}
                                                        {count > 2 && <span className="text-[10px] text-slate-400">+{count - 2}</span>}
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className={`text-slate-300 transition-transform ${isSelected ? 'rotate-90 text-emerald-500' : ''}`} />
                                            </button>
                                        );
                                    })}
                                    {locationGroups.length === 0 && (
                                        <div className="px-5 py-12 text-center text-slate-400">
                                            <MapPin size={28} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-xs font-medium">No matches found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* ── RIGHT: Map + Detail ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Visual Map */}
                        <ScrollReveal delay={100}>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                                        <Layers size={15} className="text-emerald-500" /> Opportunity Map
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-bold">{locationGroups.length} locations</span>
                                </div>

                                {/* Map */}
                                <div className="relative bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30 rounded-xl border border-slate-100 overflow-hidden" style={{ height: 420 }}>
                                    {/* Grid */}
                                    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                                        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
                                        <rect width="100%" height="100%" fill="url(#grid)" />
                                    </svg>

                                    {/* Kenya outline */}
                                    <svg viewBox="34 6 8 10" className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="xMidYMid meet">
                                        <path d="M36,7 L39,6.5 L41.5,7 L42,8 L41.5,9.5 L42,11 L41,12.5 L39.5,14 L38,15 L36.5,15 L35,14 L34.5,12.5 L34,11 L34.5,9 L35.5,8 Z"
                                            fill="currentColor" className="text-emerald-600" stroke="currentColor" strokeWidth="0.3" />
                                    </svg>

                                    {/* City markers */}
                                    {locationGroups.map(([location, { coords, count, jobs }]) => {
                                        const x = ((coords.lng - 34) / 8) * 100;
                                        const y = ((7 - (coords.lat + 5)) / 12) * 100;
                                        const size = Math.min(52, 18 + count * 5);
                                        const color = count > 5 ? 'red' : count > 2 ? 'amber' : 'emerald';
                                        const isSelected = selectedJobs.length > 0 && selectedJobs[0].location === location;
                                        return (
                                            <div key={location} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                                                style={{ left: `${x}%`, top: `${y}%` }}
                                                onClick={() => handleLocationClick(location, jobs)}
                                                onMouseEnter={() => setHoveredLocation(location)}
                                                onMouseLeave={() => setHoveredLocation(null)}>
                                                {/* Ripple */}
                                                <div className={`absolute inset-0 rounded-full bg-${color}-400/20 animate-ping`}
                                                    style={{ width: size + 12, height: size + 12, left: -(size + 12) / 2 + size / 2, top: -(size + 12) / 2 + size / 2 }} />
                                                {/* Dot */}
                                                <div className={`rounded-full flex items-center justify-center text-white font-extrabold shadow-lg transition-all group-hover:scale-125 ${
                                                    isSelected ? `bg-${color}-600 ring-4 ring-${color}-200 scale-110` : `bg-${color}-500`
                                                }`}
                                                    style={{ width: size, height: size, fontSize: Math.max(10, size * 0.3) }}>
                                                    {count}
                                                </div>
                                                {/* Label */}
                                                <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-[10px] font-extrabold whitespace-nowrap px-2 py-0.5 rounded-full transition-all ${
                                                    isSelected
                                                        ? 'bg-white text-slate-900 shadow-sm'
                                                        : 'text-slate-600 bg-white/70'
                                                }`}>
                                                    {location}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="flex items-center gap-5 mt-4 text-[11px] font-semibold text-slate-500">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> 1–2</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> 3–5</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500" /> 5+</span>
                                    <span className="ml-auto">Click a marker to see jobs</span>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Selected Location Detail */}
                        {selectedJobs.length > 0 && (
                            <ScrollReveal variant="scale">
                                <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                                    <div className="px-5 py-3 border-b border-emerald-50 flex items-center justify-between bg-emerald-50/30">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={15} className="text-emerald-600" />
                                            <p className="font-extrabold text-sm text-slate-900">{selectedJobs[0].location}</p>
                                            <span className="text-xs text-slate-400">{selectedJobs.length} {selectedJobs.length === 1 ? 'opportunity' : 'opportunities'}</span>
                                        </div>
                                        <button onClick={() => setSelectedJobs([])} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white">
                                            <X size={15} />
                                        </button>
                                    </div>
                                    <div className="divide-y divide-slate-50 max-h-[340px] overflow-y-auto">
                                        {selectedJobs.slice(0, 10).map(job => {
                                            const salary = fmtSalary(job);
                                            return (
                                                <Link key={job.id} href={`/jobs/${job.id}`}
                                                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                                        job.type === 'Job' ? 'bg-emerald-100 text-emerald-600' : 'bg-violet-100 text-violet-600'
                                                    }`}>
                                                        {job.type === 'Job' ? <Briefcase size={14} /> : <BookOpen size={14} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{job.title}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        {salary && <p className="text-xs font-extrabold text-slate-700">{salary}</p>}
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                                                            <Clock size={9} /> {getDaysLeft(job.deadline)}d left
                                                        </p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </ScrollReveal>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom padding */}
            <div className="h-12" />
        </div>
    );
}
