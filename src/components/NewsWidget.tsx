'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Loader2, ExternalLink, Clock, ArrowRight } from 'lucide-react';

interface Article {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    image: string | null;
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

export default function NewsWidget({ limit = 3 }: { limit?: number }) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/news?topic=jobs&limit=${limit}`);
                const data = await res.json();
                if (!cancelled && data.articles) {
                    setArticles(data.articles);
                }
            } catch {
                // Silent fail — widget just doesn't show
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [limit]);

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Newspaper size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-extrabold text-slate-900">Kenya News</h3>
                </div>
                <div className="flex items-center justify-center py-6">
                    <Loader2 size={18} className="animate-spin text-slate-300" />
                </div>
            </div>
        );
    }

    if (!articles.length) return null;

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Newspaper size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-extrabold text-slate-900">Kenya News</h3>
                </div>
                <Link
                    href="/news"
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                >
                    View All <ArrowRight size={11} />
                </Link>
            </div>
            <div className="px-4 pb-3 space-y-0">
                {articles.slice(0, limit).map((article, i) => (
                    <a
                        key={article.url}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-start gap-2.5 py-2 group/link ${
                            i < articles.slice(0, limit).length - 1 ? 'border-b border-slate-50' : ''
                        }`}
                    >
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 group-hover/link:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                                {article.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                <span className="font-medium">{article.source}</span>
                                <span className="flex items-center gap-0.5">
                                    <Clock size={9} /> {timeAgo(article.publishedAt)}
                                </span>
                            </div>
                        </div>
                        {article.image && (
                            <img
                                src={article.image}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                                loading="lazy"
                            />
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
}
