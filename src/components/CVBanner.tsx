'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PenTool, X } from 'lucide-react';

export default function CVBanner() {
    const [show, setShow] = useState(false);
    const [gone, setGone] = useState(false);

    useEffect(() => {
        const closed = sessionStorage.getItem('cv_banner_closed');
        if (!closed) {
            const t = setTimeout(() => setShow(true), 2500);
            return () => clearTimeout(t);
        }
    }, []);

    const close = () => {
        setShow(false);
        setTimeout(() => setGone(true), 300);
        sessionStorage.setItem('cv_banner_closed', '1');
    };

    if (gone) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-[9998] transition-all duration-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full pl-4 pr-1 py-1 shadow-xl border border-white/10">
                <PenTool size={14} className="shrink-0" />
                <Link href="/resources/cv-builder" onClick={close}
                    className="text-[11px] font-bold hover:underline whitespace-nowrap">
                    Need a CV? <span className="opacity-60 font-normal">from KES 50</span>
                </Link>
                <button onClick={close}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-1"
                    aria-label="Close">
                    <X size={13} />
                </button>
            </div>
        </div>
    );
}
