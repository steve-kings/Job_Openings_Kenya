'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, X, Trash2, ExternalLink } from 'lucide-react';

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
    const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('1000jobs_bookmarks');
        if (stored) {
            try {
                setSavedJobs(JSON.parse(stored));
            } catch(e) {}
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('1000jobs_bookmarks', JSON.stringify(savedJobs));
        }
    }, [savedJobs, mounted]);

    const toggleBookmark = (job: SavedJob) => {
        setSavedJobs(prev => {
            const exists = prev.find(j => j.id === job.id);
            if (exists) {
                return prev.filter(j => j.id !== job.id);
            } else {
                setDrawerOpen(true);
                return [job, ...prev];
            }
        });
    };

    const removeBookmark = (id: string) => {
        setSavedJobs(prev => prev.filter(j => j.id !== id));
    };

    const isBookmarked = (id: string) => {
        return savedJobs.some(j => j.id === id);
    };

    return (
        <BookmarkContext.Provider value={{ savedJobs, toggleBookmark, removeBookmark, isBookmarked, isDrawerOpen, setDrawerOpen }}>
            {children}
            
            {/* Bookmark Drawer globally injected */}
            {mounted && (
                <>
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
                            <div className="flex items-center gap-3 text-[#1976D2]">
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
                                                    <h4 className="font-bold text-gray-900 group-hover:text-[#1976D2] transition-colors line-clamp-1">{job.title}</h4>
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
                                    className="btn w-full bg-[#1976D2] hover:bg-[#1565C0] text-white border-none gap-2"
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
