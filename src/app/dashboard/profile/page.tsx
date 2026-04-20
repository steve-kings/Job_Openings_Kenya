'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User, Save, Eye, EyeOff, Plus, X, CheckCircle, AlertCircle, Loader2, ExternalLink, ArrowLeft, Camera, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function ProfileEditorPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [user, setUser] = useState<any>(null);
    const [skillInput, setSkillInput] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const [aiPrompt, setAiPrompt] = useState({ state: '', open: '' as '' | 'headline' | 'bio' });
    const [generatingAi, setGeneratingAi] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        username: '',
        headline: '',
        bio: '',
        location: '',
        education: '',
        experience: '',
        linkedin_url: '',
        github_url: '',
        twitter_url: '',
        website_url: '',
        is_public: false,
        open_to_work: true,
        skills: [] as string[],
    });

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login?redirect=/dashboard/profile'); return; }
            setUser(user);

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profile) {
                setForm({
                    full_name: profile.full_name || '',
                    username: profile.username || '',
                    headline: profile.headline || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    education: profile.education || '',
                    experience: profile.experience || '',
                    linkedin_url: profile.linkedin_url || '',
                    github_url: profile.github_url || '',
                    twitter_url: profile.twitter_url || '',
                    website_url: profile.website_url || '',
                    is_public: profile.is_public || false,
                    open_to_work: profile.open_to_work !== false,
                    skills: profile.skills || [],
                });
                setAvatarUrl(profile.avatar_url || '');
            }
            setLoading(false);
        };
        init();
    }, []);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !form.skills.includes(s)) {
            setForm({ ...form, skills: [...form.skills, s] });
        }
        setSkillInput('');
    };

    const removeSkill = (skill: string) => {
        setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
    };

    const handleGenerateAi = async (type: 'headline' | 'bio') => {
        if (!aiPrompt.state.trim()) {
            showToast('error', 'Please enter a prompt to guide the AI.');
            return;
        }
        setGeneratingAi(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_profile', prompt: aiPrompt.state, type }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate content');
            
            setForm(prev => ({ ...prev, [type]: data.content.trim() }));
            setAiPrompt({ state: '', open: '' });
            showToast('success', `${type === 'headline' ? 'Headline' : 'Bio'} generated successfully!`);
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.from('profiles').update({
                full_name: form.full_name,
                username: form.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                headline: form.headline,
                bio: form.bio,
                location: form.location,
                education: form.education,
                experience: form.experience,
                linkedin_url: form.linkedin_url,
                github_url: form.github_url,
                twitter_url: form.twitter_url,
                website_url: form.website_url,
                is_public: form.is_public,
                open_to_work: form.open_to_work,
                skills: form.skills,
                avatar_url: avatarUrl || null,
                updated_at: new Date().toISOString(),
            }).eq('id', user.id);

            if (error) throw error;
            showToast('success', 'Profile saved successfully!');
        } catch (err: any) {
            showToast('error', err.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-[#1976D2]" />
        </div>
    );

    const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none text-sm text-gray-700 transition-all bg-white";

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-[#4CAF50]' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white p-8 lg:p-12 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold">My Public Profile</h1>
                        <p className="text-white/80 mt-2 text-lg">Build your talent profile to get discovered by employers</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {form.username && form.is_public && (
                            <Link
                                href={`/talent/${form.username}`}
                                target="_blank"
                                className="btn bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2 w-full md:w-auto"
                            >
                                <ExternalLink size={18} /> Preview
                            </Link>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn bg-[#4CAF50] hover:bg-[#388E3C] text-white border-none gap-2 w-full md:w-auto shadow-lg"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Visibility Toggle */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">Profile Visibility</h3>
                                    <p className="text-sm text-gray-500 mt-1">Make your profile discoverable in the Talent Directory</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_public}
                                        onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1976D2]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#1976D2]"></div>
                                    <span className="ml-3 text-sm font-semibold text-gray-700">
                                        {form.is_public ? <span className="flex items-center gap-1 text-[#1976D2]"><Eye size={16}/> Public</span> : <span className="flex items-center gap-1 text-gray-400"><EyeOff size={16}/> Private</span>}
                                    </span>
                                </label>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <div>
                                    <h3 className="font-bold text-gray-900">Open to Work</h3>
                                    <p className="text-sm text-gray-500 mt-1">Show employers you're actively looking</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.open_to_work}
                                        onChange={(e) => setForm({ ...form, open_to_work: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#4CAF50]"></div>
                                    <span className="ml-3 text-sm font-semibold text-gray-700">
                                        {form.open_to_work ? <span className="text-[#4CAF50] flex items-center gap-1"><CheckCircle size={16}/> Yes</span> : <span className="text-gray-400">No</span>}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Profile Photo</h3>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {/* Avatar Preview */}
                                <div className="relative shrink-0">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-[#1976D2]/20 shadow-lg" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1976D2] to-[#1565C0] flex items-center justify-center ring-4 ring-[#1976D2]/20 shadow-lg">
                                            <span className="text-3xl font-black text-white">
                                                {form.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || <User size={32} className="text-white" />}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1976D2] rounded-full flex items-center justify-center shadow">
                                        <Camera size={14} className="text-white" />
                                    </div>
                                </div>
                                {/* Upload Widget */}
                                <div className="flex-1 w-full">
                                    <CloudinaryUpload
                                        onUploadComplete={(url) => setAvatarUrl(url)}
                                        currentImage={avatarUrl}
                                        folder="1000jobs-avatars"
                                        label="Upload Profile Photo"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Basic Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className={inputCls} placeholder="e.g. John Doe" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Username <span className="text-red-500">*</span></label>
                                    <div className="flex items-center">
                                        <span className="hidden sm:flex px-3 py-3 bg-gray-100 rounded-l-xl border border-r-0 border-gray-200 text-gray-500 text-xs font-mono shrink-0 whitespace-nowrap">/talent/</span>
                                        <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} className="w-full px-4 py-3 sm:rounded-l-none rounded-xl border border-gray-200 focus:border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/20 outline-none text-sm font-mono text-gray-700 transition-all" placeholder="johndoe" />
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700">Professional Headline</label>
                                        <button type="button" onClick={() => setAiPrompt(p => ({...p, open: p.open === 'headline' ? '' : 'headline'}))} className="text-xs font-semibold text-[#1976D2] flex items-center gap-1 hover:text-[#1565C0] transition-colors"><Sparkles size={14}/> AI Writer</button>
                                    </div>
                                    {aiPrompt.open === 'headline' && (
                                        <div className="mb-2 p-3 bg-[#1976D2]/5 border border-[#1976D2]/20 rounded-xl flex items-stretch gap-2 animate-in fade-in slide-in-from-top-2">
                                            <input type="text" value={aiPrompt.state} onChange={e => setAiPrompt({...aiPrompt, state: e.target.value})} placeholder="e.g. Frontend developer passionate about React and UI..." className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#1976D2]" />
                                            <button type="button" onClick={() => handleGenerateAi('headline')} disabled={generatingAi} className="btn min-h-0 h-auto py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white border-none shrink-0 gap-2">
                                                {generatingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} <span>Gen</span>
                                            </button>
                                        </div>
                                    )}
                                    <input type="text" value={form.headline} onChange={e => setForm({...form, headline: e.target.value})} className={inputCls} placeholder="e.g. Software Engineer | Open to Remote Opportunities" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Location</label>
                                    <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inputCls} placeholder="e.g. Nairobi, Kenya" />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">About Me</h3>
                                <button type="button" onClick={() => setAiPrompt(p => ({...p, open: p.open === 'bio' ? '' : 'bio'}))} className="text-xs font-semibold text-[#1976D2] flex items-center gap-1 hover:text-[#1565C0] transition-colors"><Sparkles size={14}/> Generate with AI</button>
                            </div>
                            
                            {aiPrompt.open === 'bio' && (
                                <div className="p-3 bg-[#1976D2]/5 border border-[#1976D2]/20 rounded-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                    <textarea value={aiPrompt.state} onChange={e => setAiPrompt({...aiPrompt, state: e.target.value})} placeholder="What do you want to highlight? (e.g. Over 3 years experience in digital marketing, passionate about telling African stories...)" className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#1976D2] resize-none h-20" />
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => handleGenerateAi('bio')} disabled={generatingAi} className="btn min-h-0 h-auto py-2 px-4 bg-[#1976D2] hover:bg-[#1565C0] text-white border-none gap-2">
                                            {generatingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate Bio
                                        </button>
                                    </div>
                                </div>
                            )}

                            <textarea
                                value={form.bio}
                                onChange={e => setForm({...form, bio: e.target.value})}
                                rows={6}
                                className={`${inputCls} resize-none`}
                                placeholder="Tell employers about yourself, your passion, and what makes you unique..."
                            />
                        </div>

                        {/* Experience & Education */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Experience & Education</h3>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Work Experience</label>
                                <textarea
                                    value={form.experience}
                                    onChange={e => setForm({...form, experience: e.target.value})}
                                    rows={5}
                                    className={`${inputCls} resize-none`}
                                    placeholder="e.g. Software Developer at TechCorp (2022–2024)&#10;- Led a team of 5 engineers...&#10;&#10;Intern at StartupXYZ (2021)&#10;- Built React dashboards..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Education</label>
                                <textarea
                                    value={form.education}
                                    onChange={e => setForm({...form, education: e.target.value})}
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                    placeholder="e.g. BSc Computer Science - University of Nairobi (2018–2022)"
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Skills</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    className={inputCls}
                                    placeholder="Type a skill and press Enter (e.g. React, Python, Excel)"
                                />
                                <button type="button" onClick={addSkill} className="btn bg-[#1976D2] text-white border-none">
                                    <Plus size={18} />
                                </button>
                            </div>
                            {form.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {form.skills.map((skill, i) => (
                                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1976D2]/10 text-[#1976D2] text-sm font-semibold rounded-xl border border-[#1976D2]/20">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Social Links</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/yourname' },
                                    { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/yourname' },
                                    { key: 'twitter_url', label: 'Twitter / X URL', placeholder: 'https://twitter.com/yourname' },
                                    { key: 'website_url', label: 'Personal Website', placeholder: 'https://yourwebsite.com' },
                                ].map(({ key, label, placeholder }) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">{label}</label>
                                        <input
                                            type="url"
                                            value={(form as any)[key]}
                                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                                            className={inputCls}
                                            placeholder={placeholder}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#1976D2]/10 to-[#1976D2]/5 border border-[#1976D2]/20 rounded-2xl p-6 space-y-4">
                            <h3 className="font-bold text-[#1976D2]">💡 Tips for a Great Profile</h3>
                            <ul className="space-y-3 text-sm text-gray-700">
                                {[
                                    'Use a professional headline that describes what you do',
                                    'Add 5–10 relevant skills to appear in more searches',
                                    'Write a bio that shows your personality, not just your resume',
                                    'Add your LinkedIn for employers to contact you',
                                    'Turn on "Open to Work" to signal availability',
                                ].map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle size={16} className="text-[#1976D2] shrink-0 mt-0.5" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-3">Your Public URL</h3>
                            {form.username ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-xs text-gray-700 break-all">
                                    1000jobs.vercel.app/talent/<span className="text-[#1976D2] font-bold">{form.username}</span>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">Set a username to generate your link</p>
                            )}
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full btn bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white border-none gap-2 py-4"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
