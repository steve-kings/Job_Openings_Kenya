'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar, MapPin, Building2, ExternalLink, Lock,
    CheckCircle2, Clock, Eye, Share2, Sparkles, Loader2, X, Copy, CreditCard,
    Lightbulb, PhoneCall, Wallet, Search, Mail,
} from 'lucide-react';
import BookmarkButton from '@/components/BookmarkButton';
import GoogleAd from '@/components/GoogleAd';
import WeatherWidget from '@/components/WeatherWidget';
import { typeLabel } from '@/lib/utils/jobs';

interface Job {
    id: string;
    title: string;
    company: string;
    type: string;
    location: string;
    deadline: string;
    apply_url: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    benefits?: string[];
    short_description?: string;
    thumbnail_url?: string;
    views?: number;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
}

interface SimilarJob {
    id: string;
    title: string;
    company: string;
    type: string;
    location: string;
    thumbnail_url?: string;
    deadline: string;
}

interface AuthUser {
    id: string;
    email?: string;
}

interface JobDetailClientProps {
    job: Job;
    user: AuthUser | null;
    opportunityId: string;
    similarJobs?: SimilarJob[];
    coverLetterPrice?: number;
}

const typeMeta: Record<string, { text: string; bg: string; border: string; gradient: string; softBg: string }> = {
    Job:         { text: 'text-emerald-700', bg: 'bg-emerald-500', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-600',   softBg: 'bg-emerald-50' },
    Training:    { text: 'text-violet-700',  bg: 'bg-violet-500',  border: 'border-violet-200',  gradient: 'from-violet-500 to-purple-600',   softBg: 'bg-violet-50' },
    Grant:       { text: 'text-blue-700',    bg: 'bg-blue-500',    border: 'border-blue-200',    gradient: 'from-blue-500 to-indigo-600',     softBg: 'bg-blue-50' },
    Scholarship: { text: 'text-purple-700',  bg: 'bg-purple-500',  border: 'border-purple-200',  gradient: 'from-purple-500 to-fuchsia-600',  softBg: 'bg-purple-50' },
};

export default function JobDetailClient({ job, user, opportunityId, similarJobs, coverLetterPrice = 20 }: JobDetailClientProps) {
    const [copySuccess, setCopySuccess] = useState(false);
    const [cvModalOpen, setCvModalOpen] = useState(false);
    const [cvText, setCvText] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [generatingLetter, setGeneratingLetter] = useState(false);
    const [letterCopied, setLetterCopied] = useState(false);
    const [letterPaid, setLetterPaid] = useState(false);
    const [letterPhone, setLetterPhone] = useState('');
    const [letterPayLoading, setLetterPayLoading] = useState(false);
    const [letterPayError, setLetterPayError] = useState('');
    const [prepModalOpen, setPrepModalOpen] = useState(false);
    const [prepMaterial, setPrepMaterial] = useState('');
    const [generatingPrep, setGeneratingPrep] = useState(false);
    const [appStatus, setAppStatus] = useState<'idle' | 'tracking' | 'tracked'>('idle');
    const [appError, setAppError] = useState('');

    const canView = !!user;
    const colors = typeMeta[job.type] || typeMeta.Job;
    // A null/empty deadline means "Rolling Basis" — never expires. Guard every
    // deadline calculation against it so rolling listings don't read as Jan 1 1970 / Expired.
    const hasDeadline = !!job.deadline;
    const daysLeft = hasDeadline
        ? Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;
    const deadlineLabel = hasDeadline
        ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Rolling Basis';

    useEffect(() => {
        if (!canView) return;
        fetch('/api/applications')
            .then(r => r.json())
            .then(d => {
                const found = d.applications?.find((a: { opportunity: { id: string } }) => a.opportunity?.id === job.id);
                if (found) setAppStatus('tracked');
            })
            .catch(() => {});
    }, [canView, job.id]);

    // Load Paystack script dynamically for Cover Letter payments
    useEffect(() => {
        const s = document.createElement('script'); s.src = 'https://js.paystack.co/v1/inline.js'; s.async = true;
        document.body.appendChild(s);
        return () => { s.remove(); };
    }, []);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this ${job.type.toLowerCase()}: ${job.title} at ${job.company}`;

    const getFormattedApplyUrl = (url: string | null | undefined): string => {
        if (!url) return '';
        const trimmed = url.trim();
        if (trimmed.includes('@') && !trimmed.startsWith('mailto:') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            return `mailto:${trimmed}`;
        }
        const phoneClean = trimmed.replace(/[\s\-\(\)]/g, '');
        const isPhone = /^\+?[0-9]{9,15}$/.test(phoneClean);
        if (isPhone && !trimmed.startsWith('tel:') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            return `tel:${phoneClean}`;
        }
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('mailto:') && !trimmed.startsWith('tel:')) {
            return `https://${trimmed}`;
        }
        return trimmed;
    };

    const formattedApplyUrl = getFormattedApplyUrl(job.apply_url);
    const isExternalApply = formattedApplyUrl ? formattedApplyUrl.startsWith('http') : false;
    const applyHref = formattedApplyUrl || '#about-opportunity';

    const getApplyButtonDetails = () => {
        if (!formattedApplyUrl) {
            return {
                label: 'Refer to Description',
                icon: <Search size={15} />,
            };
        }
        if (formattedApplyUrl.startsWith('mailto:')) {
            return {
                label: 'Apply via Email',
                icon: <Mail size={15} />,
            };
        }
        if (formattedApplyUrl.startsWith('tel:')) {
            return {
                label: 'Call to Apply',
                icon: <PhoneCall size={15} />,
            };
        }
        return {
            label: 'Apply Online',
            icon: <ExternalLink size={15} />,
        };
    };

    const getApplyCardButtonDetails = () => {
        if (!formattedApplyUrl) {
            return {
                label: 'Refer to Description',
                icon: <Search size={16} />,
            };
        }
        if (formattedApplyUrl.startsWith('mailto:')) {
            return {
                label: 'Apply via Email',
                icon: <Mail size={16} />,
            };
        }
        if (formattedApplyUrl.startsWith('tel:')) {
            return {
                label: 'Call to Apply',
                icon: <PhoneCall size={16} />,
            };
        }
        return {
            label: 'Apply Online',
            icon: <ExternalLink size={16} />,
        };
    };

    const applyBtn = getApplyButtonDetails();
    const applyCardBtn = getApplyCardButtonDetails();

    const handleTrackApplication = async () => {
        setAppStatus('tracking');
        setAppError('');
        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunityId: job.id, status: 'applied' }),
            });
            const data = await res.json();
            if (res.ok) setAppStatus('tracked');
            else { setAppError(data.error || 'Failed to track'); setAppStatus('idle'); }
        } catch { setAppError('Network error'); setAppStatus('idle'); }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch { /* ignore */ }
    };

    const handleShare = (platform: string) => {
        const urls: Record<string, string> = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        };
        window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    const handleLetterPay = () => {
        if (!letterPhone.trim() || letterPhone.length < 10) {
            setLetterPayError('Enter a valid phone number');
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const P = (window as any).PaystackPop;
        if (!P) { setLetterPayError('Payment loading... try again.'); return; }
        setLetterPayLoading(true); setLetterPayError('');
        P.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            email: user?.email || 'user@jobopeningskenya.co.ke',
            amount: coverLetterPrice * 100, // Convert KES to kobo/cents
            currency: 'KES',
            ref: `cl_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            label: 'AI Cover Letter',
            metadata: { phone: letterPhone, product: 'cover_letter', user_id: user?.id },
            onClose: () => setLetterPayLoading(false),
            callback: async (r: { reference: string }) => {
                try {
                    const v = await fetch('/api/payment/verify', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reference: r.reference, user_id: user?.id, product: 'cover_letter', amount: coverLetterPrice }),
                    });
                    const d = await v.json();
                    if (d.verified) {
                        setLetterPaid(true);
                        setLetterPayError('');
                    } else setLetterPayError('Payment verification failed.');
                } catch { setLetterPayError('Verification error.'); }
                setLetterPayLoading(false);
            },
        }).openIframe();
    };

    const handleGenerateCoverLetter = async () => {
        if (!cvText.trim()) return;
        setGeneratingLetter(true);
        try {
            const jobDetails = `Title: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\nRequirements: ${job.requirements?.join(', ')}`;
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_cover_letter', cvText, jobDetails }),
            });
            const data = await res.json();
            if (data.coverLetter) setCoverLetter(data.coverLetter);
            else throw new Error(data.error || 'Failed');
        } catch { alert('Failed to generate cover letter.'); }
        finally { setGeneratingLetter(false); }
    };

    const handleGeneratePrep = async () => {
        setGeneratingPrep(true);
        try {
            const res = await fetch('/api/generate-interview-prep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobTitle: job.title, jobDescription: job.description, company: job.company }),
            });
            const data = await res.json();
            if (data.prepMaterial) setPrepMaterial(data.prepMaterial);
            else throw new Error(data.error || 'Failed');
        } catch { alert('Failed to generate interview prep.'); }
        finally { setGeneratingPrep(false); }
    };

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-4">
                        <Search size={28} className="text-gray-400" />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2">Not Found</h2>
                    <p className="text-gray-500 mb-6">This opportunity may have been removed or expired.</p>
                    <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all">
                        Browse Opportunities
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Google for Jobs + Rich Results Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'JobPosting',
                        title: job.title,
                        description: job.short_description || job.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
                        datePosted: new Date().toISOString().split('T')[0],
                        validThrough: job.deadline,
                        url: shareUrl,
                        identifier: {
                            '@type': 'PropertyValue',
                            name: job.company,
                            value: job.id,
                        },
                        image: job.thumbnail_url || `${shareUrl.split('/jobs/')[0]}/job_openings_kenya_logo.jpeg`,
                        employmentType: job.type === 'Job' ? 'FULL_TIME' : 'INTERN',
                        directApply: !!job.apply_url,
                        hiringOrganization: {
                            '@type': 'Organization',
                            name: job.company,
                            sameAs: shareUrl.split('/jobs/')[0],
                            logo: job.thumbnail_url || `${shareUrl.split('/jobs/')[0]}/job_openings_kenya_logo.jpeg`,
                        },
                        jobLocation: {
                            '@type': 'Place',
                            address: {
                                '@type': 'PostalAddress',
                                addressLocality: job.location || 'Kenya',
                                addressCountry: 'KE',
                            },
                        },
                        applicantLocationRequirements: {
                            '@type': 'Country',
                            name: 'KE',
                        },
                        ...(job.salary_min || job.salary_max ? {
                            baseSalary: {
                                '@type': 'MonetaryAmount',
                                currency: job.salary_currency || 'KES',
                                value: {
                                    '@type': 'QuantitativeValue',
                                    ...(job.salary_min ? { minValue: job.salary_min } : {}),
                                    ...(job.salary_max ? { maxValue: job.salary_max } : {}),
                                    unitText: 'MONTH',
                                },
                            },
                        } : {}),
                        jobBenefits: job.benefits?.join(', ') || 'Apply to learn more',
                        qualifications: job.requirements?.join(', ') || 'See full description',
                        responsibilities: job.responsibilities?.join(', ') || 'See full description',
                        industry: job.type === 'Job' ? 'Employment' : 'Training & Education',
                        workHours: 'Full-time / Part-time / Contract',
                    }),
                }}
            />
            {/* ── Breadcrumb ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <Link href="/" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={`/?type=${job.type}`} className="hover:text-emerald-600 transition-colors">
                            {typeLabel[job.type] || job.type}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 truncate max-w-[300px] sm:max-w-md">{job.title}</span>
                    </div>
                </div>
            </div>

            {/* ── Hero Header ── */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 lg:items-start">
                        {/* Company Avatar */}
                        <div className="shrink-0">
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-lg shadow-emerald-500/20`}>
                                {job.company.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide ${colors.softBg} ${colors.text} border ${colors.border}`}>
                                    {job.type}
                                </span>
                                {!hasDeadline && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <Clock size={10} /> Rolling Basis
                                    </span>
                                )}
                                {daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide bg-red-50 text-red-600 border border-red-100">
                                        <Clock size={10} /> {daysLeft}d left
                                    </span>
                                )}
                                {daysLeft !== null && daysLeft <= 0 && (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide bg-gray-100 text-gray-500 border border-gray-200">Expired</span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{job.title}</h1>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                                    <Building2 size={15} className="text-gray-400" />
                                    {job.company}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-500">
                                    <MapPin size={15} className="text-gray-400" />
                                    {job.location || 'Kenya'}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-500">
                                    <Calendar size={15} className="text-gray-400" />
                                    {deadlineLabel}
                                </span>
                                {(job.salary_min || job.salary_max) && (
                                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                        <Wallet size={15} className="text-emerald-400" />
                                        {job.salary_currency || 'KES'} {job.salary_min?.toLocaleString()}{job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}
                                    </span>
                                )}
                                {job.views !== undefined && (
                                    <span className="flex items-center gap-1.5 text-gray-400">
                                        <Eye size={15} /> {job.views.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5">
                            {canView ? (
                                <>
                                    <a href={applyHref} target={isExternalApply ? "_blank" : undefined} rel={isExternalApply ? "noopener noreferrer" : undefined}
                                       className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200 hover:shadow-md">
                                        {applyBtn.label} {applyBtn.icon}
                                    </a>
                                    <div className="flex gap-2">
                                        <BookmarkButton
                                            job={{ id: job.id, title: job.title, company: job.company, type: job.type, location: job.location }}
                                            className="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                                            showText={false}
                                        />
                                        <button onClick={handleCopyLink}
                                            className="inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
                                            {copySuccess ? <CheckCircle2 size={17} className="text-emerald-600" /> : <Share2 size={17} />}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link href={`/login?redirect=/jobs/${opportunityId}`}
                                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm">
                                    <Lock size={15} /> Login to Apply
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8 min-w-0">
                        {/* Description */}
                        <div id="about-opportunity" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                            <h2 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2.5">
                                <span className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${colors.gradient}`} />
                                About This Opportunity
                            </h2>
                            <div
                                className="prose max-w-none text-gray-600 leading-relaxed break-words"
                                dangerouslySetInnerHTML={{ __html: job.description }}
                            />
                        </div>

                        {canView ? (
                            <>
                                {job.requirements && job.requirements.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                        <h2 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2.5">
                                            <span className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${colors.gradient}`} />
                                            Requirements
                                        </h2>
                                        <ul className="space-y-3">
                                            {job.requirements.map((req, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                                        <CheckCircle2 size={13} className="text-emerald-600" />
                                                    </div>
                                                    <span className="text-gray-600 text-sm">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {job.responsibilities && job.responsibilities.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                        <h2 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2.5">
                                            <span className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${colors.gradient}`} />
                                            Responsibilities
                                        </h2>
                                        <ul className="space-y-3">
                                            {job.responsibilities.map((res, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                                        <CheckCircle2 size={13} className="text-emerald-600" />
                                                    </div>
                                                    <span className="text-gray-600 text-sm">{res}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {job.benefits && job.benefits.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                        <h2 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2.5">
                                            <span className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${colors.gradient}`} />
                                            Benefits
                                        </h2>
                                        <ul className="space-y-3">
                                            {job.benefits.map((ben, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                                        <CheckCircle2 size={13} className="text-emerald-600" />
                                                    </div>
                                                    <span className="text-gray-600 text-sm">{ben}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative overflow-hidden">
                                <div className="blur-sm select-none opacity-20">
                                    <h2 className="text-xl font-bold mb-5">Requirements</h2>
                                    <ul className="space-y-3">
                                        <li className="flex gap-3"><CheckCircle2 size={18} /><span>Bachelor&apos;s degree in relevant field</span></li>
                                        <li className="flex gap-3"><CheckCircle2 size={18} /><span>3+ years experience</span></li>
                                        <li className="flex gap-3"><CheckCircle2 size={18} /><span>Strong communication skills</span></li>
                                    </ul>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                        <Lock size={28} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Login to View Details</h3>
                                    <p className="text-gray-500 text-center text-sm max-w-xs mb-5">
                                        Create an account to see requirements, responsibilities, and apply.
                                    </p>
                                    <Link href={`/login?redirect=/jobs/${opportunityId}`}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm">
                                        Login / Sign Up
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-5">
                            {/* Weather Widget */}
                            <WeatherWidget />

                            {/* Quick Info */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-5">Quick Info</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Type', value: job.type, badge: true },
                                        { label: 'Company', value: job.company },
                                        { label: 'Location', value: job.location },
                                        ...(job.salary_min || job.salary_max ? [{ label: 'Salary', value: `${job.salary_currency || 'KES'} ${job.salary_min?.toLocaleString() || '?'} – ${job.salary_max?.toLocaleString() || '?'}`, highlight: true }] : []),
                                        { label: 'Deadline', value: deadlineLabel, extra: !hasDeadline ? 'Open until filled' : (daysLeft !== null && daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired') },
                                    ].map(({ label, value, badge, highlight, extra }) => (
                                        <div key={label}>
                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                                            {badge ? (
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${colors.softBg} ${colors.text} border ${colors.border}`}>{value}</span>
                                            ) : (
                                                <p className={`font-semibold text-sm ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</p>
                                            )}
                                            {extra && (
                                                <p className={`text-xs font-semibold mt-0.5 ${!hasDeadline || (daysLeft !== null && daysLeft > 0) ? 'text-emerald-600' : 'text-red-500'}`}>{extra}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Card */}
                            {canView && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className={`bg-gradient-to-br ${colors.gradient} px-6 py-5 text-white`}>
                                        <h3 className="text-lg font-extrabold">Ready to Apply?</h3>
                                        <p className="text-sm text-white/80 mt-0.5">Don&apos;t miss this opportunity.</p>
                                    </div>
                                    <div className="p-5 space-y-2.5">
                                        <a href={applyHref} target={isExternalApply ? "_blank" : undefined} rel={isExternalApply ? "noopener noreferrer" : undefined}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200">
                                            {applyCardBtn.label} {applyCardBtn.icon}
                                        </a>
                                        {appStatus === 'tracked' ? (
                                            <div className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm border border-emerald-100">
                                                <CheckCircle2 size={16} /> Tracked in My Applications
                                            </div>
                                        ) : (
                                            <button onClick={handleTrackApplication} disabled={appStatus === 'tracking'}
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-60">
                                                {appStatus === 'tracking' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                                {appStatus === 'tracking' ? 'Saving...' : "I've Applied"}
                                            </button>
                                        )}
                                        {appError && <p className="text-xs text-red-500 text-center">{appError}</p>}
                                        <button onClick={() => {
                                            const message = `Hello! I'd like help applying for *${job.title}* at *${job.company}*.`;
                                            window.open(`https://wa.me/254752182132?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-all">
                                            <PhoneCall size={16} /> Get Help Applying
                                        </button>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <button onClick={() => setCvModalOpen(true)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all">
                                                <Sparkles size={14} className="text-yellow-300" /> AI Cover Letter
                                            </button>
                                            <button onClick={() => setPrepModalOpen(true)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 bg-white text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition-all border border-emerald-200">
                                                <Lightbulb size={14} /> Interview Prep
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Share */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="text-sm font-extrabold text-gray-900 mb-1">Share</h3>
                                <p className="text-xs text-gray-400 mb-4">Help others discover this</p>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {[
                                        { key: 'whatsapp', color: '#25D366', icon: <WhatsAppIcon /> },
                                        { key: 'facebook', color: '#1877F2', icon: <FacebookIcon /> },
                                        { key: 'twitter', color: '#1DA1F2', icon: <TwitterIcon /> },
                                        { key: 'linkedin', color: '#0A66C2', icon: <LinkedInIcon /> },
                                    ].map(({ key, color, icon }) => (
                                        <button key={key} onClick={() => handleShare(key)}
                                            className="flex items-center justify-center p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                                            style={{ color }} title={key}>
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handleCopyLink}
                                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${copySuccess ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                                    {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    {copySuccess ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>

                            {/* Map */}
                            {job.location && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                                        <MapPin size={16} className="text-emerald-500" />
                                        <h3 className="text-sm font-extrabold text-gray-900">Location</h3>
                                    </div>
                                    <div className="relative">
                                        <iframe
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(job.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                            className="w-full h-48 border-0"
                                            loading="lazy"
                                            title={`Map of ${job.location}`}
                                        />
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="absolute bottom-3 right-3 bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 border border-gray-100 flex items-center gap-1 transition-colors">
                                            <ExternalLink size={12} /> Open in Maps
                                        </a>
                                    </div>
                                </div>
                            )}

                            <GoogleAd adSlot="PLACEHOLDER_SLOT_ID" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Similar Jobs ── */}
            {similarJobs && similarJobs.length > 0 && (
                <div className="bg-white border-t border-gray-100 py-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-extrabold text-gray-900">Similar Opportunities</h2>
                            <Link href="/" className="text-emerald-600 font-bold text-sm hover:underline inline-flex items-center gap-1">
                                View all <ExternalLink size={15} />
                            </Link>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                            {similarJobs.map((simJob) => {
                                const simDaysLeft = Math.max(0, Math.ceil((new Date(simJob.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                                const simColors = typeMeta[simJob.type] || typeMeta.Job;
                                return (
                                    <Link key={simJob.id} href={`/jobs/${simJob.id}`}
                                        className="snap-start shrink-0 w-[280px] sm:w-[300px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all hover:-translate-y-1 block group">
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${simColors.gradient} flex items-center justify-center text-white font-extrabold text-lg shadow-sm`}>
                                                    {simJob.company.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${simDaysLeft === 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'} flex items-center gap-1`}>
                                                    <Clock size={11} />
                                                    {simDaysLeft === 0 ? 'Expired' : `${simDaysLeft}d left`}
                                                </span>
                                            </div>
                                            <h3 className="font-extrabold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm leading-snug">{simJob.title}</h3>
                                            <p className="text-xs text-gray-500 mb-4">{simJob.company}</p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-50">
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md font-medium">
                                                    <Building2 size={11} className="text-gray-400" /> {simJob.type}
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md font-medium">
                                                    <MapPin size={11} className="text-gray-400" /> {simJob.location}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            {cvModalOpen && (
                <Modal onClose={() => setCvModalOpen(false)} title="AI Cover Letter Generator" subtitle="Powered by Job Openings Kenya AI" icon={<Sparkles size={20} />} iconBg="bg-emerald-50">
                    {!letterPaid ? (
                        /* STEP 1: Payment */
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800">
                                <strong>KES {coverLetterPrice}</strong> — AI-powered cover letter tailored for <strong>{job.title}</strong> at <strong>{job.company}</strong>. Pay via M-Pesa or Card.
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                <input type="tel" value={letterPhone} onChange={e => setLetterPhone(e.target.value)}
                                    placeholder="e.g. 0712345678"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50" />
                            </div>
                            {letterPayError && <p className="text-xs text-red-500 font-medium">{letterPayError}</p>}
                            <button onClick={handleLetterPay} disabled={letterPayLoading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50">
                                {letterPayLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                                {letterPayLoading ? 'Processing...' : `Pay KES ${coverLetterPrice}`}
                            </button>
                            <p className="text-[10px] text-slate-400 text-center">Secure payment. Supports M-Pesa and Cards.</p>
                        </div>
                    ) : !coverLetter ? (
                        /* STEP 2: Generate after payment */
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-sm text-green-700 flex items-center gap-2">
                                <CheckCircle2 size={16} /> Payment confirmed — KES {coverLetterPrice} received
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800">
                                Paste your CV below. Our AI will customize a cover letter for <strong>{job.title}</strong> at <strong>{job.company}</strong>.
                            </div>
                            <textarea value={cvText} onChange={(e) => setCvText(e.target.value)}
                                placeholder="Experience:\n- Software Developer at TechCorp (2020-2023)...\n\nEducation:\n- BSc Computer Science..."
                                className="w-full h-56 p-4 text-sm text-gray-700 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none resize-none" />
                            <button onClick={handleGenerateCoverLetter} disabled={generatingLetter || !cvText.trim()}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
                                {generatingLetter ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                {generatingLetter ? 'Writing...' : 'Generate Cover Letter'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900">Your Cover Letter</h4>
                                <button onClick={() => { navigator.clipboard.writeText(coverLetter); setLetterCopied(true); setTimeout(() => setLetterCopied(false), 2000); }}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-emerald-700 transition-all">
                                    {letterCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                    {letterCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">{coverLetter}</div>
                            <button onClick={() => setCoverLetter('')} className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors">Start Over</button>
                        </div>
                    )}
                </Modal>
            )}

            {prepModalOpen && (
                <Modal onClose={() => setPrepModalOpen(false)} title="AI Interview Preparation" subtitle={`Tailored for ${job.company}`}
                    icon={<Lightbulb size={20} />} iconBg="bg-amber-50" headerBg="bg-emerald-600" headerText="text-white" headerSubText="text-white/80">
                    {!prepMaterial ? (
                        <div className="space-y-6 text-center max-w-md mx-auto py-10">
                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <Lightbulb size={36} className="text-emerald-600" />
                            </div>
                            <h4 className="text-xl font-extrabold text-gray-900">Ace your interview</h4>
                            <p className="text-gray-500 text-sm">Our AI generates the top questions and expert answers for the <strong>{job.title}</strong> role.</p>
                            <button onClick={handleGeneratePrep} disabled={generatingPrep}
                                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 hover:shadow-lg">
                                {generatingPrep ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                {generatingPrep ? 'Generating...' : 'Generate Interview Guide'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="prose max-w-none bg-white p-6 rounded-2xl border border-gray-100 text-sm" dangerouslySetInnerHTML={{ __html: prepMaterial.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                            <div className="flex gap-3">
                                <button onClick={() => { navigator.clipboard.writeText(prepMaterial); alert('Copied!'); }}
                                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                    <Copy size={16} /> Copy
                                </button>
                                <button onClick={() => setPrepMaterial('')}
                                    className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Start Over</button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}

// ── Reusable Modal ──
function Modal({ children, onClose, title, subtitle, icon, iconBg = 'bg-emerald-50', headerBg = 'bg-white', headerText = 'text-gray-900', headerSubText = 'text-gray-500' }: {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    iconBg?: string;
    headerBg?: string;
    headerText?: string;
    headerSubText?: string;
}) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className={`flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 ${headerBg}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className={`text-lg font-extrabold ${headerText}`}>{title}</h3>
                            <p className={`text-xs ${headerSubText}`}>{subtitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={22} />
                    </button>
                </div>
                <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}

// ── Social Media Icons ──
function WhatsAppIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.13 1.588 5.931L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>; }
function FacebookIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>; }
function TwitterIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>; }
function LinkedInIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>; }

// Search is already imported above, no wrapper needed
