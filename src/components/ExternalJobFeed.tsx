'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, MapPin, Building2, Loader2, ChevronRight, Globe, AlertCircle } from 'lucide-react';

interface ExternalJob {
    id: string;
    title: string;
    company: string;
    location: string;
    snippet: string;
    salary: string | null;
    type: string;
    link: string;
    source: string;
    updated: string;
}

interface Props {
    keywords?: string;
    location?: string;
}

export default function ExternalJobFeed({ keywords = 'jobs', location = 'Nairobi, Kenya' }: Props) {
    const [jobs, setJobs] = useState<ExternalJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasApi, setHasApi] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/jobs/external', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keywords, location }),
                });
                const data = await res.json();
                if (!res.ok || !data.jobs?.length) {
                    setHasApi(false);
                } else {
                    setJobs(data.jobs);
                }
            } catch {
                setHasApi(false);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [keywords, location]);

    // Don't render anything if no API keys configured and no results
    if (!loading && (!hasApi || jobs.length === 0)) {
        return null;
    }

    if (loading) {
        return (
            <section className="border-t-2 border-dashed border-amber-200 bg-gradient-to-b from-amber-50/30 to-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-6 text-gray-400">
                        <Loader2 size={18} className="animate-spin mr-2" />
                        <span className="text-sm">Searching partner job boards...</span>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="border-t-2 border-dashed border-amber-200 bg-gradient-to-b from-amber-50/30 to-white py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                                <Globe size={12} />
                                Partner Listings
                            </span>
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900">
                            More Opportunities From Our Partners
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Aggregated from partner job boards. Verify before applying.
                        </p>
                    </div>
                    {jobs.length > 3 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="hidden sm:flex items-center gap-1 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
                        >
                            {expanded ? 'Show less' : `View all ${jobs.length}`}
                            <ChevronRight size={16} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Job Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(expanded ? jobs : jobs.slice(0, 3)).map((job) => (
                        <a
                            key={job.id}
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-300 transition-all p-5 flex flex-col"
                        >
                            {/* Source header */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                    <Globe size={14} className="text-amber-700" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Via {job.source}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(job.updated).toLocaleDateString()}</p>
                                </div>
                                <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <ExternalLink size={9} /> External
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">{job.title}</h3>
                            <div className="space-y-1.5 text-xs text-gray-500 flex-1">
                                <p className="flex items-center gap-1.5 font-medium text-gray-700">
                                    <Building2 size={12} className="text-gray-400 shrink-0" /> {job.company}
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <MapPin size={12} className="text-gray-400 shrink-0" /> {job.location}
                                </p>
                                {job.salary && (
                                    <p className="text-xs text-emerald-600 font-semibold">💰 {job.salary}</p>
                                )}
                            </div>
                            <p className="mt-3 text-xs text-gray-400 line-clamp-2 leading-relaxed">{job.snippet}</p>

                            {/* CTA */}
                            <div className="mt-4 pt-3 border-t border-amber-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{job.type}</span>
                                <span className="text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:text-amber-800 transition-colors">
                                    View Job <ExternalLink size={10} />
                                </span>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Mobile expand */}
                {jobs.length > 3 && (
                    <div className="mt-4 text-center sm:hidden">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-sm font-bold text-amber-700 hover:text-amber-800"
                        >
                            {expanded ? 'Show less' : `View all ${jobs.length} external jobs`}
                        </button>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 bg-white rounded-lg border border-amber-100 p-3">
                    <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p>
                        These listings are sourced from partner job boards via API and are not verified by Job Openings Kenya.
                        We recommend researching the company before applying.
                    </p>
                </div>
            </div>
        </section>
    );
}
