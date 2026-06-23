'use client'

import Link from 'next/link';
import { Building } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function HiringNowSlider({ companies }: { companies: string[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || isHovered) return;
        
        let animationFrameId: number;
        
        const scroll = () => {
            if (el) {
                el.scrollLeft += 1;
                // Since we duplicated the array 3 times, original width is scrollWidth / 3
                if (el.scrollLeft >= el.scrollWidth / 3) {
                    el.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isHovered]);

    // Tripled array for seamless infinite scroll
    const duplicatedCompanies = [...companies, ...companies, ...companies];

    return (
        <div 
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex gap-4 sm:gap-6 overflow-x-hidden pb-4 cursor-grab active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {duplicatedCompanies.map((company, idx) => (
                <Link 
                    key={idx} 
                    href={`/?q=${encodeURIComponent(company)}`}
                    className="shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-[#5CB800]/30 min-w-[180px] max-w-[180px] group relative overflow-hidden"
                >
                    {/* Hover gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#5CB800]/5 to-[#4A9900]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center w-full">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 group-hover:border-[#5CB800] flex items-center justify-center mb-4 group-hover:scale-110 transition-all shadow-sm group-hover:shadow-lg">
                            <Building className="text-gray-400 group-hover:text-[#5CB800] transition-colors" size={28} />
                        </div>
                        <h3 className="font-bold text-gray-800 group-hover:text-[#5CB800] text-center text-sm line-clamp-2 w-full mb-2 transition-colors min-h-[2.5rem] flex items-center justify-center" title={company}>
                            {company}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-[#5CB800] font-semibold bg-[#5CB800]/10 px-3 py-1 rounded-full group-hover:bg-[#5CB800] group-hover:text-white transition-all">
                            <span>View Jobs</span>
                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5CB800] to-[#4A9900] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
            ))}
        </div>
    );
}
