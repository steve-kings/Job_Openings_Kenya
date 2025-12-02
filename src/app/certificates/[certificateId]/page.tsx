'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Certificate from '@/components/Certificate';
import { Award, CheckCircle, Calendar, User, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function CertificateViewPage({ params }: { params: Promise<{ certificateId: string }> }) {
    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [certificateId, setCertificateId] = useState<string>('');
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            const resolvedParams = await params;
            setCertificateId(resolvedParams.certificateId);

            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('certificate_id', resolvedParams.certificateId)
                .single();

            if (error) {
                console.error('Error fetching certificate:', error);
            } else {
                setCertificate(data);
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
                    <p className="mt-4 text-gray-600">Loading certificate...</p>
                </div>
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4 text-gray-300">
                        <Award className="mx-auto" size={80} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        This certificate ID doesn't exist or may have been revoked.
                    </p>
                    <Link href="/" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none">
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#10B981] text-white px-6 py-2 rounded-full mb-4">
                        <CheckCircle size={20} />
                        <span className="font-semibold">Verified Certificate</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Course Completion Certificate
                    </h1>
                    <p className="text-gray-600">
                        This certificate has been verified and is authentic
                    </p>
                </div>

                {/* Certificate Info Card */}
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="card bg-white shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-6">Certificate Details</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#C44536]/10 flex items-center justify-center flex-shrink-0">
                                        <User size={24} className="text-[#C44536]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Recipient</p>
                                        <p className="text-lg font-bold text-gray-900">{certificate.user_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#F39C12]/10 flex items-center justify-center flex-shrink-0">
                                        <BookOpen size={24} className="text-[#F39C12]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Course</p>
                                        <p className="text-lg font-bold text-gray-900">{certificate.course_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                                        <Calendar size={24} className="text-[#10B981]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Completion Date</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {new Date(certificate.completion_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#8B3A3A]/10 flex items-center justify-center flex-shrink-0">
                                        <Award size={24} className="text-[#8B3A3A]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                                        <p className="text-lg font-bold text-gray-900 font-mono">{certificate.certificate_id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="divider"></div>

                            <div className="alert alert-success">
                                <CheckCircle size={20} />
                                <span>
                                    This certificate is authentic and has been issued by YENA (Youth Empowerment Network Africa)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificate Display */}
                <div className="max-w-4xl mx-auto">
                    <Certificate
                        userName={certificate.user_name}
                        courseName={certificate.course_name}
                        completionDate={new Date(certificate.completion_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                        courseId={certificate.course_id}
                    />
                </div>

                {/* Share Section */}
                <div className="max-w-4xl mx-auto mt-8">
                    <div className="card bg-white shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Share This Certificate</h3>
                            <p className="text-gray-600 mb-4">
                                Share this certificate link to verify your achievement
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={typeof window !== 'undefined' ? window.location.href : ''}
                                    readOnly
                                    className="input input-bordered flex-1"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
