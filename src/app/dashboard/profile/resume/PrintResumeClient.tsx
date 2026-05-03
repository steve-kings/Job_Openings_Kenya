'use client';

import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PrintResumeClient() {
    // Inject print styles globally to hide navbars/footers if any
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body {
                    background: white !important;
                }
                nav, footer, .drawer-toggle, .drawer-side {
                    display: none !important;
                }
                .drawer-content {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden z-50">
            <button 
                onClick={() => window.print()}
                className="btn bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-2 border-none h-auto"
            >
                <Printer size={20} />
                Download / Print PDF
            </button>
            <Link 
                href="/dashboard/profile"
                className="btn bg-white hover:bg-gray-100 text-gray-800 rounded-full shadow-lg px-6 flex items-center gap-2 border-none"
            >
                <ArrowLeft size={16} />
                Back to Edit
            </Link>
        </div>
    );
}
