'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Calendar, Link as LinkIcon, FileText, CheckCircle, AlertCircle, Loader2, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

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

export default function PostJobPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [form, setForm] = useState<FormState>(initialForm);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/employer/post');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Allow employer or admin
            if (profileData?.role !== 'employer' && profileData?.role !== 'admin') {
                setLoading(false);
                setProfile(profileData);
                setUser(user);
                return;
            }

            setUser(user);
            setProfile(profileData);
            setForm(prev => ({
                ...prev,
                contact_email: user.email || '',
                company_name: profileData?.company_name || '',
            }));
            setLoading(false);
        };
        init();
    }, []);

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
                employer_id: user.id,
                job_title: form.job_title,
                company_name: form.company_name,
                contact_email: form.contact_email,
                job_type: form.job_type,
                location: form.location,
                deadline: form.deadline || null,
                short_description: form.short_description,
                description: form.description,
                requirements: form.requirements,
                apply_url: form.apply_url,
                logo_url: form.logo_url || null,
                status: 'pending',
            });

            if (error) throw error;

            showToast('success', 'Job posted successfully! It will go live within 24 hours after review.');
            setTimeout(() => router.push('/employer/dashboard'), 2000);
        } catch (err: any) {
            showToast('error', err.message || 'Failed to submit job posting.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm text-gray-700 transition-all bg-white";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[#5CB800]" />
            </div>
        );
    }

    // Non-employer trying to access
    if (profile && profile.role !== 'employer' && profile.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center">
                    <Building2 size={56} className="text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Employer Access Only</h2>
                    <p className="text-gray-600 mb-6">
                        This area is for employers. Create an employer account to post jobs.
                    </p>
                    <Link href="/login?role=employer" className="btn bg-[#5CB800] text-white border-none hover:bg-[#4A9900] w-full">
                        Create Employer Account
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-[#5CB800]' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/employer/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-[#5CB800] transition-colors mb-4 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div className="bg-gradient-to-r from-[#5CB800] to-[#4A9900] text-white p-8 rounded-3xl shadow-xl">
                        <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
                        <p className="text-white/80">Fill in the details below. Your posting will be reviewed and go live within 24 hours.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Building2 size={16} /> Company Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Company Name <span className="text-red-500">*</span></label>
                                <input type="text" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className={inputCls} placeholder="e.g. Safaricom PLC" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Contact Email <span className="text-red-500">*</span></label>
                                <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className={inputCls} placeholder="hr@company.co.ke" required />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Company Logo (optional)</label>
                            <CloudinaryUpload
                                onUploadComplete={(url) => setForm({ ...form, logo_url: url })}
                                currentImage={form.logo_url}
                                folder="jobopeningskenya-employer-logos"
                                label="Upload Company Logo"
                            />
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} /> Job Details
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Job Title <span className="text-red-500">*</span></label>
                                <input type="text" value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} className={inputCls} placeholder="e.g. Software Engineer" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Job Type <span className="text-red-500">*</span></label>
                                <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })} className={inputCls} required>
                                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
                                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} placeholder="e.g. Nairobi, Kenya" required />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar size={14} /> Application Deadline
                                </label>
                                <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputCls} min={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Job Description</h3>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Short Description <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(max 200 chars)</span></label>
                            <input type="text" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value.slice(0, 200) })} className={inputCls} placeholder="One-line summary shown in search results" required maxLength={200} />
                            <p className="text-xs text-gray-400 text-right">{form.short_description.length}/200</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Full Job Description <span className="text-red-500">*</span></label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={8} className={`${inputCls} resize-none`} placeholder="Describe the role, responsibilities, qualifications, benefits, etc." required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Requirements <span className="text-gray-400 font-normal">(one per line)</span></label>
                            <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={4} className={`${inputCls} resize-none`} placeholder="Bachelor's degree in related field&#10;3+ years experience&#10;Strong communication skills" />
                        </div>
                    </div>

                    {/* Application */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <LinkIcon size={16} /> How to Apply
                        </h3>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Application URL or Email <span className="text-red-500">*</span></label>
                            <input type="text" value={form.apply_url} onChange={e => setForm({ ...form, apply_url: e.target.value })} className={inputCls} placeholder="https://careers.company.co.ke/apply or careers@company.co.ke" required />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button type="submit" disabled={submitting} className="btn bg-[#5CB800] hover:bg-[#4A9900] text-white border-none btn-lg gap-2 flex-1 shadow-lg">
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            {submitting ? 'Submitting...' : 'Submit Job Posting'}
                        </button>
                        <Link href="/employer/dashboard" className="btn btn-outline border-gray-300 text-gray-600 hover:bg-gray-50 btn-lg">
                            Cancel
                        </Link>
                    </div>

                    <p className="text-sm text-gray-500 text-center">
                        By submitting, you agree that the job posting is legitimate and accurate. Our team will review it within 24 hours.
                    </p>
                </form>
            </div>
        </div>
    );
}
