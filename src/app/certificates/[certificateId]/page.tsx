import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { CheckCircle, Award, Calendar, ExternalLink, Download, Share2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ certificateId: string }> }): Promise<Metadata> {
    const { certificateId } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from('certificates')
        .select('*, profiles(full_name), courses(title)')
        .eq('id', certificateId)
        .single();

    if (!data) return { title: 'Certificate Not Found | Job Openings Kenya' };

    return {
        title: `Certificate — ${data.courses?.title || 'Course'} | Job Openings Kenya`,
        description: `${data.profiles?.full_name || 'A learner'} successfully completed ${data.courses?.title || 'a course'} on KingsLearn.`,
    };
}

export default async function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
    const { certificateId } = await params;
    const supabase = await createClient();

    const { data: cert } = await supabase
        .from('certificates')
        .select('*, profiles(full_name, avatar_url, email), courses(title, slug, category, level, thumbnail_url)')
        .eq('id', certificateId)
        .single();

    if (!cert) notFound();

    const recipientName = cert.profiles?.full_name || 'Learner';
    const courseTitle = cert.courses?.title || 'Course';
    const issuedDate = cert.issued_at
        ? new Date(cert.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date(cert.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    const initials = recipientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    const certUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back nav */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-sm text-gray-500 hover:text-[#5CB800] font-medium transition-colors flex items-center gap-1.5">
                        ← Back to Job Openings Kenya
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => typeof window !== 'undefined' && navigator.share?.({ title: `Certificate — ${courseTitle}`, url: certUrl })}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            <Share2 size={14} /> Share
                        </button>
                        <button
                            onClick={() => typeof window !== 'undefined' && window.print()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5CB800] text-white text-sm font-bold hover:bg-[#4A9900] transition-all"
                        >
                            <Download size={14} /> Download
                        </button>
                    </div>
                </div>

                {/* Certificate Card */}
                <div
                    id="certificate"
                    className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden print:shadow-none"
                >
                    {/* Top bar */}
                    <div className="bg-gradient-to-r from-[#1a2e1a] via-[#2d5a1b] to-[#5CB800] h-3" />

                    <div className="p-10 sm:p-16 text-center relative">
                        {/* Decorative corner ornaments */}
                        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-[#5CB800]/20 rounded-tl-2xl" />
                        <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-[#5CB800]/20 rounded-tr-2xl" />
                        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-[#5CB800]/20 rounded-bl-2xl" />
                        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-[#5CB800]/20 rounded-br-2xl" />

                        {/* Logo & Title */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-[#5CB800] rounded-xl flex items-center justify-center">
                                    <Award size={22} className="text-white" />
                                </div>
                                <span className="text-xl font-black text-gray-900">Job Openings Kenya</span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">In partnership with KingsLearn</p>
                        </div>

                        {/* Certificate heading */}
                        <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#5CB800] mb-3">Certificate of Completion</p>
                        <p className="text-gray-500 text-base mb-6">This is to certify that</p>

                        {/* Recipient */}
                        <div className="flex flex-col items-center mb-6">
                            {cert.profiles?.avatar_url ? (
                                <Image
                                    src={cert.profiles.avatar_url}
                                    alt={recipientName}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-[#5CB800]/30 shadow-lg mb-4"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5CB800] to-[#4A9900] flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4 border-4 border-[#5CB800]/30">
                                    {initials}
                                </div>
                            )}
                            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-1">{recipientName}</h1>
                            {cert.profiles?.email && (
                                <p className="text-sm text-gray-400">{cert.profiles.email}</p>
                            )}
                        </div>

                        {/* Text */}
                        <p className="text-gray-600 text-base mb-2">has successfully completed</p>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#5CB800] mb-8 max-w-lg mx-auto leading-snug">
                            {courseTitle}
                        </h2>

                        {/* Divider */}
                        <div className="flex items-center gap-4 max-w-sm mx-auto mb-8">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#5CB800]/30" />
                            <CheckCircle size={24} className="text-[#5CB800]" />
                            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#5CB800]/30" />
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={14} className="text-[#5CB800]" />
                                <span>Issued: <strong className="text-gray-900">{issuedDate}</strong></span>
                            </div>
                            {cert.courses?.level && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <BookOpen size={14} className="text-[#5CB800]" />
                                    <span>Level: <strong className="text-gray-900 capitalize">{cert.courses.level}</strong></span>
                                </div>
                            )}
                            {cert.courses?.category && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Award size={14} className="text-[#5CB800]" />
                                    <span>Category: <strong className="text-gray-900">{cert.courses.category}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Certificate ID */}
                        <div className="bg-gray-50 rounded-xl px-6 py-3 inline-block">
                            <p className="text-xs text-gray-400 font-medium">Certificate ID</p>
                            <p className="text-sm font-mono font-bold text-gray-700">{certificateId}</p>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="bg-gradient-to-r from-[#1a2e1a] via-[#2d5a1b] to-[#5CB800] h-3" />
                </div>

                {/* Verification note */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
                    <CheckCircle size={20} className="text-[#5CB800] shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-gray-900">Verified Certificate</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            This certificate was issued by Job Openings Kenya in partnership with KingsLearn LMS.
                            Certificate ID: <span className="font-mono font-semibold text-gray-700">{certificateId}</span>
                        </p>
                    </div>
                </div>

                {/* Explore more */}
                <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] rounded-2xl p-7 text-white text-center">
                    <h3 className="text-xl font-black mb-2">Continue Your Learning Journey</h3>
                    <p className="text-white/80 text-sm mb-5">
                        Discover more courses on KingsLearn and keep building your career skills.
                    </p>
                    <a
                        href="https://kingslearn.co.ke"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white text-[#5CB800] font-bold px-7 py-3 rounded-xl text-sm hover:bg-gray-50 transition-all shadow-lg"
                    >
                        Browse Courses on KingsLearn <ExternalLink size={15} />
                    </a>
                </div>
            </div>
        </div>
    );
}
