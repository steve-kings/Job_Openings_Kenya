'use client'

import { useRef } from 'react';
import { Download } from 'lucide-react';

interface CertificateProps {
    userName: string;
    courseName: string;
    completionDate: string;
    courseId: string;
}

export default function Certificate({ userName, courseName, completionDate, courseId }: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (typeof window === 'undefined') return;
        
        try {
            // Use html2canvas to convert the certificate to an image
            const html2canvas = (await import('html2canvas')).default;
            const element = certificateRef.current;
            if (!element) return;

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
            });

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `YENA-Certificate-${courseName.replace(/\s+/g, '-')}.png`;
                link.click();
                URL.revokeObjectURL(url);
            });
        } catch (error) {
            console.error('Error generating certificate:', error);
            alert('Error generating certificate. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Certificate Preview */}
            <div 
                ref={certificateRef}
                className="relative w-full aspect-[1.414/1] bg-white p-12 shadow-2xl"
                style={{ maxWidth: '800px', margin: '0 auto' }}
            >
                {/* Border Design */}
                <div className="absolute inset-4 border-8 border-double border-[#C44536]">
                    <div className="absolute inset-2 border-2 border-[#F39C12]"></div>
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
                    {/* YENA Watermark Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                        <span className="text-gray-400 font-black text-9xl rotate-[-15deg] uppercase tracking-[0.3em]">
                            YENA
                        </span>
                    </div>

                    {/* Header */}
                    <div className="mb-8 relative z-10">
                        <h1 className="text-6xl font-black text-[#C44536] mb-2 tracking-wide">
                            YENA
                        </h1>
                        <p className="text-lg text-gray-600 tracking-widest">
                            YOUTH EMPOWERMENT NETWORK AFRICA
                        </p>
                    </div>

                    {/* Certificate Title */}
                    <div className="mb-8 relative z-10">
                        <h2 className="text-4xl font-serif text-gray-800 mb-2">
                            Certificate of Completion
                        </h2>
                        <div className="w-32 h-1 bg-gradient-to-r from-[#C44536] via-[#F39C12] to-[#10B981] mx-auto"></div>
                    </div>

                    {/* Recipient */}
                    <div className="mb-8 relative z-10">
                        <p className="text-lg text-gray-600 mb-2">This is to certify that</p>
                        <h3 className="text-5xl font-bold text-gray-900 mb-2 font-serif">
                            {userName}
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">has successfully completed</p>
                        <h4 className="text-3xl font-bold text-[#C44536] mb-4">
                            {courseName}
                        </h4>
                    </div>

                    {/* Date & Signature */}
                    <div className="mt-auto pt-8 relative z-10 w-full">
                        <div className="flex justify-between items-end">
                            <div className="text-left">
                                <p className="text-sm text-gray-600 mb-1">Date of Completion</p>
                                <p className="text-lg font-semibold text-gray-900">{completionDate}</p>
                            </div>
                            <div className="text-center">
                                <div className="mb-2">
                                    <div className="w-48 h-16 flex items-center justify-center">
                                        <span className="text-3xl font-black text-[#C44536] italic">YENA</span>
                                    </div>
                                </div>
                                <div className="border-t-2 border-gray-800 pt-1">
                                    <p className="text-sm font-semibold text-gray-900">YENA Team</p>
                                    <p className="text-xs text-gray-600">Electronic Signature</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                                <p className="text-xs font-mono text-gray-700">
                                    {courseId.substring(0, 8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 relative z-10">
                        <p className="text-xs text-gray-500">
                            This certificate verifies completion of the course curriculum and assessments
                        </p>
                    </div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[#F39C12]"></div>
                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[#F39C12]"></div>
                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[#10B981]"></div>
                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[#10B981]"></div>
            </div>

            {/* Download Button */}
            <div className="text-center">
                <button 
                    onClick={handleDownload}
                    className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] btn-lg border-none gap-2"
                >
                    <Download size={20} />
                    Download Certificate
                </button>
                <p className="text-sm text-gray-600 mt-2">
                    Your certificate will be downloaded as a high-quality image
                </p>
            </div>
        </div>
    );
}
