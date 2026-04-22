'use client'

import React from 'react';
import Link from 'next/link';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { Bookmark, Building, ExternalLink, MapPin, Trash2, ArrowRight } from 'lucide-react';

export default function SavedJobsPage() {
    const { savedJobs, removeBookmark } = useBookmarks();

    const typeColors = {
        'Job': 'bg-[#1976D2]/10 text-[#1976D2] border-[#1976D2]/20',
        'Grant': 'bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20',
        'Scholarship': 'bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20',
        'Training': 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20',
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white p-8 lg:p-10 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3">
                            <Bookmark size={32} className="fill-white" />
                            My Saved Opportunities
                        </h1>
                        <p className="text-white/80 mt-2 text-lg">Keep track of the jobs, grants, and scholarships you love.</p>
                    </div>
                </div>
            </div>

            {/* List */}
            {savedJobs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-24 h-24 bg-[#1976D2]/5 rounded-full flex items-center justify-center mb-6">
                        <Bookmark size={48} className="text-[#1976D2] opacity-50 stroke-1" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Saved Opportunities Yet</h3>
                    <p className="text-gray-500 mb-8 max-w-md">
                        Start exploring the opportunities directory! Whenever you see something interesting, hit the bookmark icon to save it here for later.
                    </p>
                    <Link href="/jobs" className="btn bg-[#1976D2] hover:bg-[#1565C0] text-white border-none px-8 rounded-xl shadow-lg shadow-[#1976D2]/20">
                        Explore Opportunities <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedJobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group relative p-6">
                            
                            <button 
                                onClick={(e) => { e.preventDefault(); removeBookmark(job.id); }}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                                title="Remove bookmark"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="mb-4 pr-10">
                                <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg border mb-3 ${typeColors[job.type as keyof typeof typeColors] || typeColors['Job']}`}>
                                    {job.type}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1976D2] transition-colors line-clamp-2">
                                    {job.title}
                                </h3>
                            </div>

                            <div className="space-y-2 mt-auto mb-6">
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <Building size={16} className="text-[#1976D2]" />
                                    <span className="font-semibold line-clamp-1">{job.company}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span className="line-clamp-1">{job.location}</span>
                                </div>
                            </div>

                            <Link href={`/jobs/${job.id}`} className="btn w-full bg-gray-50 hover:bg-[#1976D2] hover:text-white text-gray-700 border-none transition-colors mt-auto group/btn">
                                View Details <ExternalLink size={16} className="text-gray-400 group-hover/btn:text-white" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
