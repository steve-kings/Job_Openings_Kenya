'use client'

import { useEffect } from 'react';

export default function CoursesPage() {
    useEffect(() => {
        // Immediate redirect to external LMS
        window.location.href = 'https://kings-learn.vercel.app';
    }, []);

    return (
        <div className="bg-white min-h-screen flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto px-6">
                {/* Icon */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1976D2] rounded-2xl mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Redirecting to Learning Platform
                    </h1>
                    <p className="text-lg text-gray-600">
                        Taking you to 1000Jobs's learning management system...
                    </p>
                </div>

                {/* Loading Dots */}
                <div className="flex justify-center gap-2 mb-12">
                    <div className="w-3 h-3 bg-[#1976D2] rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-[#1976D2] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-[#1976D2] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>

                {/* Manual Link */}
                <div className="border-2 border-gray-200 rounded-xl p-8 bg-gray-50">
                    <p className="text-gray-700 mb-4 font-medium">
                        Not redirected automatically?
                    </p>
                    <a
                        href="https://kings-learn.vercel.app"
                        className="inline-flex items-center gap-2 bg-[#1976D2] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1565C0] transition-colors"
                    >
                        Continue to Learning Platform
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
