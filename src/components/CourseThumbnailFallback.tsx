'use client'

interface CourseThumbnailFallbackProps {
    title: string;
    category?: string;
}

export default function CourseThumbnailFallback({ title, category }: CourseThumbnailFallbackProps) {
    // Generate a color based on the course title
    const colors = [
        'from-[#C44536] to-[#8B3A3A]',
        'from-[#F39C12] to-[#C44536]',
        'from-[#10B981] to-[#059669]',
        'from-[#8B3A3A] to-[#C44536]',
    ];
    
    const colorIndex = title.length % colors.length;
    const gradientColor = colors[colorIndex];

    return (
        <div className={`relative w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12"></div>

            {/* YENA Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <span className="text-white font-black text-8xl rotate-[-15deg] tracking-[0.3em]">
                    YENA
                </span>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-white font-bold text-lg line-clamp-2 mb-2">
                    {title}
                </h3>
                {category && (
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                        {category}
                    </span>
                )}
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
    );
}
