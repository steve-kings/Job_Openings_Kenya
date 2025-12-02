'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faBriefcase, faGraduationCap, faHandHoldingDollar, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const slides = [
  {
    id: 1,
    title: "A world where no",
    highlight: "youth's future",
    subtitle: "is torn apart by lack of opportunities.",
    description: "Every day, thousands of young Africans miss out on life-changing opportunities due to lack of information and access. YENA changes that.",
    image: "/images/img1.jpg",
    stat: "5,000+",
    statLabel: "Youth reached",
    statSubLabel: "Across Africa"
  },
  {
    id: 2,
    title: "Get Daily Updates on",
    highlight: "Youth Opportunities",
    subtitle: "Across Africa 🌍",
    description: "Stay ahead with YENA! We share verified youth opportunities — jobs, grants, entrepreneurship programs & online trainings from all over Africa.",
    image: "/images/img2.jpg",
    stat: "1,200+",
    statLabel: "Opportunities",
    statSubLabel: "Posted Monthly"
  },
  {
    id: 3,
    title: "Empowering young Africans to",
    highlight: "learn, earn & grow",
    subtitle: "💼🌱",
    description: "Join thousands of African youth accessing verified opportunities daily. Your next big break is just one click away.",
    image: "/images/img3.jpg",
    stat: "850+",
    statLabel: "Students",
    statSubLabel: "Enrolled in Courses"
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
    <div className="relative min-h-[95vh] bg-gradient-to-br from-white via-gray-50 to-gray-100 overflow-hidden">
      {/* Yellow Decorative Background Shapes */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#F39C12] rounded-br-[100px] -translate-x-32 -translate-y-32 transition-all duration-1000"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#F39C12] rounded-tl-[100px] translate-x-32 translate-y-32 transition-all duration-1000"></div>
      
      {/* Main Content Container with White Card */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10 pt-20 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden">
          
          {/* Africa Map SVG Background - Light Gray */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-[90%] opacity-[0.08] pointer-events-none">
            <svg viewBox="0 0 400 500" className="w-full h-full" fill="#D1D5DB">
              <path d="M200,50 C210,55 220,65 235,80 L250,95 L265,115 L280,140 L295,170 L305,200 L310,235 L308,270 L300,305 L285,340 L265,370 L240,395 L210,410 L180,415 L150,410 L125,395 L105,375 L90,350 L80,320 L75,285 L75,250 L80,215 L90,180 L105,150 L125,120 L145,95 L165,75 L185,60 Z"/>
            </svg>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content - Animated */}
            <div className="max-w-2xl">
              <div key={slide.id} className="animate-fadeIn">
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
                  {slide.title} <br/>
                  <span className="relative inline-block">
                    <span className="relative z-10">{slide.highlight}</span>
                    <span className="absolute bottom-2 left-0 w-full h-4 bg-[#F39C12] -z-0"></span>
                  </span>
                  <br/>
                  {slide.subtitle}
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                  {slide.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-12">
                  <Link href="/jobs" className="btn bg-gray-900 text-white hover:bg-gray-800 btn-lg border-none px-8 shadow-lg">
                    <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                    Explore Opportunities
                  </Link>
                  <a
                    href="https://whatsapp.com/channel/0029Vb5tFTSK0IBb2oi04V2b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-green-600 text-white hover:bg-green-700 btn-lg px-8"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                    Join WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Right - African Youth Image Overlaid on Africa Map */}
            <div className="relative h-[500px] lg:h-[600px]">
              {/* Africa Map Shape - Beige/Tan */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 400 500" className="w-full h-full opacity-30" fill="#C4A57B">
                  <path d="M200,50 C210,55 220,65 235,80 L250,95 L265,115 L280,140 L295,170 L305,200 L310,235 L308,270 L300,305 L285,340 L265,370 L240,395 L210,410 L180,415 L150,410 L125,395 L105,375 L90,350 L80,320 L75,285 L75,250 L80,215 L90,180 L105,150 L125,120 L145,95 L165,75 L185,60 Z"/>
                </svg>
              </div>

              {/* African Youth Image - Animated */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div key={slide.id} className="relative w-[350px] h-[450px] rounded-3xl overflow-hidden animate-fadeIn">
                  <img 
                    src={slide.image}
                    alt="African Youth" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Decorative Paint Strokes */}
              <div className="absolute top-16 left-8 w-24 h-16 bg-green-600 opacity-70 rounded-full blur-sm transform -rotate-12"></div>
              <div className="absolute top-32 left-4 w-32 h-12 bg-green-700 opacity-60 rounded-full blur-sm transform rotate-6"></div>
              <div className="absolute bottom-32 right-8 w-28 h-20 bg-[#F39C12] opacity-80 rounded-full blur-sm transform rotate-12"></div>
              <div className="absolute bottom-20 right-4 w-36 h-16 bg-yellow-500 opacity-70 rounded-full blur-sm transform -rotate-6"></div>

              {/* Stats Badge - Animated */}
              <div key={`stat-${slide.id}`} className="absolute bottom-8 right-8 bg-white rounded-2xl shadow-xl p-6 border-4 border-[#F39C12] animate-fadeIn">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{slide.stat}</div>
                  <div className="text-sm text-gray-600 font-medium mt-1">{slide.statLabel}</div>
                  <div className="text-xs text-gray-500">{slide.statSubLabel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            {/* Previous Button */}
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition-all hover:scale-110"
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
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-[#F39C12] w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center shadow-lg transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <FontAwesomeIcon icon={faChevronRight} />
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
