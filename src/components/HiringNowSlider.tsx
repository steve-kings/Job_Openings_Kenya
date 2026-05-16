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
                    className="shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 min-w-[160px] max-w-[160px] group"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        <Building className="text-gray-400 group-hover:text-[#1976D2] transition-colors" size={28} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-center text-sm line-clamp-1 w-full" title={company}>{company}</h3>
                    <p className="text-xs text-[#1976D2] mt-1 font-semibold">View Jobs</p>
                </Link>
            ))}
        </div>
    );
}
