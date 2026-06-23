'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SLIDES = [
    {
        url: '/images/right-talent-desktop.png',
        alt: 'Find the right talent',
    },
    {
        url: '/images/seeker-hero.png',
        alt: 'Job seeker hero',
    },
    {
        url: '/images/advance-your-career.png',
        alt: 'Advance your career',
    },
    {
        url: '/images/shutterstock-2619076999-600x315.jpg',
        alt: 'Professional workspace',
    },
];

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0">
            {SLIDES.map((slide, i) => (
                <div
                    key={slide.url}
                    className="absolute inset-0 transition-opacity duration-1000"
                    style={{ opacity: i === current ? 1 : 0 }}
                >
                    <Image
                        src={slide.url}
                        alt={slide.alt}
                        fill
                        sizes="100vw"
                        priority={i === 0}
                        className="object-cover"
                    />
                </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-900/60 to-emerald-900/55" />

            {/* Slide dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === current ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
