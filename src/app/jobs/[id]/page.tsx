'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Building, ExternalLink, Lock, CheckCircle, Clock, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [opportunityId, setOpportunityId] = useState<string>('');
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            // Await params
            const resolvedParams = await params;
            setOpportunityId(resolvedParams.id);

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data, error } = await supabase
                .from('opportunities')
                .select('*')
                .eq('id', resolvedParams.id)
                .single();

            if (error) {
                console.error('Error fetching job:', error);
            } else {
                setJob(data);
                // Increment views
                await supabase.rpc('increment_opportunity_views', { row_id: resolvedParams.id });
            }
            setLoading(false);
        };
        init();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-[#C44536]"></span>
                    <p className="mt-4 text-gray-600">Loading opportunity...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity Not Found</h2>
                    <p className="text-gray-600 mb-6">This opportunity may have been removed or expired.</p>
                    <Link href="/jobs" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none">
                        Browse All Opportunities
                    </Link>
                </div>
            </div>
        );
    }

    const canView = !!user;

    const typeColors = {
        'Job': { bg: 'bg-[#C44536]', border: 'border-[#C44536]', text: 'text-[#C44536]', gradient: 'from-[#C44536] to-[#8B3A3A]' },
        'Grant': { bg: 'bg-[#10B981]', border: 'border-[#10B981]', text: 'text-[#10B981]', gradient: 'from-[#10B981] to-[#059669]' },
        'Scholarship': { bg: 'bg-[#8B3A3A]', border: 'border-[#8B3A3A]', text: 'text-[#8B3A3A]', gradient: 'from-[#8B3A3A] to-[#5D4037]' },
        'Training': { bg: 'bg-[#F39C12]', border: 'border-[#F39C12]', text: 'text-[#F39C12]', gradient: 'from-[#F39C12] to-[#e08d0a]' },
    };
    const colors = typeColors[job.type as keyof typeof typeColors] || typeColors['Job'];

    const daysLeft = Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

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
                            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">{job.title}</h1>
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
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
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
                                                    <CheckCircle className="text-[#10B981] shrink-0 mt-0.5" size={20} />
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
                                                    <CheckCircle className="text-[#F39C12] shrink-0 mt-0.5" size={20} />
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
                                        <p className={`text-sm ${daysLeft > 7 ? 'text-[#10B981]' : 'text-[#C44536]'} font-medium mt-1`}>
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
                                    <a 
                                        href={job.apply_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn bg-white text-gray-900 hover:bg-gray-100 w-full border-none gap-2"
                                    >
                                        Apply Now
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            )}

                            {/* Share Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold mb-3 text-gray-900">Share This Opportunity</h3>
                                <p className="text-sm text-gray-600 mb-4">Help others discover this opportunity</p>
                                <div className="flex gap-2">
                                    <button className="btn btn-sm bg-[#10B981] text-white hover:bg-[#059669] border-none flex-1">
                                        WhatsApp
                                    </button>
                                    <button className="btn btn-sm bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none flex-1">
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
