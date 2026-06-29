'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

// Shares the CURRENT (branded) URL so readers land back on this site.
export default function ArticleShare({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
    };
    const shareTo = (platform: 'whatsapp' | 'twitter') => {
        const url = window.location.href;
        const links = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' — ' + url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        };
        window.open(links[platform], '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-all">
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} {copied ? 'Link copied!' : 'Copy link'}
            </button>
            <button onClick={() => shareTo('whatsapp')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#1FB855] transition-all">
                <WhatsAppIcon size={14} /> WhatsApp
            </button>
            <button onClick={() => shareTo('twitter')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 text-slate-600 hover:border-slate-400 transition-all">
                <Share2 size={14} /> Post
            </button>
        </div>
    );
}
