'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

const slides = [
    {
        image: '/images/advance-your-career.png',
        title: 'Your Career Journey Starts Here',
        subtitle: 'Track applications, save jobs, and get hired',
    },
    {
        image: '/images/seeker-hero.png',
        title: 'Stay Organized, Stay Ahead',
        subtitle: 'Manage all your applications in one place',
    },
    {
        image: '/images/right-talent-desktop.png',
        title: 'Build Your Professional Profile',
        subtitle: 'Showcase your skills to top employers in Kenya',
    },
];

export default function DashboardHeroSlider() {
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const goTo = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning]);

    useEffect(() => {
        const timer = setInterval(() => {
            goTo((current + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [current, goTo]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Slides */}
            {slides.map((slide, i) => (
                <div
                    key={i}
                    className="absolute inset-0 transition-all duration-1000 ease-in-out"
                    style={{
                        opacity: i === current ? 1 : 0,
                        transform: i === current ? 'scale(1)' : 'scale(1.1)',
                    }}
                >
                    <Image
                        src={slide.image}
                        alt=""
                        fill
                        className="object-cover"
                        priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-900/70 to-emerald-900/80" />
                </div>
            ))}

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center">
                <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 text-center transition-all duration-700"
                    style={{
                        opacity: isTransitioning ? 0.7 : 1,
                        transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
                    }}
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">
                        {slides[current].title}
                    </h2>
                    <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto">
                        {slides[current].subtitle}
                    </p>
                </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            i === current
                                ? 'bg-white w-6'
                                : 'bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
