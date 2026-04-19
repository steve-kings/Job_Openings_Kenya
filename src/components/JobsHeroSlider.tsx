'use client'

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const slides = [
    {
        id: 1,
        title: "Discover Your Next",
        highlight: "Big Opportunity",
        description: "Access verified jobs, grants, scholarships, and training programs across Africa. All opportunities are hand-picked and verified by our team.",
        image: "/images/img4.jpg",
        cta1: "Browse Opportunities",
        cta2: "Join WhatsApp"
    },
    {
        id: 2,
        title: "Land Your Dream",
        highlight: "Career Today",
        description: "From entry-level positions to executive roles, find verified job opportunities that match your skills and aspirations across the continent.",
        image: "/images/img5.jpg",
        cta1: "View Jobs",
        cta2: "Get Alerts"
    },
    {
        id: 3,
        title: "Unlock Funding for",
        highlight: "Your Vision",
        description: "Discover grants and funding opportunities for entrepreneurs, startups, and innovators. Turn your ideas into reality with financial support.",
        image: "/images/img6 (2).jpg",
        cta1: "Find Grants",
        cta2: "Learn More"
    },
    {
        id: 4,
        title: "Advance Your Education",
        highlight: "With Scholarships",
        description: "Access fully-funded and partially-funded scholarship opportunities to study at top universities around the world.",
        image: "/images/img7.jpg",
        cta1: "View Scholarships",
        cta2: "Apply Now"
    }
];

export default function JobsHeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlaying(false);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
    };

    const slide = slides[currentSlide];

    return (
        <div className="relative min-h-[600px] overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                {slides.map((s, index) => (
                    <div
                        key={s.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img 
                            src={s.image}
                            alt={s.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-[#1565C0]/90 to-[#1976D2]/85"></div>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20 lg:py-32">
                <div className="max-w-4xl">
                    <div key={slide.id} className="animate-fadeIn">
                        <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                            {slide.title}
                            <span className="block text-[#4CAF50] mt-2">{slide.highlight}</span>
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
                            {slide.description}
                        </p>
                        <div>
                            <a 
                                href="#opportunities" 
                                className="btn bg-[#4CAF50] text-white hover:bg-[#e08d0a] btn-lg border-none px-10"
                            >
                                {slide.cta1}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                {/* Previous Button */}
                <button
                    onClick={prevSlide}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Previous slide"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 rounded-full transition-all ${
                                index === currentSlide 
                                    ? 'bg-[#4CAF50] w-8' 
                                    : 'bg-white/50 w-3 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={nextSlide}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110"
                    aria-label="Next slide"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
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
