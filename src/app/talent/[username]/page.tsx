import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Briefcase, Globe, Github, Linkedin, Twitter, GraduationCap, Star, CheckCircle, ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params;
    const supabase = await createClient();
    const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).eq('is_public', true).single();
    if (!profile) return { title: 'Talent Not Found | Job Openings Kenya' };
    return {
        title: `${profile.full_name} | Job Openings Kenya Talent`,
        description: profile.bio || profile.headline || `${profile.full_name}'s talent profile on Job Openings Kenya`,
    };
}

export default async function TalentProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single();

    if (!profile) notFound();

    const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            {/* Back nav */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 pt-6">
                <Link href="/talent" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5CB800] transition-colors text-sm group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Talent Directory
                </Link>
            </div>

            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#5CB800] to-[#4A9900] mt-4">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
                    <div className="flex flex-col items-center text-center md:flex-row md:items-end md:text-left gap-6">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl" />
                            ) : (
                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shadow-2xl">
                                    <span className="text-4xl sm:text-5xl font-black text-white">{initials}</span>
                                </div>
                            )}
                            {profile.open_to_work && (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#5CB800] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1">
                                    <CheckCircle size={12} /> Open to Work
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-white pb-2 flex-1">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2">{profile.full_name}</h1>
                            {profile.headline && <p className="text-lg sm:text-xl text-white/90 mb-3 font-medium">{profile.headline}</p>}
                            {profile.location && (
                                <p className="flex items-center gap-1.5 text-white/80 text-sm justify-center md:justify-start">
                                    <MapPin size={15} />{profile.location}
                                </p>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3 pb-2 justify-center flex-wrap">
                            {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all" title="LinkedIn">
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {profile.github_url && (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all" title="GitHub">
                                    <Github size={20} />
                                </a>
                            )}
                            {profile.twitter_url && (
                                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all" title="Twitter/X">
                                    <Twitter size={20} />
                                </a>
                            )}
                            {profile.website_url && (
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all" title="Website">
                                    <Globe size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12">
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* Skills — shows first on mobile */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="order-first lg:order-none lg:col-start-3 lg:row-start-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">🛠 Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-[#5CB800]/10 text-[#5CB800] text-sm font-semibold rounded-xl border border-[#5CB800]/20">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Contact CTA */}
                            <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] rounded-2xl p-5 sm:p-6 text-white">
                                <h3 className="font-bold text-lg mb-2">Interested in {profile.full_name?.split(' ')[0]}?</h3>
                                <p className="text-white/80 text-sm mb-4">Connect via LinkedIn or other social platforms.</p>
                                {profile.linkedin_url ? (
                                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn bg-white text-[#5CB800] hover:bg-gray-100 border-none w-full font-bold">
                                        <Linkedin size={18} /> Connect on LinkedIn
                                    </a>
                                ) : (
                                    <div className="text-white/60 text-sm text-center">No contact info provided</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Left Column — Bio, Experience, Education */}
                    <div className="lg:col-span-2 space-y-6">
                        {profile.bio && (
                            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#5CB800]/10 flex items-center justify-center">
                                        <Star size={18} className="text-[#5CB800]" />
                                    </span>
                                    About Me
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{profile.bio}</p>
                            </div>
                        )}

                        {profile.experience && (
                            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#5CB800]/10 flex items-center justify-center">
                                        <Briefcase size={18} className="text-[#5CB800]" />
                                    </span>
                                    Experience
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{profile.experience}</p>
                            </div>
                        )}

                        {profile.education && (
                            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 border border-gray-100">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
                                        <GraduationCap size={18} className="text-[#7B1FA2]" />
                                    </span>
                                    Education
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{profile.education}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
