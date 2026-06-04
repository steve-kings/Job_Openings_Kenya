'use client'

import React from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';

interface BookmarkButtonProps {
    job: {
        id: string;
        title: string;
        company: string;
        type: string;
        location: string;
    };
    className?: string;
    showText?: boolean;
}

export default function BookmarkButton({ job, className = '', showText = false }: BookmarkButtonProps) {
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const active = isBookmarked(job.id);

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleBookmark(job);
            }}
            className={`flex items-center justify-center transition-all ${className} ${
                active 
                    ? 'text-[#5CB800] hover:text-[#4A9900]' 
                    : 'text-gray-400 hover:text-[#5CB800]'
            }`}
            title={active ? "Remove Bookmark" : "Save for later"}
        >
            <Bookmark 
                size={showText ? 20 : 24} 
                className={`transition-all duration-300 ${active ? 'fill-current scale-110' : 'hover:scale-110'}`} 
            />
            {showText && (
                <span className="ml-2 font-medium">
                    {active ? 'Saved' : 'Save opportunity'}
                </span>
            )}
        </button>
    );
}
