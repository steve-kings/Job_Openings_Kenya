import { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, Clock, ExternalLink, ArrowLeft, TrendingUp } from 'lucide-react';
import NewsClient from './NewsClient';

export const metadata: Metadata = {
    title: 'Kenya News — Jobs, Careers & Business | Job Openings Kenya',
    description: 'Latest news about jobs, careers, business, and technology in Kenya. Stay informed with curated news for Kenyan professionals.',
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

                {/* Client component with topic tabs + article grid */}
                <NewsClient topics={TOPICS} />
            </div>
        </div>
    );
}
