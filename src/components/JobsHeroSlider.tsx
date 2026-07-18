'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface Slide {
    id: number | string;
    title: string;
    image: string;
    highlight?: string;
    description?: string;
    cta1?: string;
    cta2?: string;
    link?: string;
    isBanner?: boolean;
    thumbnail_url?: string;
    apply_url?: string;
}

const defaultSlides: Slide[] = [
    {
        id: 1,
        title: "Discover Your Next",
        highlight: "Big Opportunity",
        description: "Explore Kenya-focused jobs and professional training. Listings are checked for freshness and useful application details, with external sources clearly linked.",
        image: "/images/seeker-hero.png",
        cta1: "Browse Opportunities",
        cta2: "Join WhatsApp"
    },
    {
        id: 2,
        title: "Land Your Dream",
        highlight: "Career Today",
        description: "From entry-level positions to executive roles, find current opportunities that match your skills and career goals.",
        image: "/images/right-talent-desktop.png",
        cta1: "View Jobs",
        cta2: "Get Alerts"
    },
    {
        id: 3,
        title: "Upskill With",
        highlight: "Professional Training",
        description: "Explore training programs and certifications to build your skills. Confirm the provider and course details before enrolling.",
        image: "/images/advance-your-career.png",
        cta1: "Browse Training",
        cta2: "Learn More"
    }
];

export default function JobsHeroSlider({ customSlides }: { customSlides?: Slide[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const displaySlides: Slide[] = customSlides && customSlides.length > 0 
        ? customSlides.map(slide => ({
            id: slide.id,
            isBanner: true,
            title: slide.title,
            image: slide.thumbnail_url || '/images/seeker-hero.png',
            link: slide.apply_url || '#'
        }))
        : defaultSlides;

    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, displaySlides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
        setIsAutoPlaying(false);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
    };

    const slide = displaySlides[currentSlide];

    return (
        <div className="relative min-h-[500px] lg:min-h-[600px] overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                {displaySlides.map((s, index) => (
                    <div
                        key={s.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        {('isBanner' in s && s.isBanner) ? (
                            <a href={s.link || '#'} target={s.link && s.link !== '#' ? "_blank" : undefined} rel="noopener noreferrer" className="block relative w-full h-full cursor-pointer">
                                <Image 
                                    src={s.image}
                                    alt={s.title}
                                    fill
                                    sizes="100vw"
                                    className="object-cover object-center"
                                />
                                {/* Light gradient at bottom for controls visibility */}
                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none"></div>
                            </a>
                        ) : (
                            <>
                                <Image 
                                    src={s.image}
                                    alt={s.title}
                                    fill
                                    sizes="100vw"
                                    priority={index === 0}
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-[#4A9900]/90 to-[#5CB800]/85"></div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Content (Only for default text slides) */}
            <div className="container mx-auto px-6 lg:px-12 relative z-20 py-20 lg:py-32 pointer-events-none">
                <div className="max-w-4xl pointer-events-auto">
                    {!('isBanner' in slide && slide.isBanner) && (
                        <div key={slide.id} className="animate-fadeIn">
                            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                                {slide.title}
                                <span className="block text-[#5CB800] mt-2">{slide.highlight || ''}</span>
                            </h1>
                            <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
                                {slide.description || ''}
                            </p>
                            <div>
                                <a 
                                    href="#opportunities" 
                                    className="inline-flex items-center justify-center bg-[#5CB800] text-white hover:bg-[#e08d0a] px-10 py-3 text-lg rounded-xl font-bold"
                                >
                                    {slide.cta1 || 'Learn More'}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slider Controls */}
            {displaySlides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30 pointer-events-auto">
                    {/* Previous Button */}
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/10"
                        aria-label="Previous slide"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>

                    {/* Dots */}
                    <div className="flex gap-2">
                        {displaySlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-3 rounded-full transition-all shadow-sm ${
                                    index === currentSlide 
                                        ? 'bg-[#5CB800] w-8' 
                                        : 'bg-white/50 w-3 hover:bg-white/70'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-lg border border-white/10"
                        aria-label="Next slide"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            )}

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                </svg>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out;
                }
            `}</style>
        </div>
    );
}
