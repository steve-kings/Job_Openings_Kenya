'use client'

import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, Clock, AlertCircle, TrendingUp, Copy, Check, Share2 } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';

interface Article {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    image: string | null;
}

interface Topic {
    key: string;
    label: string;
    icon: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

// Branded gradients for articles that arrive without an image (e.g. from RSS)
const PLACEHOLDER_GRADIENTS = ['from-emerald-500 to-teal-600', 'from-blue-500 to-indigo-600', 'from-violet-500 to-purple-600', 'from-orange-500 to-rose-600', 'from-sky-500 to-cyan-600', 'from-amber-500 to-orange-600'];

// Branded reader URL on our own domain, so a shared article routes through this site
const brandedHref = (a: Article) =>
    `/news/read?${new URLSearchParams({ u: a.url, t: a.title, s: a.source, i: a.image || '', d: (a.description || '').slice(0, 160), dt: a.publishedAt }).toString()}`;

export default function NewsClient({ topics }: { topics: Topic[] }) {
    const [activeTopic, setActiveTopic] = useState('jobs');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
    };
    const shareTo = (platform: 'whatsapp' | 'twitter') => {
        const url = window.location.href;
        const text = 'Latest Kenya jobs, career & business news';
        const links = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' — ' + url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        };
        window.open(links[platform], '_blank', 'noopener,noreferrer');
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        (async () => {
            try {
                const res = await fetch(`/api/news?topic=${activeTopic}&limit=20`);
                const data = await res.json();
                if (!cancelled) {
                    if (data.articles) {
                        setArticles(data.articles);
                    } else {
                        setError(data.error || 'Failed to load news');
                    }
                }
            } catch {
                if (!cancelled) setError('Network error. Please try again.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [activeTopic]);

    return (
        <>
            {/* Share this page */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-xs font-bold text-slate-400 mr-0.5">Share this page:</span>
                <button onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-all">
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy link'}
                </button>
                <button onClick={() => shareTo('whatsapp')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#1FB855] transition-all">
                    <WhatsAppIcon size={13} /> WhatsApp
                </button>
                <button onClick={() => shareTo('twitter')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 text-slate-600 hover:border-slate-400 transition-all">
                    <Share2 size={13} /> Post
                </button>
            </div>

            {/* Topic Tabs */}
            <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
                {topics.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTopic(t.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                            activeTopic === t.key
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                                : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                        }`}
                    >
                        <span>{t.icon}</span> {t.label}
                    </button>
                ))}
                {articles.length > 0 && (
                    <span className="ml-auto text-xs text-slate-400 font-medium shrink-0">
                        {articles.length} articles
                    </span>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                </div>
            ) : error ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <AlertCircle size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">{error}</p>
                    <button onClick={() => setActiveTopic(activeTopic)} className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                        Try Again
                    </button>
                </div>
            ) : articles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <NewspaperIcon />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No articles found</h3>
                    <p className="text-slate-500 text-sm">Try a different topic or check back later.</p>
                </div>
            ) : (
                <>
                    {/* Featured (first article) */}
                    {articles[0] && (
                        <a
                            href={brandedHref(articles[0])}
                            className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all mb-5 group"
                        >
                            <div className="grid md:grid-cols-2">
                                {articles[0].image ? (
                                    <img
                                        src={articles[0].image}
                                        alt=""
                                        className="w-full h-48 md:h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-48 md:h-full min-h-[180px] bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center p-6">
                                        <span className="text-white font-black text-lg text-center drop-shadow line-clamp-3">{articles[0].source}</span>
                                    </div>
                                )}
                                <div className="p-6 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                            <TrendingUp size={10} className="inline mr-1" /> Top Story
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors mb-3">
                                        {articles[0].title}
                                    </h2>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                                        {articles[0].description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="font-semibold text-slate-600">{articles[0].source}</span>
                                        <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(articles[0].publishedAt)}</span>
                                        <span className="flex items-center gap-1 text-emerald-600 font-bold">Read <ExternalLink size={11} /></span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    )}

                    {/* Grid of remaining articles */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {articles.slice(1).map((article, i) => (
                            <a
                                key={article.url}
                                href={brandedHref(article)}
                                className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group block overflow-hidden"
                            >
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt=""
                                        className="w-full h-36 object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={`w-full h-36 bg-gradient-to-br ${PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length]} flex items-center justify-center p-4`}>
                                        <span className="text-white font-extrabold text-sm text-center drop-shadow line-clamp-3">{article.source}</span>
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2 leading-snug">
                                        {article.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                        {article.description}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                        <span className="font-medium text-slate-500">{article.source}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(article.publishedAt)}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}

function NewspaperIcon() {
    return (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8M18 10h-8M10 18h8" />
            </svg>
        </div>
    );
}
