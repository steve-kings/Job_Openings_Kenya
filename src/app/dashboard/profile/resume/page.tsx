import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Mail, MapPin, Github, Linkedin, Globe } from 'lucide-react';
import PrintResumeClient from './PrintResumeClient';

export default async function ResumePrintPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login?redirect=/dashboard/profile/resume');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        redirect('/dashboard/profile');
    }

    return (
        <div className="bg-gray-200 min-h-screen py-8 print:py-0 print:bg-white font-sans text-gray-900 w-full absolute top-0 left-0 z-[100]">
            <PrintResumeClient />
            
            {/* A4 Paper Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] p-10 sm:p-16 print:p-0 print:m-0">
                {/* Header Section */}
                <div className="border-b-2 border-gray-900 pb-6 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-wide">{profile.full_name || 'Your Name'}</h1>
                    <h2 className="text-xl text-gray-700 font-medium mb-4">{profile.headline || 'Professional Headline'}</h2>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                        {user.email && (
                            <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                        )}
                        {profile.location && (
                            <span className="flex items-center gap-1"><MapPin size={14} /> {profile.location}</span>
                        )}
                        {profile.linkedin_url && (
                            <span className="flex items-center gap-1"><Linkedin size={14} /> {profile.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        )}
                        {profile.github_url && (
                            <span className="flex items-center gap-1"><Github size={14} /> {profile.github_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        )}
                        {profile.website_url && (
                            <span className="flex items-center gap-1"><Globe size={14} /> {profile.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        )}
                    </div>
                </div>

                {/* Professional Summary */}
                {profile.bio && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Professional Summary</h3>
                        <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                )}

                {/* Experience */}
                {profile.experience && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Work Experience</h3>
                        <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                            {profile.experience.split('\n').map((line: string, i: number) => {
                                if (line.trim().startsWith('-')) {
                                    return <li key={i} className="ml-4 list-disc">{line.substring(1).trim()}</li>;
                                }
                                return <p key={i} className="mb-1 mt-2 font-medium">{line}</p>;
                            })}
                        </div>
                    </div>
                )}

                {/* Education */}
                {profile.education && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Education</h3>
                        <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                            {profile.education.split('\n').map((line: string, i: number) => {
                                if (line.trim().startsWith('-')) {
                                    return <li key={i} className="ml-4 list-disc">{line.substring(1).trim()}</li>;
                                }
                                return <p key={i} className="mb-1 mt-2 font-medium">{line}</p>;
                            })}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Skills & Expertise</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-800">
                            <ul className="list-disc list-inside w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {profile.skills.map((skill: string, i: number) => (
                                    <li key={i}>{skill}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
