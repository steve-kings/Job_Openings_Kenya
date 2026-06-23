'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        title: "Transform Your Future",
        subtitle: "With World-Class Skills",
        description: "Access free courses designed specifically for Kenyan job seekers. Learn from industry experts and unlock opportunities across Kenya.",
        image: "/images/shutterstock-2619076999-600x315.jpg",
        gradient: "from-[#5CB800] to-[#4A9900]",
        cta: "Start Learning",
        ctaLink: "https://kings-learn.vercel.app"
    },
    {
        id: 2,
        title: "Master In-Demand Skills",
        subtitle: "Build Your Career",
        description: "From digital marketing to web development, gain practical skills that employers are actively seeking in today's job market.",
        image: "/images/shutterstock-2724545487-600x315.jpg",
        gradient: "from-[#5CB800] to-[#5CB800]",
        cta: "Explore Courses",
        ctaLink: "https://kings-learn.vercel.app"
    },
    {
        id: 3,
        title: "Learn at Your Own Pace",
        subtitle: "Anytime, Anywhere",
        description: "Flexible learning designed for busy schedules. Access courses 24/7 and earn certificates recognized across Kenya.",
        image: "/images/cover-378x198.png",
        gradient: "from-[#5CB800] to-[#4A9900]",
        cta: "Get Started",
        ctaLink: "https://kings-learn.vercel.app"
    },
    {
        id: 4,
        title: "Join 850+ Students",
        subtitle: "Growing Community",
        description: "Be part of a thriving community of learners. Connect, collaborate, and grow together with peers across Kenya.",
        image: "/images/advance-your-career.png",
        gradient: "from-[#4A9900] to-[#5CB800]",
        cta: "Join Now",
        ctaLink: "https://kings-learn.vercel.app"
    }
];

export default function CoursesHeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

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

    return (
        <div className="relative h-[600px] lg:h-[700px] overflow-hidden bg-gray-900">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        index === currentSlide
                            ? 'opacity-100 translate-x-0'
                            : index < currentSlide
                            ? 'opacity-0 -translate-x-full'
                            : 'opacity-0 translate-x-full'
                    }`}
                >
                    {/* Background Image with Parallax Effect */}
                    <div className="absolute inset-0">
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            sizes="100vw"
                            className="object-cover scale-110"
                            style={{
                                transform: index === currentSlide ? 'scale(1)' : 'scale(1.1)',
                                transition: 'transform 8s ease-out'
                            }}
                        />
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`}></div>
                        
                        {/* Animated Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="container mx-auto px-6 lg:px-12 h-full relative z-10">
                        <div className="flex items-center h-full">
                            <div className="max-w-3xl">
                                {/* Animated Content */}
                                <div
                                    className={`transition-all duration-1000 delay-300 ${
                                        index === currentSlide
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-10'
                                    }`}
                                >
                                    {/* Subtitle */}
                                    <div className="inline-block mb-4 px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                                        <span className="text-white font-semibold text-sm tracking-wider uppercase">
                                            {slide.subtitle}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-5xl lg:text-7xl font-black mb-6 text-white leading-tight">
                                        {slide.title}
                                    </h1>

                                    {/* Description */}
                                    <p className="text-xl lg:text-2xl text-white/95 mb-8 leading-relaxed max-w-2xl">
                                        {slide.description}
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-wrap gap-4">
                                        <a
                                            href={slide.ctaLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center bg-white text-gray-900 hover:bg-gray-100 px-10 py-3 text-lg rounded-xl shadow-2xl font-bold"
                                        >
                                            {slide.cta}
                                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </a>
                                        <Link
                                            href="/about"
                                            className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-3 text-lg rounded-xl font-bold"
                                        >
                                            Learn More
                                        </Link>
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-12 flex flex-wrap gap-8">
                                        <div className="text-white">
                                            <div className="text-3xl font-bold">850+</div>
                                            <div className="text-sm text-white/80">Students Trained</div>
                                        </div>
                                        <div className="text-white">
                                            <div className="text-3xl font-bold">100%</div>
                                            <div className="text-sm text-white/80">Free Courses</div>
                                        </div>
                                        <div className="text-white">
                                            <div className="text-3xl font-bold">24/7</div>
                                            <div className="text-sm text-white/80">Support</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group"
                aria-label="Previous slide"
            >
                <ChevronLeft className="text-white group-hover:scale-110 transition-transform" size={28} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group"
                aria-label="Next slide"
            >
                <ChevronRight className="text-white group-hover:scale-110 transition-transform" size={28} />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all ${
                            index === currentSlide
                                ? 'w-12 h-3 bg-white'
                                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
                        } rounded-full`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute top-8 right-8 z-20 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white font-semibold text-sm">
                    {currentSlide + 1} / {slides.length}
                </span>
            </div>
        </div>
    );
}
