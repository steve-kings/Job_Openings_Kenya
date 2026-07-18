'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PenTool, X } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { getManualCvRevampWhatsAppUrl } from '@/lib/whatsapp';

const MANUAL_CV_REVAMP_URL = getManualCvRevampWhatsAppUrl();

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
        <div id="cv-banner" className={`fixed bottom-4 right-4 z-[9998] max-w-[calc(100vw-2rem)] transition-all duration-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#85bb23] py-1 pl-4 pr-1 text-white shadow-xl">
                <PenTool size={14} className="shrink-0" />
                <Link href="/resources/cv-builder" onClick={close}
                    className="text-[11px] font-bold hover:underline whitespace-nowrap">
                    Build CV free
                </Link>
                <span className="h-4 w-px bg-white/30" aria-hidden="true" />
                <a
                    href={MANUAL_CV_REVAMP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-slate-900 transition-colors hover:bg-slate-50"
                    aria-label="Request a manual CV revamp on WhatsApp"
                >
                    <WhatsAppIcon size={13} /> Manual revamp
                </a>
                <button onClick={close}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-1"
                    aria-label="Close">
                    <X size={13} />
                </button>
            </div>
        </div>
    );
}
