'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Award, CheckCircle2, AlertCircle, Calendar, ArrowRight, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

interface Course {
    title: string;
    slug?: string;
    category?: string;
}

interface Certificate {
    id: string;
    user_id: string;
    course_id: string;
    issued_at: string | null;
    created_at: string;
    courses?: Course | null;
}

export default function CertificatesPage() {
    const supabase = useMemo(() => createClient(), []);
    const [searchId, setSearchId] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<Certificate | null>(null);
    const [searchError, setSearchError] = useState('');

    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [userCerts, setUserCerts] = useState<Certificate[]>([]);
    const [loadingCerts, setLoadingCerts] = useState(false);

    // Load active session and their certificates
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (u) {
                setUser(u);
                setLoadingCerts(true);
                const { data: certs } = await supabase
                    .from('certificates')
                    .select('*, courses(title, slug, category)')
                    .eq('user_id', u.id)
                    .order('created_at', { ascending: false });
                setUserCerts((certs as Certificate[]) || []);
                setLoadingCerts(false);
            }
        };
        checkUser();
    }, [supabase]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchId.trim();
        if (!trimmed) return;

        setSearching(true);
        setSearchError('');
        setSearchResult(null);

        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*, courses(title, slug, category)')
                .eq('id', trimmed)
                .single();

            if (error || !data) {
                setSearchError('Certificate not found. Please verify the Certificate ID and try again.');
            } else {
                setSearchResult(data as Certificate);
            }
        } catch {
            setSearchError('An error occurred during verification. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="relative overflow-hidden min-h-[220px] sm:min-h-[260px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white mb-4 text-sm font-medium transition-colors">
                        <ArrowLeft size={15} /> Back to Home
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                            <Award size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-lg">Certificate Verification</h1>
                            <p className="text-sm text-white/60">Verify the authenticity of professional certifications issued by Job Openings Kenya and KingsLearn</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {/* Search Panel */}
                <ScrollReveal>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                        <div className="max-w-xl">
                            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Verify a Certificate</h2>
                            <p className="text-sm text-slate-500">Enter the unique Certificate ID to verify credentials and completion status.</p>
                        </div>

                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="Enter Certificate ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all font-mono"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching || !searchId.trim()}
                                className="px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {searching ? <Loader2 size={16} className="animate-spin" /> : 'Verify Certificate'}
                            </button>
                        </form>

                        {/* Search Results */}
                        {searchError && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-700 text-sm animate-in fade-in-50 duration-200">
                                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="font-extrabold">Verification Failed</p>
                                    <p className="text-red-600/90 mt-0.5">{searchError}</p>
                                </div>
                            </div>
                        )}

                        {searchResult && (
                            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-50 duration-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-emerald-900 text-sm uppercase tracking-wider">Valid Certificate</p>
                                        <h3 className="font-black text-slate-900 text-base mt-0.5">{searchResult.courses?.title || 'Professional Course'}</h3>
                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                                            <span className="font-mono text-slate-600">{searchResult.id}</span>
                                            {searchResult.created_at && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(searchResult.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/certificates/${searchResult.id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shrink-0 justify-center"
                                >
                                    View Certificate <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                </ScrollReveal>

                {/* User's Certificates */}
                {user && (
                    <ScrollReveal delay={100}>
                        <div className="space-y-4">
                            <h2 className="text-lg font-extrabold text-slate-900 px-1">Your Certificates</h2>
                            {loadingCerts ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                                </div>
                            ) : userCerts.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                                    <Award size={40} className="mx-auto text-slate-300 mb-3" />
                                    <h3 className="font-bold text-slate-700">No Certificates Found</h3>
                                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">You haven't completed any paid certification courses yet. Once you complete a course, your certificate will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {userCerts.map((cert) => (
                                        <div key={cert.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-50 text-violet-700 uppercase tracking-wider">
                                                        {cert.courses?.category || 'Professional'}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-400">ID: {cert.id.slice(0, 8)}...</span>
                                                </div>
                                                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1">
                                                    {cert.courses?.title || 'Professional Course'}
                                                </h3>
                                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                                    <Calendar size={12} /> Issued on {new Date(cert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="border-t border-slate-50 mt-4 pt-3 flex items-center justify-between">
                                                <Link
                                                    href={`/certificates/${cert.id}`}
                                                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                                                >
                                                    View Details <ExternalLink size={12} />
                                                </Link>
                                                <Link
                                                    href={`/certificates/${cert.id}`}
                                                    className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
                                                >
                                                    Open <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollReveal>
                )}
            </div>
            <div className="h-12" />
        </div>
    );
}
