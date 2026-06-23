'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, X, Briefcase, Save, CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import RichTextEditor from '@/components/RichTextEditor';

const TYPES = ['Job', 'Training', 'Banner'];

const TYPE_COLORS: Record<string, string> = {
    Job: 'from-[#5CB800] to-[#4A9900]',
    Training: 'from-[#F57C00] to-[#E65100]',
    Banner: 'from-[#E91E63] to-[#C2185B]',
};
const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[]) =>
    setter([...arr, '']);

const updateItem = (i: number, val: string, setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[]) => {
    const next = [...arr]; next[i] = val; setter(next);
};

const removeItem = (i: number, setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[]) =>
    setter(arr.filter((_, idx) => idx !== i));

const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
            {hint && <span className="text-xs text-gray-400">{hint}</span>}
        </div>
        {children}
    </div>
);

const ListEditor = ({
    label, color, items, setter, placeholder
}: { label: string; color: string; items: string[]; setter: React.Dispatch<React.SetStateAction<string[]>>; placeholder: string }) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700">{label}</h4>
            <button
                type="button"
                onClick={() => addItem(setter, items)}
                className={`flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-gradient-to-r ${color} hover:shadow-md transition-all`}
            >
                <Plus size={13} /> Add
            </button>
        </div>
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => updateItem(i, e.target.value, setter, items)}
                        placeholder={placeholder}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm text-gray-700 transition-all"
                    />
                    {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i, setter, items)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <X size={15} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default function CreateOpportunityPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        type: 'Job',
        company: '',
        location: '',
        deadline: '',
        apply_url: '',
        short_description: '',
        description: '',
        status: 'active',
        salary_min: '',
        salary_max: '',
        salary_currency: 'KES',
        contact_email: '',
        contact_phone: '',
    });

    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [responsibilities, setResponsibilities] = useState<string[]>(['']);
    const [benefits, setBenefits] = useState<string[]>(['']);

    const [aiText, setAiText] = useState('');
    const [extractingAi, setExtractingAi] = useState(false);
    const [keepCompany, setKeepCompany] = useState(false);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleAIExtract = async () => {
        if (!aiText.trim()) return;
        setExtractingAi(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'extract_opportunity', text: aiText })
            });
            const data = await res.json();
            
            if (data.title) {
                setFormData({
                    ...formData,
                    title: data.title || formData.title,
                    type: data.type && TYPES.includes(data.type) ? data.type : formData.type,
                    company: data.company || formData.company,
                    location: data.location || formData.location,
                    deadline: data.deadline || formData.deadline,
                    apply_url: data.apply_url || formData.apply_url,
                    short_description: data.short_description || formData.short_description,
                    description: data.description || formData.description,
                    salary_min: data.salary_min ? String(data.salary_min) : formData.salary_min,
                    salary_max: data.salary_max ? String(data.salary_max) : formData.salary_max,
                    salary_currency: data.salary_currency || formData.salary_currency,
                    contact_email: data.contact_email || formData.contact_email,
                    contact_phone: data.contact_phone || formData.contact_phone,
                });

                if (data.requirements && Array.isArray(data.requirements) && data.requirements.length > 0) {
                    setRequirements(data.requirements);
                }
                if (data.responsibilities && Array.isArray(data.responsibilities) && data.responsibilities.length > 0) {
                    setResponsibilities(data.responsibilities);
                }
                if (data.benefits && Array.isArray(data.benefits) && data.benefits.length > 0) {
                    setBenefits(data.benefits);
                }
                showToast('success', 'AI extracted all details successfully!');
                setAiText('');
            } else {
                throw new Error(data.error || 'Failed to extract data');
            }
        } catch (error: unknown) {
            showToast('error', error instanceof Error ? error.message : 'Error extracting AI data.');
        } finally {
            setExtractingAi(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('opportunities').insert({
                ...formData,
                salary_min: formData.salary_min ? parseInt(formData.salary_min, 10) : null,
                salary_max: formData.salary_max ? parseInt(formData.salary_max, 10) : null,
                thumbnail_url: thumbnailUrl || null,
                requirements: requirements.filter(r => r.trim()),
                responsibilities: responsibilities.filter(r => r.trim()),
                benefits: benefits.filter(r => r.trim()),
            });
            if (error) throw error;
            showToast('success', 'Opportunity created successfully!');
            
            if (keepCompany) {
                setFormData(prev => ({
                    ...prev,
                    title: '',
                    short_description: '',
                    description: '',
                }));
                setRequirements(['']);
                setResponsibilities(['']);
                setBenefits(['']);
                setAiText('');
                setThumbnailUrl('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setTimeout(() => { router.push('/admin/opportunities'); router.refresh(); }, 1500);
            }
        } catch (error: unknown) {
            showToast('error', error instanceof Error ? error.message : 'Error creating opportunity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm text-gray-700 bg-white transition-all";

    const selectedColor = TYPE_COLORS[formData.type] || TYPE_COLORS['Job'];

    return (
        <div className="max-w-6xl mx-auto pb-16">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-[#5CB800]' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5CB800] transition-colors text-sm mb-5 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Opportunities
                </Link>
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedColor} flex items-center justify-center shadow-lg transition-all`}>
                        <Briefcase className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Opportunity</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Create a job, grant, scholarship, or training listing</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* ─── LEFT COLUMN ─── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* AI Extractor Box */}
                        <div className="bg-gradient-to-r from-[#5CB800]/10 to-[#5CB800]/5 rounded-2xl border border-[#5CB800]/20 p-6 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[#5CB800]">
                                    <Sparkles size={20} />
                                    <h3 className="font-bold text-sm uppercase tracking-widest">Job Openings Kenya AI Auto-Fill</h3>
                                </div>
                                <span className="text-xs text-[#5CB800]/70 bg-white px-2 py-1 rounded-md border border-[#5CB800]/20 shadow-sm font-semibold">Paste raw text here</span>
                            </div>
                            <div className="space-y-3">
                                <textarea 
                                    value={aiText}
                                    onChange={(e) => setAiText(e.target.value)}
                                    placeholder="Paste job description, scholarship details, or grant text here, and AI will read them and fill out the form below automatically..."
                                    className="w-full px-4 py-3 rounded-xl border border-white focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm text-gray-700 transition-all shadow-sm resize-none h-24"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        type="button"
                                        onClick={handleAIExtract}
                                        disabled={!aiText.trim() || extractingAi}
                                        className="px-6 py-2.5 bg-[#5CB800] text-white font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-[#4A9900] disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {extractingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        Auto-Fill Form
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Type Selector */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Opportunity Type</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {TYPES.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: t })}
                                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${formData.type === t
                                            ? `bg-gradient-to-r ${TYPE_COLORS[t]} text-white border-transparent shadow-md`
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {t === 'Job' && '💼'} {t === 'Grant' && '💰'} {t === 'Scholarship' && '🎓'} {t === 'Training' && '📚'} {t === 'Banner' && '🖼️'} {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Basic Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Field label="Title" required>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" className={inputCls} />
                                </Field>
                                <Field label="Company / Organization" required={formData.type !== 'Banner'}>
                                    <input type="text" required={formData.type !== 'Banner'} value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Google, USAID, WFP" className={inputCls} />
                                </Field>
                                <Field label="Location" required={formData.type !== 'Banner'}>
                                    <input type="text" required={formData.type !== 'Banner'} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Nairobi, Kenya / Remote" className={inputCls} />
                                </Field>
                                <Field label="Application Deadline" hint="Leave empty for Rolling Basis">
                                    <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className={inputCls} />
                                </Field>
                                <Field label="Application Link" required={formData.type !== 'Banner'}>
                                    <input type="url" required={formData.type !== 'Banner'} value={formData.apply_url} onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })} placeholder="https://..." className={`${inputCls} md:col-span-2`} />
                                </Field>
                                {formData.type === 'Job' && (
                                    <>
                                        <Field label="Salary Min (Monthly)">
                                            <input type="number" min={0} value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })} placeholder="e.g. 50000" className={inputCls} />
                                        </Field>
                                        <Field label="Salary Max (Monthly)">
                                            <input type="number" min={0} value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })} placeholder="e.g. 100000" className={inputCls} />
                                        </Field>
                                        <Field label="Currency">
                                            <select value={formData.salary_currency} onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })} className={inputCls}>
                                                <option value="KES">KES (Kenyan Shilling)</option>
                                                <option value="USD">USD (US Dollar)</option>
                                                <option value="EUR">EUR (Euro)</option>
                                                <option value="GBP">GBP (British Pound)</option>
                                            </select>
                                        </Field>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Descriptions */}
                        {formData.type !== 'Banner' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</h3>
                            <Field label="Short Description" required hint={`${formData.short_description.length} chars`}>
                                <textarea
                                    required
                                    value={formData.short_description}
                                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    placeholder="Brief summary shown on listing cards (150–200 characters recommended)"
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                />
                            </Field>
                            <Field label="Full Description" required hint="WYSIWYG Supported">
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(content) => setFormData({ ...formData, description: content })}
                                />
                            </Field>
                        </div>
                        )}

                        {/* Dynamic Lists */}
                        {formData.type !== 'Banner' && (
                        <div className="grid md:grid-cols-3 gap-5">
                            {[
                                { label: 'Requirements', color: 'from-[#5CB800] to-[#4A9900]', items: requirements, setter: setRequirements, placeholder: 'e.g. 3+ years of experience' },
                                { label: 'Responsibilities', color: 'from-[#5CB800] to-[#4A9900]', items: responsibilities, setter: setResponsibilities, placeholder: 'e.g. Lead the dev team' },
                                { label: 'Benefits', color: 'from-[#7B1FA2] to-[#6A1B9A]', items: benefits, setter: setBenefits, placeholder: 'e.g. Health insurance' },
                            ].map((list) => (
                                <div key={list.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <ListEditor {...list} />
                                </div>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* ─── RIGHT SIDEBAR ─── */}
                    <div className="space-y-5">

                        {/* Publish */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Publish</h3>

                            <div className="flex gap-2">
                                {['active', 'draft'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${formData.status === s
                                            ? s === 'active'
                                                ? 'bg-[#5CB800] text-white border-[#5CB800] shadow'
                                                : 'bg-gray-900 text-white border-gray-900 shadow'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {s === 'active' ? '✅ Active' : '📝 Draft'}
                                    </button>
                                ))}
                            </div>

                            <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-600 font-medium">
                                {formData.status === 'active'
                                    ? '🌍 This opportunity will be visible to all users immediately.'
                                    : '👁 Saved as draft — not visible to users yet.'}
                            </div>

                            <hr className="border-gray-100" />

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={keepCompany} 
                                    onChange={(e) => setKeepCompany(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#5CB800] focus:ring-[#5CB800]"
                                />
                                <span>Keep company & location for next post (for multiple positions)</span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${selectedColor} text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-60`}
                            >
                                {loading ? (
                                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
                                ) : (
                                    <><Save size={16} /> Create Opportunity</>
                                )}
                            </button>

                            <Link href="/admin/opportunities" className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                Cancel
                            </Link>
                        </div>

                        {/* Thumbnail */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Thumbnail Image</h3>
                            <CloudinaryUpload
                                onUploadComplete={(url) => setThumbnailUrl(url)}
                                currentImage={thumbnailUrl}
                                folder="Job Openings Kenya-opportunities"
                                label="Upload Thumbnail"
                            />
                            <p className="text-xs text-gray-400">Optional — default placeholder used if empty.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
