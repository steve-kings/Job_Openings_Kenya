import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Briefcase, Globe, Github, Linkedin, Twitter, GraduationCap, Star, CheckCircle, ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
    const { username } = await params;
    const supabase = await createClient();
    const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).eq('is_public', true).single();
    if (!profile) return { title: 'Talent Not Found | 1000Jobs' };
    return {
        title: `${profile.full_name} | 1000Jobs Talent`,
        description: profile.bio || profile.headline || `${profile.full_name}'s talent profile on 1000Jobs`,
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
            <div className="container mx-auto px-6 lg:px-12 pt-8">
                <Link href="/talent" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1976D2] transition-colors text-sm group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Talent Directory
                </Link>
            </div>

            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-[#1976D2] to-[#1565C0] mt-4">
                <div className="container mx-auto px-6 lg:px-12 py-16">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="w-36 h-36 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl" />
                            ) : (
                                <div className="w-36 h-36 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shadow-2xl">
                                    <span className="text-5xl font-black text-white">{initials}</span>
                                </div>
                            )}
                            {profile.open_to_work && (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#4CAF50] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1">
                                    <CheckCircle size={12} /> Open to Work
                                </div>
                            )}
                        </div>
                        {/* Info */}
                        <div className="text-center md:text-left text-white pb-2">
                            <h1 className="text-4xl lg:text-5xl font-black mb-2">{profile.full_name}</h1>
                            {profile.headline && <p className="text-xl text-white/90 mb-3 font-medium">{profile.headline}</p>}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/80 text-sm">
                                {profile.location && <span className="flex items-center gap-1.5"><MapPin size={15} />{profile.location}</span>}
                            </div>
                        </div>
                        {/* Social Links */}
                        <div className="md:ml-auto flex gap-3 pb-2">
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
            <div className="container mx-auto px-6 lg:px-12 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio */}
                        {profile.bio && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#1976D2]/10 flex items-center justify-center">
                                        <Star size={18} className="text-[#1976D2]" />
                                    </span>
                                    About Me
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                            </div>
                        )}

                        {/* Experience */}
                        {profile.experience && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
                                        <Briefcase size={18} className="text-[#4CAF50]" />
                                    </span>
                                    Experience
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.experience}</p>
                            </div>
                        )}

                        {/* Education */}
                        {profile.education && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-[#7B1FA2]/10 flex items-center justify-center">
                                        <GraduationCap size={18} className="text-[#7B1FA2]" />
                                    </span>
                                    Education
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.education}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">🛠 Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-[#1976D2]/10 text-[#1976D2] text-sm font-semibold rounded-xl border border-[#1976D2]/20">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contact CTA */}
                        <div className="bg-gradient-to-br from-[#1976D2] to-[#1565C0] rounded-2xl p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">Interested in {profile.full_name?.split(' ')[0]}?</h3>
                            <p className="text-white/80 text-sm mb-4">Connect via LinkedIn or other social platforms.</p>
                            {profile.linkedin_url ? (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn bg-white text-[#1976D2] hover:bg-gray-100 border-none w-full font-bold">
                                    <Linkedin size={18} /> Connect on LinkedIn
                                </a>
                            ) : (
                                <div className="text-white/60 text-sm text-center">No contact info provided</div>
                            )}
                        </div>

                        {/* Share profile */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3">🔗 Share Profile</h3>
                            <p className="text-gray-500 text-sm mb-4">Help connect this talent with the right opportunity.</p>
                            <button
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Profile link copied!');
                                    }
                                }}
                                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border-none w-full text-sm font-semibold"
                            >
                                Copy Profile Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
