'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faBriefcase, faGraduationCap, faHandHoldingDollar, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const slides = [
  {
    id: 1,
    title: "1000 JOB",
    highlight: "OPPORTUNITIES",
    subtitle: "Daily Verified Jobs • No Scams • 100% Free",
    description: "Find Entry-Level & Graduate Jobs across Kenya, Africa & Remote. We provide clear application links, updated daily, and manually verified before posting.",
    image: "/images/img1.jpg",
    stat: "1,000+",
    statLabel: "Verified Jobs",
    statSubLabel: "Daily Updates"
  },
  {
    id: 2,
    title: "Clear Application",
    highlight: "Links Provided",
    subtitle: "Kenya | Africa | Remote",
    description: "Stop wasting time on scams. We manually verify every opportunity before posting it, ensuring 100% free and genuine entry-level and graduate jobs.",
    image: "/images/img2.jpg",
    stat: "100%",
    statLabel: "Scam Free",
    statSubLabel: "Manually Verified"
  },
  {
    id: 3,
    title: "Empowering youth with",
    highlight: "Daily Updates",
    subtitle: "Your career starts here",
    description: "Join thousands of African youth accessing verified opportunities daily. Everything is manually verified, scam-free, and always 100% free.",
    image: "/images/img3.jpg",
    stat: "24/7",
    statLabel: "Daily Drops",
    statSubLabel: "Fresh Opportunities"
  }
];

export default function HeroSlider() {
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

  const slide = slides[currentSlide];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0A58A6] via-[#1976D2] to-[#42A5F5] overflow-hidden flex items-center py-20 md:py-0">
      {/* Yellow Decorative Background Shapes */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#4CAF50] rounded-br-[50px] md:rounded-br-[100px] -translate-x-16 md:-translate-x-32 -translate-y-16 md:-translate-y-32 transition-all duration-1000"></div>
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-[#4CAF50] rounded-tl-[50px] md:rounded-tl-[100px] translate-x-16 md:translate-x-32 translate-y-16 md:translate-y-32 transition-all duration-1000"></div>
      
      {/* Main Content Container with White Card */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10 w-full">
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 relative overflow-hidden my-4">
          
          {/* Africa Map SVG Background - Light Gray */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-[90%] opacity-[0.08] pointer-events-none hidden lg:block">
            <svg viewBox="0 0 400 500" className="w-full h-full" fill="#D1D5DB">
              <path d="M200,50 C210,55 220,65 235,80 L250,95 L265,115 L280,140 L295,170 L305,200 L310,235 L308,270 L300,305 L285,340 L265,370 L240,395 L210,410 L180,415 L150,410 L125,395 L105,375 L90,350 L80,320 L75,285 L75,250 L80,215 L90,180 L105,150 L125,120 L145,95 L165,75 L185,60 Z"/>
            </svg>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Content - Animated */}
            <div className="max-w-2xl order-2 lg:order-1">
              <div key={slide.id} className="animate-fadeIn">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-4 md:mb-6">
                  {slide.title} <br/>
                  <span className="relative inline-block my-2">
                    <span className="relative z-10">{slide.highlight}</span>
                    <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-4 bg-[#4CAF50] -z-0"></span>
                  </span>
                  <br/>
                  <span className="block mt-2">{slide.subtitle}</span>
                </h1>
                
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  {slide.description}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
                  <Link href="/jobs" className="btn bg-gray-900 text-white hover:bg-gray-800 btn-sm sm:btn-md lg:btn-lg border-none px-6 md:px-8 shadow-lg">
                    <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                    <span className="hidden sm:inline">Explore Opportunities</span>
                    <span className="sm:hidden">Opportunities</span>
                  </Link>
                  <a
                    href="https://whatsapp.com/channel/0029Vb5tFTSK0IBb2oi04V2b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-green-600 text-white hover:bg-green-700 btn-sm sm:btn-md lg:btn-lg px-6 md:px-8"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                    Join WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Right - African Youth Image Overlaid on Africa Map */}
            <div className="relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] order-1 lg:order-2">
              {/* Africa Map Shape - Beige/Tan */}
              <div className="absolute inset-0 flex items-center justify-center hidden md:flex">
                <svg viewBox="0 0 400 500" className="w-full h-full opacity-30" fill="#C4A57B">
                  <path d="M200,50 C210,55 220,65 235,80 L250,95 L265,115 L280,140 L295,170 L305,200 L310,235 L308,270 L300,305 L285,340 L265,370 L240,395 L210,410 L180,415 L150,410 L125,395 L105,375 L90,350 L80,320 L75,285 L75,250 L80,215 L90,180 L105,150 L125,120 L145,95 L165,75 L185,60 Z"/>
                </svg>
              </div>

              {/* African Youth Image - Animated */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div key={slide.id} className="relative w-[250px] h-[280px] sm:w-[300px] sm:h-[380px] md:w-[350px] md:h-[450px] rounded-2xl md:rounded-3xl overflow-hidden animate-fadeIn shadow-2xl">
                  <img 
                    src={slide.image}
                    alt="African Youth" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Decorative Paint Strokes - Hidden on mobile */}
              <div className="hidden md:block absolute top-16 left-8 w-24 h-16 bg-green-600 opacity-70 rounded-full blur-sm transform -rotate-12"></div>
              <div className="hidden md:block absolute top-32 left-4 w-32 h-12 bg-green-700 opacity-60 rounded-full blur-sm transform rotate-6"></div>
              <div className="hidden md:block absolute bottom-32 right-8 w-28 h-20 bg-[#4CAF50] opacity-80 rounded-full blur-sm transform rotate-12"></div>
              <div className="hidden md:block absolute bottom-20 right-4 w-36 h-16 bg-yellow-500 opacity-70 rounded-full blur-sm transform -rotate-6"></div>

              {/* Stats Badge - Animated */}
              <div key={`stat-${slide.id}`} className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-8 md:right-8 bg-white rounded-xl md:rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 border-2 md:border-4 border-[#4CAF50] animate-fadeIn">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900">{slide.stat}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">{slide.statLabel}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">{slide.statSubLabel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="mt-8 lg:mt-0 lg:absolute lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 flex items-center justify-center gap-2 md:gap-4 z-20">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-sm md:text-base" />
            </button>

            {/* Dots */}
            <div className="flex gap-1.5 md:gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 md:h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-[#4CAF50] w-6 md:w-8' 
                      : 'bg-gray-300 hover:bg-gray-400 w-2.5 md:w-3'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-sm md:text-base" />
            </button>
          </div>
        </div>
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
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
