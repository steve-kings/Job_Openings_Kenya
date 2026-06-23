'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Sparkles, Download, Eye, Check, Loader2,
    Mail, Phone, MapPin, Briefcase, GraduationCap, Award,
    CreditCard, Shield, Printer, PenTool, AlertCircle,
    ChevronRight, ChevronLeft, User, Globe, Star,
} from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

declare global { interface Window { PaystackPop?: { setup: (o: Record<string,unknown>) => { openIframe: () => void } }; } }

interface Profile {
    full_name?: string; email?: string; headline?: string; location?: string;
    bio?: string; skills?: string[]; education?: string; experience?: string;
    phone?: string; linkedin_url?: string;
}

const CV_PRICE = 50;

type TemplateId = 'classic' | 'modern' | 'minimal';

const TEMPLATES: { id: TemplateId; name: string; desc: string; accent: string; headerBg: string; headerText: string }[] = [
    { id: 'classic', name: 'Classic', desc: 'Traditional & ATS-friendly — ideal for corporate roles', accent: 'emerald', headerBg: 'bg-slate-800', headerText: 'text-white' },
    { id: 'modern', name: 'Modern', desc: 'Bold sidebar layout — stands out for creative roles', accent: 'blue', headerBg: 'bg-emerald-600', headerText: 'text-white' },
    { id: 'minimal', name: 'Minimal', desc: 'Clean & elegant — lets your experience speak', accent: 'slate', headerBg: 'bg-white border-b-2 border-slate-900', headerText: 'text-slate-900' },
];

