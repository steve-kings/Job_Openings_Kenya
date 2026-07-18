import { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, ArrowLeft } from 'lucide-react';
import NewsClient from './NewsClient';
import NewsPromoBanner from '@/components/NewsPromoBanner';

export const metadata: Metadata = {
    title: 'Kenya News — Jobs, Careers & Business | Job Openings Kenya',
    description: 'Latest news about jobs, careers, business, and technology in Kenya. Stay informed with curated news for Kenyan professionals.',
    keywords: 'Kenya news, jobs news Kenya, business news Kenya, career news, Kenyan economy, technology news Kenya, hiring news',
    alternates: { canonical: '/news' },
    // This page is a convenient feed of third-party headlines. Keep it useful
    // for visitors without presenting syndicated summaries as original content.
    robots: { index: false, follow: true },
    openGraph: {
        title: 'Kenya News — Jobs, Careers & Business',
        description: 'Latest jobs, career, business & tech news for Kenyan professionals, updated regularly.',
        url: '/news',
        siteName: 'Job Openings Kenya',
        type: 'website',
        locale: 'en_US',
        images: [{ url: '/job_openings_kenya_logo.jpeg', width: 1200, height: 630, alt: 'Job Openings Kenya News' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Kenya News — Jobs, Careers & Business',
        description: 'Latest jobs, career, business & tech news for Kenyan professionals.',
        images: ['/job_openings_kenya_logo.jpeg'],
    },
};

export const revalidate = 900; // 15 minutes

const TOPICS = [
    { key: 'jobs', label: 'Jobs & Hiring', icon: '💼' },
    { key: 'business', label: 'Business & Economy', icon: '📈' },
    { key: 'careers', label: 'Careers', icon: '🚀' },
    { key: 'tech', label: 'Tech & Startups', icon: '💻' },
];

export default function NewsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <Newspaper size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kenya News</h1>
                            <p className="text-slate-500 text-sm mt-0.5">Latest jobs, career, business & tech news for Kenyan professionals</p>
                        </div>
                    </div>
                </div>

                {/* Dismissible CV call-to-action */}
                <NewsPromoBanner />

                {/* Client component with topic tabs + article grid */}
                <NewsClient topics={TOPICS} />
            </div>
        </div>
    );
}
