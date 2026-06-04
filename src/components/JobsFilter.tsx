'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

export default function JobsFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    
    const [type, setType] = useState(searchParams.get('type') || 'All');
    const [query, setQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            
            if (type === 'All') params.delete('type');
            else params.set('type', type);

            if (!query.trim()) params.delete('q');
            else params.set('q', query.trim());

            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }, 300); // 300ms debounce
        
        return () => clearTimeout(timer);
    }, [type, query, router, searchParams]);

    return (
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search job, company, or country..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <div className="relative">
                <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5CB800] z-10 pointer-events-none" />
                <select
                    className="w-full sm:w-auto pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm font-semibold transition-all appearance-none bg-white cursor-pointer"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="Job">💼 Jobs</option>
                    <option value="Grant">💰 Grants</option>
                    <option value="Scholarship">🎓 Scholarships</option>
                    <option value="Training">📚 Trainings</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
    );
}
