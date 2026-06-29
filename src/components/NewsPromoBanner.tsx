'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Sparkles, ArrowRight, FileText } from 'lucide-react';

// Small, dismissible "pop-up" CV call-to-action for the news page.
// Slides/fades in after a short delay; remembers dismissal for the session.
// Collapses to zero height (instead of unmounting) so we never set state
// synchronously inside the effect.
export default function NewsPromoBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('news_cv_promo_closed')) return;
        const t = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(t);
    }, []);

    const dismiss = () => {
        setShow(false);
        sessionStorage.setItem('news_cv_promo_closed', '1');
    };

    return (
        <div className={`overflow-hidden transition-all duration-500 ease-out ${show ? 'opacity-100 translate-y-0 max-h-60 mb-6' : 'opacity-0 -translate-y-2 max-h-0 mb-0'}`}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                {/* decorative blobs */}
                <div className="absolute -right-10 -top-12 w-36 h-36 rounded-full bg-white/10" />
                <div className="absolute right-6 -bottom-12 w-28 h-28 rounded-full bg-white/5" />

                {/* close */}
                <button onClick={dismiss} aria-label="Dismiss"
                    className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/15 hover:bg-white/30 transition-colors">
                    <X size={15} />
                </button>

                <div className="relative flex items-center gap-4 p-4 sm:p-5">
                    {/* CV preview image, tilted for a creative look */}
                    <div className="hidden xs:block shrink-0">
                        <div className="relative w-16 h-20 sm:w-[76px] sm:h-24 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg rotate-[-5deg] bg-white">
                            <Image src="/images/89134f788dd9c7573b50c5cc6c5a6733.webp" alt="Professional CV template" fill sizes="80px" className="object-cover" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                            <Sparkles size={11} /> Career Boost
                        </span>
                        <h3 className="font-extrabold text-base sm:text-lg leading-tight">Stand out with a professional CV</h3>
                        <p className="text-white/85 text-xs sm:text-sm mt-0.5">ATS-friendly &amp; recruiter-ready — built in minutes from <strong>KES 50</strong>.</p>
                    </div>

                    <Link href="/resources/cv-builder"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm active:scale-[0.98]">
                        <FileText size={15} className="hidden sm:inline" /> Build My CV <ArrowRight size={15} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
