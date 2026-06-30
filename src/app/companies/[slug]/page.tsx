import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Calendar, Briefcase, ExternalLink, ArrowLeft, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { htmlToText } from '@/lib/utils/jobs';

export const revalidate = 3600;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const companyName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
        title: `${companyName} — Jobs & Opportunities | Job Openings Kenya`,
        description: `Explore open positions at ${companyName}. View all active job listings, learn about the company, and apply directly.`,
    };
}

function getDaysLeft(deadline: string) {
    return Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
}

export default async function CompanyProfilePage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get all active opportunities
    const { data: allOpportunities } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'active')
        .or(`deadline.gte.${today},deadline.is.null`)
        .order('created_at', { ascending: false });

    if (!allOpportunities) return notFound();

    // Find the company by matching slug against company name
    const companyName = allOpportunities.find((opp: { company: string }) =>
        opp.company.toLowerCase().replace(/\s+/g, '-') === slug
    )?.company;

    if (!companyName) {
        // Try case-insensitive search
        const slugWords = slug.split('-').map(w => w.toLowerCase());
        const matched = allOpportunities.find((opp: { company: string }) => {
            const companyWords = opp.company.toLowerCase().split(/\s+/);
            return slugWords.every(sw => companyWords.some(cw => cw.includes(sw) || sw.includes(cw)));
        });
        if (!matched) return notFound();
    }

    const finalCompanyName = companyName || allOpportunities.find((opp: { company: string }) =>
        opp.company.toLowerCase().replace(/\s+/g, '-') === slug
    )?.company || '';

    const companyJobs = allOpportunities.filter((opp: { company: string }) => opp.company === finalCompanyName);
    const locations = [...new Set(companyJobs.map((j: { location: string }) => j.location))];
    const jobCount = companyJobs.length;
    const trainingCount = companyJobs.filter((j: { type: string }) => j.type === 'Training').length;
    const jobOnlyCount = companyJobs.filter((j: { type: string }) => j.type === 'Job').length;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Back nav */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/companies" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors">
                        <ArrowLeft size={16} /> All Companies
                    </Link>
                </div>
            </div>

            {/* Company Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shrink-0">
                            {finalCompanyName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">{finalCompanyName}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <Briefcase size={15} className="text-emerald-500" />
                                    <span className="font-semibold text-gray-700">{jobCount} open {jobCount === 1 ? 'position' : 'positions'}</span>
                                </span>
                                {jobOnlyCount > 0 && (
                                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">{jobOnlyCount} Jobs</span>
                                )}
                                {trainingCount > 0 && (
                                    <span className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg font-bold">{trainingCount} Training</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {locations.map((loc: string) => (
                                    <span key={loc} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">
                                        <MapPin size={12} /> {loc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Open Positions */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6">Open Positions ({jobCount})</h2>

                <div className="space-y-4">
                    {companyJobs.map((job: { id: string; title: string; type: string; location: string; deadline: string; short_description?: string; description?: string; salary_min?: number; salary_max?: number; salary_currency?: string }) => {
                        const daysLeft = getDaysLeft(job.deadline);
                        const isExpiring = daysLeft <= 3;
                        return (
                            <Link
                                key={job.id}
                                href={`/jobs/${job.id}`}
                                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all p-5 sm:p-6 group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${job.type === 'Job' ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'}`}>
                                                {job.type}
                                            </span>
                                            {isExpiring && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-600 flex items-center gap-1">
                                                    <Clock size={10} /> {daysLeft}d left
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">{job.title}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {job.location}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                            {htmlToText(job.short_description || job.description).substring(0, 200)}
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1 text-sm font-bold text-emerald-600 shrink-0">
                                        View <ExternalLink size={14} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {companyJobs.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No open positions at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
