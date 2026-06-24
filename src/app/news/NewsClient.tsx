'use client'

import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, Clock, AlertCircle, TrendingUp } from 'lucide-react';

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

export default function NewsClient({ topics }: { topics: Topic[] }) {
    const [activeTopic, setActiveTopic] = useState('jobs');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                            href={articles[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all mb-5 group"
                        >
                            <div className="grid md:grid-cols-2">
                                {articles[0].image && (
                                    <img
                                        src={articles[0].image}
                                        alt=""
                                        className="w-full h-48 md:h-full object-cover"
                                        loading="lazy"
                                    />
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
                        {articles.slice(1).map(article => (
                            <a
                                key={article.url}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group block overflow-hidden"
                            >
                                {article.image && (
                                    <img
                                        src={article.image}
                                        alt=""
                                        className="w-full h-36 object-cover"
                                        loading="lazy"
                                    />
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
