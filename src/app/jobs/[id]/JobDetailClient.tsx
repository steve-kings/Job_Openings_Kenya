'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Building, ExternalLink, Lock, CheckCircle, Clock, Eye, Share2, Sparkles, Loader2, X, Copy, Lightbulb } from 'lucide-react';
import BookmarkButton from '@/components/BookmarkButton';

interface JobDetailClientProps {
    job: any;
    user: any;
    opportunityId: string;
    similarJobs?: any[];
}

export default function JobDetailClient({ job, user, opportunityId, similarJobs }: JobDetailClientProps) {
    const [copySuccess, setCopySuccess] = useState(false);
    
    // AI Cover Letter State
    const [cvModalOpen, setCvModalOpen] = useState(false);
    const [cvText, setCvText] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [generatingLetter, setGeneratingLetter] = useState(false);
    const [letterCopied, setLetterCopied] = useState(false);

    // AI Mock Interview State
    const [prepModalOpen, setPrepModalOpen] = useState(false);
    const [prepMaterial, setPrepMaterial] = useState('');
    const [generatingPrep, setGeneratingPrep] = useState(false);

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity Not Found</h2>
                    <p className="text-gray-600 mb-6">This opportunity may have been removed or expired.</p>
                    <Link href="/jobs" className="btn bg-[#1976D2] text-white hover:bg-[#1565C0] border-none">
                        Browse All Opportunities
                    </Link>
                </div>
            </div>
        );
    }

    const canView = !!user;

    const typeColors = {
        'Job': { bg: 'bg-[#1976D2]', border: 'border-[#1976D2]', text: 'text-[#1976D2]', gradient: 'from-[#1976D2] to-[#1565C0]' },
        'Grant': { bg: 'bg-[#4CAF50]', border: 'border-[#4CAF50]', text: 'text-[#4CAF50]', gradient: 'from-[#4CAF50] to-[#388E3C]' },
        'Scholarship': { bg: 'bg-[#1565C0]', border: 'border-[#1565C0]', text: 'text-[#1565C0]', gradient: 'from-[#1565C0] to-[#5D4037]' },
        'Training': { bg: 'bg-[#4CAF50]', border: 'border-[#4CAF50]', text: 'text-[#4CAF50]', gradient: 'from-[#4CAF50] to-[#e08d0a]' },
    };
    const colors = typeColors[job.type as keyof typeof typeColors] || typeColors['Job'];

    const daysLeft = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this ${job.type.toLowerCase()}: ${job.title} at ${job.company}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleWhatsAppShare = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.open(url, '_blank');
    };

    const handleFacebookShare = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleLinkedInShare = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleGenerateCoverLetter = async () => {
        if (!cvText.trim()) return;
        setGeneratingLetter(true);
        try {
            const jobDetails = `Title: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\nRequirements: ${job.requirements?.join(', ')}`;
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_cover_letter', cvText, jobDetails })
            });
            const data = await res.json();
            if (data.coverLetter) {
                setCoverLetter(data.coverLetter);
            } else {
                throw new Error(data.error || 'Failed');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate cover letter. Please try again.');
        } finally {
            setGeneratingLetter(false);
        }
    };

    const copyLetter = () => {
        navigator.clipboard.writeText(coverLetter);
        setLetterCopied(true);
        setTimeout(() => setLetterCopied(false), 2000);
    };

    const handleGeneratePrep = async () => {
        setGeneratingPrep(true);
        try {
            const res = await fetch('/api/generate-interview-prep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    jobTitle: job.title, 
                    jobDescription: job.description, 
                    company: job.company 
                })
            });
            const data = await res.json();
            if (data.prepMaterial) {
                setPrepMaterial(data.prepMaterial);
            } else {
                throw new Error(data.error || 'Failed');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate interview prep. Please try again.');
        } finally {
            setGeneratingPrep(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className={`bg-gradient-to-r ${colors.gradient} text-white py-8`}>
                <div className="container mx-auto px-6 lg:px-12">
                    <Link href="/jobs" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors">
                        <ArrowLeft size={20} />
                        <span>Back to Opportunities</span>
                    </Link>
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold">
                                    {job.type}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <Clock size={14} />
                                    {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-4 max-w-4xl">
                                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">{job.title}</h1>
                                
                                <div className="hidden sm:block mt-2">
                                    <BookmarkButton 
                                        job={{
                                            id: job.id,
                                            title: job.title,
                                            company: job.company,
                                            type: job.type,
                                            location: job.location
                                        }}
                                        className="bg-white/20 hover:bg-white/40 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm"
                                        showText={true}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-white/90">
                                <span className="flex items-center gap-2">
                                    <Building size={18} />
                                    <span className="font-medium">{job.company}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin size={18} />
                                    <span>{job.location}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar size={18} />
                                    <span>Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </span>
                            </div>
                        </div>
                        
                        {canView && (
                            <a 
                                href={job.apply_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn bg-white text-gray-900 hover:bg-gray-100 btn-lg border-none gap-2 shadow-xl"
                            >
                                Apply Now
                                <ExternalLink size={20} />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 lg:px-12 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className={`text-2xl font-bold mb-4 ${colors.text}`}>About This Opportunity</h2>
                            <div 
                                className="prose max-w-none text-gray-700 leading-relaxed font-sans"
                                dangerouslySetInnerHTML={{ __html: job.description }} 
                            />
                        </div>

                        {canView ? (
                            <>
                                {/* Requirements */}
                                {job.requirements && job.requirements.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg p-8">
                                        <h2 className={`text-2xl font-bold mb-6 ${colors.text}`}>Requirements</h2>
                                        <ul className="space-y-3">
                                            {job.requirements.map((req: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <CheckCircle className="text-[#4CAF50] shrink-0 mt-0.5" size={20} />
                                                    <span className="text-gray-700">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Responsibilities */}
                                {job.responsibilities && job.responsibilities.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg p-8">
                                        <h2 className={`text-2xl font-bold mb-6 ${colors.text}`}>Responsibilities</h2>
                                        <ul className="space-y-3">
                                            {job.responsibilities.map((res: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <CheckCircle className={`${colors.text} shrink-0 mt-0.5`} size={20} />
                                                    <span className="text-gray-700">{res}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Benefits */}
                                {job.benefits && job.benefits.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-lg p-8">
                                        <h2 className={`text-2xl font-bold mb-6 ${colors.text}`}>Benefits</h2>
                                        <ul className="space-y-3">
                                            {job.benefits.map((ben: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <CheckCircle className="text-[#4CAF50] shrink-0 mt-0.5" size={20} />
                                                    <span className="text-gray-700">{ben}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden">
                                <div className="blur-sm select-none opacity-30">
                                    <h2 className="text-2xl font-bold mb-6">Requirements</h2>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle size={20} />
                                            <span>Bachelor's degree in relevant field</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle size={20} />
                                            <span>3+ years of professional experience</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle size={20} />
                                            <span>Strong communication skills</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
                                    <div className={`w-20 h-20 rounded-full ${colors.bg} bg-opacity-10 flex items-center justify-center mb-4`}>
                                        <Lock size={40} className={colors.text} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-gray-900">Login to View Full Details</h3>
                                    <p className="text-gray-600 mb-6 text-center max-w-md">
                                        Create a free account to access complete requirements, responsibilities, and apply for this opportunity.
                                    </p>
                                    <Link 
                                        href={`/login?redirect=/jobs/${opportunityId}`} 
                                        className={`btn ${colors.bg} text-white hover:opacity-90 btn-lg border-none px-10`}
                                    >
                                        Login / Sign Up
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Quick Info Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold mb-4 text-gray-900">Quick Info</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Type</p>
                                        <span className={`${colors.bg} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                                            {job.type}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Company</p>
                                        <p className="font-semibold text-gray-900">{job.company}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Location</p>
                                        <p className="font-semibold text-gray-900">{job.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Deadline</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(job.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className={`text-sm ${daysLeft > 7 ? 'text-[#4CAF50]' : 'text-[#1976D2]'} font-medium mt-1`}>
                                            {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
                                        </p>
                                    </div>
                                    {job.views && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Views</p>
                                            <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                <Eye size={16} />
                                                {job.views}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Apply Card */}
                            {canView && (
                                <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl shadow-lg p-6 text-white`}>
                                    <h3 className="text-xl font-bold mb-3">Ready to Apply?</h3>
                                    <p className="text-white/90 mb-6 text-sm">
                                        Don't miss this opportunity. Apply now before the deadline!
                                    </p>
                                    
                                    <div className="space-y-3">
                                        <a 
                                            href={job.apply_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn bg-white text-gray-900 hover:bg-gray-100 w-full border-none gap-2"
                                        >
                                            Apply Now
                                            <ExternalLink size={18} />
                                        </a>

                                        <button 
                                            onClick={() => setCvModalOpen(true)}
                                            className="btn bg-gray-900/40 text-white hover:bg-gray-900/60 w-full border-none gap-2 backdrop-blur-sm"
                                        >
                                            <Sparkles size={18} className="text-yellow-300" />
                                            AI Cover Letter
                                        </button>

                                        <button 
                                            onClick={() => setPrepModalOpen(true)}
                                            className="btn bg-[#1976D2] text-white hover:bg-[#1565C0] w-full border-none gap-2"
                                        >
                                            <Lightbulb size={18} className="text-yellow-200" />
                                            AI Interview Prep
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Share Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold mb-3 text-gray-900">Share This Opportunity</h3>
                                <p className="text-sm text-gray-600 mb-4">Help others discover this opportunity</p>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <button 
                                        onClick={handleWhatsAppShare}
                                        className="btn btn-sm bg-[#25D366] text-white hover:bg-[#1da851] border-none"
                                    >
                                        WhatsApp
                                    </button>
                                    <button 
                                        onClick={handleFacebookShare}
                                        className="btn btn-sm bg-[#1877F2] text-white hover:bg-[#0c63d4] border-none"
                                    >
                                        Facebook
                                    </button>
                                    <button 
                                        onClick={handleTwitterShare}
                                        className="btn btn-sm bg-[#1DA1F2] text-white hover:bg-[#0c8bd9] border-none"
                                    >
                                        Twitter
                                    </button>
                                    <button 
                                        onClick={handleLinkedInShare}
                                        className="btn btn-sm bg-[#0A66C2] text-white hover:bg-[#004182] border-none"
                                    >
                                        LinkedIn
                                    </button>
                                </div>
                                <button 
                                    onClick={handleCopyLink}
                                    className={`btn btn-sm w-full border-none gap-2 ${copySuccess ? 'bg-[#4CAF50] text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                >
                                    <Share2 size={16} />
                                    {copySuccess ? 'Link Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Opportunities Slider */}
            {similarJobs && similarJobs.length > 0 && (
                <div className="bg-white border-t border-gray-100 py-16">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">You might also like...</h2>
                            <Link href="/jobs" className="text-[#1976D2] font-semibold hover:underline flex items-center gap-1 text-sm">
                                View all <ExternalLink size={16} />
                            </Link>
                        </div>
                        
                        {/* Horizontal Scroll Area */}
                        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
                            {similarJobs.map((simJob) => {
                                const simDaysLeft = Math.max(0, Math.ceil((new Date(simJob.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                                const isExpired = simDaysLeft === 0;

                                return (
                                    <Link 
                                        key={simJob.id} 
                                        href={`/jobs/${simJob.id}`}
                                        className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#1976D2]/30 transition-all hover:-translate-y-1 block group"
                                    >
                                        <div className="p-5">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-sm bg-gradient-to-br ${typeColors[simJob.type as keyof typeof typeColors]?.gradient || typeColors['Job'].gradient}`}>
                                                    {simJob.company.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'} flex items-center gap-1`}>
                                                    <Clock size={12} />
                                                    {isExpired ? 'Expired' : `${simDaysLeft}d left`}
                                                </span>
                                            </div>

                                            {/* Body */}
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#1976D2] transition-colors line-clamp-2 md:h-14">
                                                {simJob.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-1">{simJob.company}</p>
                                            
                                            {/* Footer */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium pt-4 border-t border-gray-50">
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Building size={12} className="text-gray-400" />
                                                    {simJob.type}
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <MapPin size={12} className="text-gray-400" />
                                                    <span className="truncate max-w-[100px]">{simJob.location}</span>
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

            {/* AI Cover Letter Generator Modal */}
            {cvModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3 text-[#1976D2]">
                                <div className="w-10 h-10 rounded-xl bg-[#1976D2]/10 flex items-center justify-center">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">AI Cover Letter Generator</h3>
                                    <p className="text-sm text-gray-500">Powered by 1000Jobs AI</p>
                                </div>
                            </div>
                            <button onClick={() => setCvModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {!coverLetter ? (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 leading-relaxed">
                                        Paste your CV or Resume text below. Our AI will analyze your skills and the requirements for <strong>{job.title}</strong> at <strong>{job.company}</strong> to generate a perfectly customized cover letter.
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Paste Your CV / Resume Text:</label>
                                        <textarea
                                            value={cvText}
                                            onChange={(e) => setCvText(e.target.value)}
                                            placeholder="Experience:\n- Software Developer at TechCorp (2020-2023)\n- Led a team of 5...\n\nEducation:\n- BSc Computer Science..."
                                            className="w-full h-64 p-4 text-sm text-gray-700 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1976D2]/30 focus:border-[#1976D2] outline-none resize-none"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleGenerateCoverLetter} 
                                        disabled={generatingLetter || !cvText.trim()}
                                        className="w-full py-4 bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#1976D2]/30 transition-all disabled:opacity-50"
                                    >
                                        {generatingLetter ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                        {generatingLetter ? "Writing your Cover Letter..." : "Generate Cover Letter"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900">Your Tailored Cover Letter</h4>
                                        <button 
                                            onClick={copyLetter}
                                            className={`btn btn-sm text-white border-none gap-1.5 ${letterCopied ? 'bg-[#4CAF50] hover:bg-[#388E3C]' : 'bg-[#1976D2] hover:bg-[#1565C0]'}`}
                                        >
                                            {letterCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
                                            {letterCopied ? "Copied!" : "Copy Text"}
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {coverLetter}
                                    </div>
                                    <button 
                                        onClick={() => setCoverLetter('')}
                                        className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Mock Interview Prep Modal */}
            {prepModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#1976D2]">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Lightbulb size={20} className="text-yellow-200" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">AI Interview Preparation</h3>
                                    <p className="text-sm text-white/80">Tailored exactly for {job.company}</p>
                                </div>
                            </div>
                            <button onClick={() => setPrepModalOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-6">
                            {!prepMaterial ? (
                                <div className="space-y-6 text-center max-w-md mx-auto py-10">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Lightbulb size={48} className="text-[#1976D2]" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Want to ace your interview?</h4>
                                    <p className="text-gray-600 mb-8">
                                        Our AI will deeply analyze the requirements for the <strong>{job.title}</strong> role at {job.company}. It will generate the top 5 questions you are most likely to be asked, along with expert cheat-sheet answers.
                                    </p>
                                    <button 
                                        onClick={handleGeneratePrep} 
                                        disabled={generatingPrep}
                                        className="w-full py-4 text-lg bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {generatingPrep ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                                        {generatingPrep ? "Analyzing Job & Generating Questions..." : "Generate Interview Guide"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                    <div className="prose prose-blue max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                        <div dangerouslySetInnerHTML={{ __html: prepMaterial.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(prepMaterial);
                                                alert('Interview guide copied to clipboard!');
                                            }}
                                            className="flex-1 py-3 bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold rounded-xl transition-colors gap-2 flex items-center justify-center"
                                        >
                                            <Copy size={18} /> Copy to Clipboard
                                        </button>
                                        <button 
                                            onClick={() => setPrepMaterial('')}
                                            className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Start Over
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