export default function CVBuilderPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'template' | 'details' | 'preview'>('template');
    const [template, setTemplate] = useState<TemplateId>('classic');
    const [paid, setPaid] = useState(false);
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    const [form, setForm] = useState({
        full_name: '', email: '', phone: '', location: '', headline: '',
        summary: '', skills: '', experience: '', education: '', linkedin: '',
    });

    // Load Paystack
    useEffect(() => {
        const s = document.createElement('script'); s.src = 'https://js.paystack.co/v1/inline.js'; s.async = true;
        document.body.appendChild(s);
        return () => { s.remove(); };
    }, []);

    // Auth + profile
    useEffect(() => {
        (async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (!u) { router.push('/login?redirect=/resources/cv-builder'); return; }
            setUser(u);
            const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single();
            if (p) {
                setProfile(p);
                setForm({
                    full_name: p.full_name || '', email: u.email || '',
                    phone: (p as Record<string,string>).phone || '', location: p.location || '',
                    headline: p.headline || '', summary: p.bio || '',
                    skills: (p.skills || []).join(', '), experience: p.experience || '',
                    education: p.education || '', linkedin: p.linkedin_url || '',
                });
            }
            setLoading(false);
        })();
    }, [supabase, router]);

    const handleAIFill = async () => {
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    messages: [
                        { role: 'system', content: 'You are a professional CV writer. Return ONLY valid JSON, no markdown:\n{"summary":"2-3 sentence professional summary tailored to target","skills":"8-12 comma-separated skills","experience":"work history with • bullet points, quantified achievements","education":"education history formatted","headline":"professional headline under 80 chars"}' },
                        { role: 'user', content: `Profile: Name:${form.full_name}, Headline:${form.headline}, Summary:${form.summary}, Skills:${form.skills}, Experience:${form.experience}, Education:${form.education}. Target:${aiPrompt || 'General job in Kenya'}. Make it professional and ATS-optimized.` },
                    ],
                }),
            });
            const data = await res.json();
            if (data.reply) {
                try { setForm(f => ({ ...f, ...JSON.parse(data.reply) })); }
                catch { setForm(f => ({ ...f, summary: data.reply })); }
            }
        } catch {}
        finally { setAiLoading(false); }
    };

    const handlePaystack = () => {
        const P = window.PaystackPop;
        if (!P) { setPayError('Payment loading... try again.'); return; }
        setPayLoading(true); setPayError('');
        P.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
            email: form.email || user?.email || '',
            amount: CV_PRICE * 100,
            currency: 'KES',
            ref: `cv_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
            label: 'CV Builder',
            onClose: () => setPayLoading(false),
            callback: async (r: { reference: string }) => {
                try {
                    const v = await fetch('/api/payment/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: r.reference }) });
                    const d = await v.json();
                    if (d.verified) setPaid(true);
                    else setPayError('Verification failed. Contact support.');
                } catch { setPayError('Verification error. Contact support.'); }
                setPayLoading(false);
            },
        }).openIframe();
    };

    const handlePrint = () => window.print();
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all bg-white";
    const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>;

    const tpl = TEMPLATES.find(t => t.id === template)!;

    // Template Preview Thumbnails
    const TemplateThumb = ({ id, name }: { id: TemplateId; name: string }) => {
        const s = id === 'classic' ? 'space-y-1.5' : id === 'modern' ? 'flex gap-3' : 'space-y-2';
        return (
            <div className={`bg-white rounded-xl border overflow-hidden ${id === template ? 'ring-2 ring-emerald-500 shadow-lg' : 'shadow-sm hover:shadow-md'} transition-all`}>
                <div className={`h-28 ${id === 'classic' ? 'bg-slate-800' : id === 'modern' ? 'bg-emerald-600' : 'bg-white border-b'} p-3 flex flex-col justify-end`}>
                    <div className={`h-2.5 rounded w-1/2 mb-1.5 ${id === 'minimal' ? 'bg-slate-700' : 'bg-white/40'}`} />
                    <div className={`h-1.5 rounded w-3/4 ${id === 'minimal' ? 'bg-slate-400' : 'bg-white/20'}`} />
                </div>
                <div className="p-3 space-y-1.5">
                    {id === 'modern' ? (
                        <div className="flex gap-3">
                            <div className="w-1/3 space-y-1.5">
                                <div className="h-1.5 bg-slate-200 rounded w-3/4" />
                                <div className="h-1.5 bg-slate-100 rounded w-full" />
                                <div className="h-1.5 bg-slate-100 rounded w-2/3" />
                            </div>
                            <div className="w-2/3 space-y-1.5">
                                <div className="h-1.5 bg-slate-200 rounded w-2/3" />
                                <div className="h-1 bg-slate-100 rounded w-full" />
                                <div className="h-1 bg-slate-100 rounded w-5/6" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="h-1.5 bg-slate-200 rounded w-1/2" />
                            <div className="h-1 bg-slate-100 rounded w-full" />
                            <div className="h-1 bg-slate-100 rounded w-3/4" />
                        </>
                    )}
                </div>
            </div>
        );
    };

    // ====== CV RENDERER ======
    const CVRender = ({ fullWidth, printMode }: { fullWidth?: boolean; printMode?: boolean }) => {
        const cls = printMode ? 'print-cv' : fullWidth ? '' : 'scale-[0.55] origin-top-left';
        return (
            <div className={`bg-white ${fullWidth ? 'rounded-2xl border border-slate-200 shadow-lg overflow-hidden print:shadow-none print:border-none' : 'rounded-xl border shadow-sm overflow-hidden'} ${cls}`}
                style={!fullWidth ? { width: '182%' } : {}}>
                {/* ---- CLASSIC ---- */}
                {template === 'classic' && (
                    <div>
                        <div className="bg-slate-800 text-white p-8 sm:p-10 print:p-8">
                            <h1 className="text-3xl font-black tracking-tight">{form.full_name || 'Your Name'}</h1>
                            <p className="text-emerald-300 font-semibold mt-1.5 text-base">{form.headline || 'Professional Headline'}</p>
                            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm opacity-70">
                                {form.email && <span>{form.email}</span>}
                                {form.phone && <span>{form.phone}</span>}
                                {form.location && <span>{form.location}</span>}
                                {form.linkedin && <span>{form.linkedin}</span>}
                            </div>
                        </div>
                        <div className="p-8 sm:p-10 print:p-8 space-y-6">
                            {form.summary && <Section title="Professional Summary"><p className="text-slate-700 leading-relaxed text-sm">{form.summary}</p></Section>}
                            {skillsArr.length > 0 && <Section title="Skills"><div className="flex flex-wrap gap-1.5">{skillsArr.map(s => <span key={s} className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">{s}</span>)}</div></Section>}
                            {form.experience && <Section title="Experience"><p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{form.experience}</p></Section>}
                            {form.education && <Section title="Education"><p className="text-slate-700 leading-relaxed text-sm">{form.education}</p></Section>}
                        </div>
                    </div>
                )}

                {/* ---- MODERN ---- */}
                {template === 'modern' && (
                    <div className="flex">
                        <div className="w-[35%] bg-emerald-600 text-white p-6 sm:p-8 print:p-6 space-y-6">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-white/20 mx-auto flex items-center justify-center text-2xl font-black mb-3">
                                    {(form.full_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-black">{form.full_name || 'Your Name'}</h2>
                                <p className="text-emerald-100 text-xs mt-1 font-semibold">{form.headline || 'Professional'}</p>
                            </div>
                            {skillsArr.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-200 mb-3 border-b border-emerald-400/30 pb-1.5">Skills</h3>
                                    <div className="space-y-1.5">{skillsArr.slice(0, 10).map(s => <p key={s} className="text-xs text-emerald-50">{s}</p>)}</div>
                                </div>
                            )}
                            <div>
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-200 mb-3 border-b border-emerald-400/30 pb-1.5">Contact</h3>
                                <div className="space-y-2 text-xs text-emerald-50">
                                    {form.email && <p>{form.email}</p>}
                                    {form.phone && <p>{form.phone}</p>}
                                    {form.location && <p>{form.location}</p>}
                                    {form.linkedin && <p>{form.linkedin}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="w-[65%] p-6 sm:p-8 print:p-6 space-y-6 bg-white">
                            {form.summary && <Section title="Summary"><p className="text-slate-700 text-sm leading-relaxed">{form.summary}</p></Section>}
                            {form.experience && <Section title="Work Experience"><p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{form.experience}</p></Section>}
                            {form.education && <Section title="Education"><p className="text-slate-700 text-sm leading-relaxed">{form.education}</p></Section>}
                        </div>
                    </div>
                )}

                {/* ---- MINIMAL ---- */}
                {template === 'minimal' && (
                    <div>
                        <div className="text-center p-8 sm:p-10 print:p-8 border-b">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{form.full_name || 'Your Name'}</h1>
                            <p className="text-slate-500 font-medium mt-1">{form.headline || 'Professional'}</p>
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-400">
                                {form.email && <span>{form.email}</span>}
                                {form.phone && <span>{form.phone}</span>}
                                {form.location && <span>{form.location}</span>}
                                {form.linkedin && <span>{form.linkedin}</span>}
                            </div>
                        </div>
                        <div className="max-w-2xl mx-auto p-8 sm:p-10 print:p-8 space-y-6">
                            {form.summary && <Section title="About"><p className="text-slate-700 leading-relaxed text-sm">{form.summary}</p></Section>}
                            {skillsArr.length > 0 && <Section title="Skills"><div className="flex flex-wrap gap-1.5">{skillsArr.map(s => <span key={s} className="px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">{s}</span>)}</div></Section>}
                            {form.experience && <Section title="Experience"><p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">{form.experience}</p></Section>}
                            {form.education && <Section title="Education"><p className="text-slate-700 leading-relaxed text-sm">{form.education}</p></Section>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── HERO ── */}
            <section className="relative overflow-hidden min-h-[180px] sm:min-h-[220px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <Link href="/resources" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white mb-3 text-sm font-medium"><ArrowLeft size={15} /> Resources</Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center"><PenTool size={18} /></div>
                        <div><h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-lg">CV Builder</h1><p className="text-sm text-white/60">Professional CV in minutes • KES {CV_PRICE} only</p></div>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Step progress */}
                <ScrollReveal>
                    <div className="flex items-center gap-2 mb-10">
                        {['Choose Template', 'Your Details', 'Preview & Download'].map((s, i) => {
                            const steps: ('template'|'details'|'preview')[] = ['template', 'details', 'preview'];
                            const done = steps.indexOf(step) > i;
                            const active = steps.indexOf(step) >= i;
                            return (
                                <div key={s} className="flex items-center gap-2 flex-1">
                                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all w-full justify-center ${
                                        active ? (done ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white shadow-sm') : 'bg-white text-slate-300 border border-slate-200'
                                    }`}>
                                        {done ? <Check size={12} /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">{i+1}</span>}
                                        <span className="hidden sm:inline">{s}</span>
                                    </div>
                                    {i < 2 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                                </div>
                            );
                        })}
                    </div>
                </ScrollReveal>

                {/* ── STEP 1: TEMPLATES ── */}
                {step === 'template' && (
                    <ScrollReveal>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Choose Your Template</h2>
                            <p className="text-slate-500 text-center mb-8">Select a design that fits your industry — you can switch anytime</p>
                            <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                                {TEMPLATES.map(t => (
                                    <div key={t.id} className="cursor-pointer group" onClick={() => { setTemplate(t.id); setStep('details'); }}>
                                        <TemplateThumb id={t.id} name={t.name} />
                                        <div className="mt-3 text-center">
                                            <p className="font-extrabold text-sm text-slate-900">{t.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* ── STEP 2: DETAILS ── */}
                {step === 'details' && (
                    <div className="grid lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3 space-y-5">
                            <ScrollReveal>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-extrabold text-slate-900">Personal Details</h3>
                                        <div className="flex items-center gap-2">
                                            <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                                                placeholder="Target job? e.g. Software Engineer"
                                                className="w-44 px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-violet-400" />
                                            <button onClick={handleAIFill} disabled={aiLoading}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold hover:bg-violet-200 disabled:opacity-50 transition-colors">
                                                {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />} AI Fill
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {[
                                            { k:'full_name', l:'Full Name', icon: User, ph:'John Doe' },
                                            { k:'headline', l:'Professional Headline', icon: Briefcase, ph:'Experienced Software Developer' },
                                            { k:'email', l:'Email', icon: Mail, ph:'john@email.com' },
                                            { k:'phone', l:'Phone', icon: Phone, ph:'+254 712 345 678' },
                                            { k:'location', l:'Location', icon: MapPin, ph:'Nairobi, Kenya' },
                                            { k:'linkedin', l:'LinkedIn', icon: Globe, ph:'linkedin.com/in/username' },
                                        ].map(({k,l,icon:Icon,ph}) => (
                                            <div key={k}><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l}</label>
                                                <div className="relative mt-1"><Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input type="text" value={(form as Record<string,string>)[k]} onChange={e => set(k, e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50" placeholder={ph} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Summary</label>
                                        <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={3} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 resize-none" /></div>
                                    <div className="mt-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skills (comma-separated)</label>
                                        <input type="text" value={form.skills} onChange={e => set('skills', e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50" placeholder="e.g. Python, Project Management, Excel, Communication" /></div>
                                    <div className="mt-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</label>
                                        <textarea value={form.experience} onChange={e => set('experience', e.target.value)} rows={4} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 resize-none" placeholder="• Senior Developer at XYZ Corp (2020-2024)&#10;• Led team of 5 engineers..." /></div>
                                    <div className="mt-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Education</label>
                                        <textarea value={form.education} onChange={e => set('education', e.target.value)} rows={2} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 resize-none" placeholder="• BSc Computer Science, University of Nairobi (2019)" /></div>
                                    <div className="flex gap-3 mt-5 pt-4 border-t">
                                        <button onClick={() => setStep('template')} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"><ChevronLeft size={14} /> Back</button>
                                        <button onClick={() => setStep('preview')} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all">Preview CV <Eye size={14} className="inline ml-1" /></button>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Live Preview Column */}
                        <div className="lg:col-span-2 hidden lg:block">
                            <div className="sticky top-24">
                                <ScrollReveal direction="right">
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Eye size={13} /> Live Preview</h3>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{tpl.name}</span>
                                        </div>
                                        <div className="overflow-hidden"><CVRender /></div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STEP 3: PREVIEW & PAY ── */}
                {step === 'preview' && (
                    <div className="space-y-6">
                        <ScrollReveal>
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <h2 className="text-xl font-black text-slate-900">Preview Your CV</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => setStep('template')} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">Change Template</button>
                                    <button onClick={() => setStep('details')} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">Edit Details</button>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Full CV */}
                        <ScrollReveal variant="scale">
                            <div id="cv-print"><CVRender fullWidth printMode /></div>
                        </ScrollReveal>

                        {/* Payment */}
                        <ScrollReveal delay={100}>
                            {!paid ? (
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row items-start gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0"><CreditCard size={26} className="text-amber-700" /></div>
                                        <div className="flex-1">
                                            <h3 className="font-extrabold text-amber-900 text-lg mb-1">Download Your Professional CV</h3>
                                            <p className="text-amber-700 text-sm mb-4">One payment of <strong>KES {CV_PRICE}</strong>. ATS-friendly, print-ready, downloadable anytime.</p>
                                            {payError && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3"><AlertCircle size={12} />{payError}</div>}
                                            <div className="flex flex-wrap gap-3">
                                                <button onClick={handlePaystack} disabled={payLoading}
                                                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-60 inline-flex items-center gap-2">
                                                    {payLoading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                                                    Pay KES {CV_PRICE} with Paystack
                                                </button>
                                                <button onClick={() => { const w = window.open('','_blank','width=800,height=600'); if(w){w.document.write('<html><head><title>Preview</title><script src=https://cdn.tailwindcss.com><\/script><style>@media print{body{-webkit-print-color-adjust:exact}}</style></head><body>'+document.getElementById('cv-print')!.outerHTML+'</body></html>');w.document.close();}}}
                                                    className="px-6 py-3 rounded-xl border-2 border-amber-300 text-amber-800 font-extrabold text-sm hover:bg-amber-100 transition-all inline-flex items-center gap-2">
                                                    <Printer size={15} /> Print Preview
                                                </button>
                                            </div>
                                            <p className="text-xs text-amber-500 mt-3 flex items-center gap-1"><Shield size={11} /> Secure payment via Paystack. Cards, M-Pesa, bank transfer accepted.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Check size={30} className="text-emerald-600" /></div>
                                    <h3 className="font-extrabold text-emerald-900 text-xl mb-1">Payment Successful! 🎉</h3>
                                    <p className="text-emerald-700 text-sm mb-5">Your CV is ready. Download, print, or come back anytime.</p>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <button onClick={handlePrint} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all shadow-sm inline-flex items-center gap-2"><Download size={15} /> Download / Print</button>
                                        <Link href="/dashboard" className="px-6 py-3 rounded-xl border-2 border-emerald-300 text-emerald-700 font-extrabold text-sm hover:bg-emerald-100 transition-all">Dashboard</Link>
                                    </div>
                                </div>
                            )}
                        </ScrollReveal>

                        {/* Pro Design Service */}
                        <ScrollReveal delay={150}>
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-6">
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-violet-200 flex items-center justify-center shrink-0"><PenTool size={22} className="text-violet-700" /></div>
                                    <div className="flex-1">
                                        <h3 className="font-extrabold text-violet-900 mb-1">Want a Pro Designer to Polish It?</h3>
                                        <p className="text-sm text-violet-700 mb-4">Our CV expert will design and format your CV perfectly for your industry. <strong>KES 200</strong> — 24hr turnaround.</p>
                                        <a href={`mailto:info@jobopenings.co.ke?subject=CV%20Design%20Request&body=Hi, I'd like a professional CV design. My name is ${encodeURIComponent(form.full_name)}.`}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-extrabold text-sm hover:bg-violet-700 transition-all shadow-sm">
                                            <Mail size={14} /> Request Pro Design
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                )}
            </div>
            <div className="h-16" />
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">{title}</h3>
            {children}
        </div>
    );
}
