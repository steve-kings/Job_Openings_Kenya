import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowLeft, ExternalLink, Clock, Newspaper } from 'lucide-react';
import ArticleShare from './ArticleShare';
import NewsPromoBanner from '@/components/NewsPromoBanner';

type SP = { [key: string]: string | string[] | undefined };
const str = (v: string | string[] | undefined, fb = '') => (typeof v === 'string' ? v : fb);
export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
    const sp = await searchParams;
    const title = str(sp.t, 'Kenya News');
    const description = (str(sp.d) || 'Read the latest Kenya jobs, careers & business news on Job Openings Kenya.').slice(0, 200);
    const image = str(sp.i) || '/job_openings_kenya_logo.jpeg';
    return {
        title: `${title} | Job Openings Kenya`,
        description,
        robots: { index: false, follow: true },
        alternates: { canonical: '/news' },
        openGraph: { title, description, url: '/news', siteName: 'Job Openings Kenya', type: 'article', images: [image] },
        twitter: { card: 'summary_large_image', title, description, images: [image] },
    };
}

export default async function NewsReadPage({ searchParams }: { searchParams: Promise<SP> }) {
    const sp = await searchParams;
    const sourceUrl = str(sp.u);
    const title = str(sp.t, 'Kenya News');
    const source = str(sp.s, 'News');
    const image = str(sp.i);
    const description = str(sp.d);
    const date = str(sp.dt);
    const fmtDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

    if (!sourceUrl) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <Newspaper size={40} className="mx-auto mb-3 text-slate-300" />
                    <h1 className="text-xl font-extrabold text-slate-900 mb-2">Story not found</h1>
                    <p className="text-slate-500 mb-5 text-sm">This news link is missing or expired.</p>
                    <Link href="/news" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">Browse News</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'NewsArticle',
                    headline: title,
                    ...(image ? { image: [image] } : {}),
                    ...(date ? { datePublished: date } : {}),
                    ...(description ? { description } : {}),
                    publisher: { '@type': 'Organization', name: 'Job Openings Kenya' },
                    mainEntityOfPage: sourceUrl,
                    isBasedOn: sourceUrl,
                }),
            }} />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/news" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors mb-5">
                    <ArrowLeft size={16} /> Back to News
                </Link>

                <article className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {image && (
                        <div className="relative w-full h-56 sm:h-72 bg-slate-100">
                            <Image src={image} alt={title} fill unoptimized className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
                        </div>
                    )}
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                            <span className="font-bold text-emerald-600">{source}</span>
                            {fmtDate && <span className="flex items-center gap-1"><Clock size={12} /> {fmtDate}</span>}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">{title}</h1>
                        {description && <p className="text-slate-600 leading-relaxed mb-6 text-[15px] sm:text-base">{description}</p>}

                        <a href={sourceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200">
                            Read the full story on {source} <ExternalLink size={15} />
                        </a>

                        <div className="mt-7 pt-5 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 mb-2.5">Share this story</p>
                            <ArticleShare title={title} />
                        </div>
                    </div>
                </article>

                <div className="mt-6"><NewsPromoBanner /></div>
            </div>
        </div>
    );
}
