'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Building2, Calendar, Link as LinkIcon, FileText, CheckCircle, AlertCircle, Loader2, Send, ArrowLeft, Briefcase, MapPin, Clock, Shield } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import ScrollReveal from '@/components/ScrollReveal';

interface FormState {
    job_title: string;
    company_name: string;
    contact_email: string;
    job_type: string;
    location: string;
    deadline: string;
    short_description: string;
    description: string;
    requirements: string;
    apply_url: string;
    logo_url: string;
}

const initialForm: FormState = {
    job_title: '',
    company_name: '',
    contact_email: '',
    job_type: 'Full-time',
    location: '',
    deadline: '',
    short_description: '',
    description: '',
    requirements: '',
    apply_url: '',
    logo_url: '',
};

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function PostJobPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<{ id: string; role: string; company_name?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [form, setForm] = useState<FormState>(initialForm);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login?redirect=/employer/post'); return; }
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profileData?.role !== 'employer' && profileData?.role !== 'admin') {
                setLoading(false); setProfile(profileData); setUser(user); return;
            }
            setUser(user);
            setProfile(profileData);
            setForm(prev => ({ ...prev, contact_email: user.email || '', company_name: profileData?.company_name || '' }));
            setLoading(false);
        };
        init();
    }, [router, supabase]);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 5000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('employer_job_submissions').insert({
                employer_id: user.id, job_title: form.job_title, company_name: form.company_name,
                contact_email: form.contact_email, job_type: form.job_type, location: form.location,
                deadline: form.deadline || null, short_description: form.short_description,
                description: form.description, requirements: form.requirements,
                apply_url: form.apply_url, logo_url: form.logo_url || null, status: 'pending',
            });
            if (error) throw error;
            showToast('success', 'Job posted! It will go live within 24 hours after review.');
            setTimeout(() => router.push('/employer/dashboard'), 2000);
        } catch (err: unknown) {
            showToast('error', err instanceof Error ? err.message : 'Failed to submit.');
        } finally { setSubmitting(false); }
    };

    const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));
    const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-slate-700 transition-all bg-white placeholder:text-slate-400";
    const labelCls = "block text-sm font-bold text-slate-700 mb-1.5";

    // Non-employer
    if (!loading && profile && profile.role !== 'employer' && profile.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
                    <Building2 size={48} className="text-slate-200 mx-auto mb-4" />
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Employer Access Only</h2>
                    <p className="text-slate-500 mb-6">This area is for employers. Create an employer account to post jobs.</p>
                    <Link href="/login?role=employer" className="inline-flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 w-full py-2.5 rounded-xl font-bold text-sm">Create Employer Account</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 size={36} className="animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}{toast.msg}
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <ScrollReveal>
                    <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors mb-6 text-sm font-medium">
                        <ArrowLeft size={15} /> Back to Dashboard
                    </Link>
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 mb-8">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                <Send size={22} className="text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Post a New Job</h1>
                                <p className="text-sm text-slate-500 mt-0.5">Fill in the details — we&apos;ll review and publish within 24 hours</p>
                            </div>
                        </div>
                        {/* Progress dots */}
                        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100">
                            {['Details', 'Description', 'Submit'].map((step, i) => (
                                <div key={step} className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-extrabold">{i + 1}</span>
                                    <span className="text-xs font-bold text-slate-400">{step}</span>
                                    {i < 2 && <span className="text-slate-200 mx-1">→</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Section 1: Company Info */}
                    <ScrollReveal delay={100}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Building2 size={15} className="text-emerald-600" /></div>
                                <h2 className="font-extrabold text-slate-900 text-sm">Company Information</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Company Name <span className="text-red-400">*</span></label>
                                        <input type="text" value={form.company_name} onChange={e => set('company_name', e.target.value)} className={inputCls} placeholder="e.g. Safaricom PLC" required />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Contact Email <span className="text-red-400">*</span></label>
                                        <input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className={inputCls} placeholder="hr@company.co.ke" required />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Company Logo <span className="text-slate-400 font-normal">(optional)</span></label>
                                    <CloudinaryUpload onUploadComplete={(url) => set('logo_url', url)} currentImage={form.logo_url} folder="jobopeningskenya-employer-logos" label="Upload Logo" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Section 2: Job Details */}
                    <ScrollReveal delay={150}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Briefcase size={15} className="text-blue-600" /></div>
                                <h2 className="font-extrabold text-slate-900 text-sm">Job Details</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className={labelCls}>Job Title <span className="text-red-400">*</span></label>
                                    <input type="text" value={form.job_title} onChange={e => set('job_title', e.target.value)} className={inputCls} placeholder="e.g. Senior Software Engineer" required />
                                </div>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelCls}>Job Type <span className="text-red-400">*</span></label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {jobTypes.map(t => (
                                                <button key={t} type="button" onClick={() => set('job_type', t)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                        form.job_type === t
                                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                                                    }`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelCls}>Location <span className="text-red-400">*</span></label>
                                        <input type="text" value={form.location} onChange={e => set('location', e.target.value)} className={inputCls} placeholder="e.g. Nairobi, Kenya" required />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}><span className="flex items-center gap-1.5"><Calendar size={14} /> Application Deadline</span></label>
                                    <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={inputCls} min={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Section 3: Description */}
                    <ScrollReveal delay={200}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><FileText size={15} className="text-violet-600" /></div>
                                <h2 className="font-extrabold text-slate-900 text-sm">Job Description</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className={labelCls}>Short Summary <span className="text-red-400">*</span> <span className="text-slate-400 font-normal">({form.short_description.length}/200)</span></label>
                                    <input type="text" value={form.short_description} onChange={e => set('short_description', e.target.value.slice(0, 200))} className={inputCls} placeholder="One-line summary shown in search results" required maxLength={200} />
                                </div>
                                <div>
                                    <label className={labelCls}>Full Description <span className="text-red-400">*</span></label>
                                    <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={8} className={`${inputCls} resize-none`} placeholder="Describe the role, responsibilities, qualifications, benefits, etc." required />
                                </div>
                                <div>
                                    <label className={labelCls}>Requirements <span className="text-slate-400 font-normal">(one per line)</span></label>
                                    <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={4} className={`${inputCls} resize-none`} placeholder={"Bachelor's degree in related field\n3+ years experience\nStrong communication skills"} />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Section 4: How to Apply */}
                    <ScrollReveal delay={250}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><LinkIcon size={15} className="text-amber-600" /></div>
                                <h2 className="font-extrabold text-slate-900 text-sm">How to Apply</h2>
                            </div>
                            <div className="p-6">
                                <label className={labelCls}>Application URL or Email <span className="text-red-400">*</span></label>
                                <input type="text" value={form.apply_url} onChange={e => set('apply_url', e.target.value)} className={inputCls} placeholder="https://careers.company.co.ke/apply or careers@company.co.ke" required />
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Review note + Submit */}
                    <ScrollReveal delay={300}>
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-start gap-3">
                            <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-800">Review Process</p>
                                <p className="text-xs text-amber-600 mt-0.5">Our team reviews all postings within 24 hours to ensure quality and legitimacy. You&apos;ll see the status update in your dashboard.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-5">
                            <button type="submit" disabled={submitting}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl text-sm font-extrabold transition-all shadow-lg shadow-emerald-200 disabled:opacity-60">
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                {submitting ? 'Submitting...' : 'Submit Job Posting'}
                            </button>
                            <Link href="/employer/dashboard"
                                className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 px-6 py-4 rounded-xl text-sm font-extrabold transition-all">
                                Cancel
                            </Link>
                        </div>
                        <p className="text-xs text-slate-400 text-center mt-4">
                            By submitting, you confirm this posting is legitimate and accurate.
                        </p>
                    </ScrollReveal>
                </form>
            </div>
        </div>
    );
}
