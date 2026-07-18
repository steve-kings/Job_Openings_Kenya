'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Bookmark, X, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SavedJob {
    id: string;
    title: string;
    company: string;
    type: string;
    location: string;
}

interface BookmarkContextType {
    savedJobs: SavedJob[];
    toggleBookmark: (job: SavedJob) => void;
    removeBookmark: (id: string) => void;
    isBookmarked: (id: string) => boolean;
    isDrawerOpen: boolean;
    setDrawerOpen: (isOpen: boolean) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

    // Hydrate from localStorage after mount to avoid SSR mismatch
    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem('jobopeningskenya_bookmarks');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSavedJobs(parsed);
                }
            }
        } catch {
            localStorage.removeItem('jobopeningskenya_bookmarks');
        }
    }, []);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [closingJobs, setClosingJobs] = useState<SavedJob[]>([]);
    const [showAlert, setShowAlert] = useState(false);
    const [hasCheckedDeadlines, setHasCheckedDeadlines] = useState(false);

    // Memoize the Supabase client so it's not recreated on every render
    const supabaseRef = useRef(createClient());

    // Persist to localStorage whenever savedJobs changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('jobopeningskenya_bookmarks', JSON.stringify(savedJobs));
        }
    }, [savedJobs, mounted]);

    // Check for expiring jobs (runs once when mounted and savedJobs are hydrated)
    useEffect(() => {
        if (!mounted || savedJobs.length === 0 || hasCheckedDeadlines) return;
        let cancelled = false;

        const checkDeadlines = async () => {
            const ids = savedJobs.map(j => j.id);
            const { data, error } = await supabaseRef.current
                .from('opportunities')
                .select('id, deadline')
                .in('id', ids);
            if (cancelled || !data || error) return null;

            const now = new Date();
            const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
            const expiringIds = data.filter(job => {
                if (!job.deadline) return false;
                const deadlineDate = new Date(job.deadline);
                return deadlineDate > now && deadlineDate <= fortyEightHoursFromNow;
            }).map(job => job.id);

            if (expiringIds.length > 0) {
                return savedJobs.filter(sj => expiringIds.includes(sj.id));
            }
            return null;
        };

        const timer = setTimeout(() => {
            setHasCheckedDeadlines(true);
            checkDeadlines().then(expiring => {
                if (!cancelled && expiring) {
                    setClosingJobs(expiring);
                    setShowAlert(true);
                }
            });
        }, 0);

        return () => { cancelled = true; clearTimeout(timer); };
    }, [mounted, savedJobs, hasCheckedDeadlines]);

    const toggleBookmark = useCallback((job: SavedJob) => {
        setSavedJobs(prev => {
            const exists = prev.find(j => j.id === job.id);
            if (exists) {
                return prev.filter(j => j.id !== job.id);
            } else {
                setDrawerOpen(true);
                return [job, ...prev];
            }
        });
    }, []);

    const removeBookmark = useCallback((id: string) => {
        setSavedJobs(prev => prev.filter(j => j.id !== id));
    }, []);

    const isBookmarked = useCallback((id: string) => {
        return savedJobs.some(j => j.id === id);
    }, [savedJobs]);

    const contextValue = useMemo(() => ({
        savedJobs,
        toggleBookmark,
        removeBookmark,
        isBookmarked,
        isDrawerOpen,
        setDrawerOpen,
    }), [savedJobs, toggleBookmark, removeBookmark, isBookmarked, isDrawerOpen]);

    return (
        <BookmarkContext.Provider value={contextValue}>
            {children}

            {/* Bookmark Drawer & Alerts — only rendered client-side */}
            {mounted && (
                <>
                    {/* Saved-job deadline reminder */}
                    {showAlert && closingJobs.length > 0 && (
                        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full sm:w-auto px-4 mt-16 sm:mt-0">
                            <div className="bg-white border-l-4 border-[#85bb23] shadow-2xl rounded-xl p-4 relative pr-12 flex flex-row items-center gap-4 max-w-lg">
                                <AlertCircle className="text-[#85bb23] flex-shrink-0" size={28} />
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 text-lg">Deadline reminder</h3>
                                    <div className="text-sm text-slate-700 font-medium">
                                        {closingJobs.length} saved {closingJobs.length === 1 ? 'job has' : 'jobs have'} up to 2 days remaining.
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <button
                                        onClick={() => { setShowAlert(false); setDrawerOpen(true); }}
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#85bb23] text-slate-950 text-sm font-bold transition-all hover:brightness-90"
                                    >
                                        View
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowAlert(false)}
                                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Backdrop */}
                    {isDrawerOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity"
                            onClick={() => setDrawerOpen(false)}
                        />
                    )}

                    {/* Drawer */}
                    <div
                        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${
                            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3 text-[#5CB800]">
                                <Bookmark size={24} className="fill-current" />
                                <h2 className="text-xl font-bold text-gray-900">Saved Jobs</h2>
                            </div>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                            {savedJobs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-60">
                                    <Bookmark size={48} className="mb-4 stroke-1" />
                                    <p>No saved jobs yet.</p>
                                    <p className="text-sm">Click the bookmark icon on any opportunity to save it for later!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {savedJobs.map(job => (
                                        <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative group">
                                            <div className="pr-8">
                                                <Link href={`/jobs/${job.id}`} onClick={() => setDrawerOpen(false)}>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-[#5CB800] transition-colors line-clamp-1">{job.title}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                                                    <div className="flex gap-2">
                                                        <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-md text-gray-700">{job.type}</span>
                                                    </div>
                                                </Link>
                                            </div>
                                            <button
                                                onClick={() => removeBookmark(job.id)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-1"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {savedJobs.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-100">
                                <Link
                                    href="/jobs"
                                    onClick={() => setDrawerOpen(false)}
                                    className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-[#5CB800] hover:bg-[#4A9900] text-white font-semibold text-sm transition-colors gap-2"
                                >
                                    Browse More Jobs
                                    <ExternalLink size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);
    if (context === undefined) {
        throw new Error('useBookmarks must be used within a BookmarkProvider');
    }
    return context;
}
