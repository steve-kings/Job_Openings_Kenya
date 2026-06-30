'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Sparkles, Download, Eye, Check, Loader2,
    Mail, Phone, MapPin, Briefcase, GraduationCap, Award,
    PenTool, ChevronRight, ChevronLeft, User, Globe, Star,
} from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import GoogleAd from '@/components/GoogleAd';

interface Profile {
    full_name?: string; email?: string; headline?: string; location?: string;
    bio?: string; skills?: string[]; education?: string; experience?: string;
    phone?: string; linkedin_url?: string;
}

// AdSense ad unit slot for the CV download gate. Create a Display ad unit in your
// AdSense account and put its slot ID here, or set NEXT_PUBLIC_ADSENSE_CV_SLOT.
const CV_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_CV_SLOT || 'PLACEHOLDER_SLOT_ID';

type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'creative' | 'technical' | 'academic' | 'sales' | 'hybrid' | 'bold' | 'simple' | 'timeline';

interface TemplateCfg { id: TemplateId; name: string; desc: string; free: boolean; color: string; style: 'dark-header' | 'sidebar' | 'centered' | 'split' | 'bordered'; }

const TEMPLATES: TemplateCfg[] = [
    { id: 'classic', name: 'Classic', desc: 'Traditional ATS-friendly — perfect for banking & corporate', free: true, color: 'slate', style: 'dark-header' },
    { id: 'executive', name: 'Executive', desc: 'Premium navy header — boardroom ready', free: false, color: 'blue', style: 'dark-header' },
    { id: 'bold', name: 'Bold', desc: 'Black & emerald — commanding presence', free: false, color: 'emerald', style: 'dark-header' },
    { id: 'modern', name: 'Modern', desc: 'Green sidebar with avatar — creative fields', free: true, color: 'emerald', style: 'sidebar' },
    { id: 'creative', name: 'Creative', desc: 'Purple sidebar — design & media roles', free: false, color: 'violet', style: 'sidebar' },
    { id: 'technical', name: 'Technical', desc: 'Code-friendly layout — IT & engineering', free: false, color: 'indigo', style: 'sidebar' },
    { id: 'minimal', name: 'Minimal', desc: 'Clean centered — consulting & academia', free: true, color: 'slate', style: 'centered' },
    { id: 'simple', name: 'Simple', desc: 'Pure white — one page, no distractions', free: true, color: 'gray', style: 'centered' },
    { id: 'academic', name: 'Academic', desc: 'Structured — education & research', free: false, color: 'amber', style: 'bordered' },
    { id: 'sales', name: 'Sales Pro', desc: 'Achievement-focused — sales & marketing', free: false, color: 'orange', style: 'split' },
    { id: 'hybrid', name: 'Hybrid', desc: 'Two-tone split — modern professional', free: false, color: 'teal', style: 'split' },
    { id: 'timeline', name: 'Timeline', desc: 'Visual career path — storytelling format', free: false, color: 'rose', style: 'bordered' },
];

export default function CVBuilderPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'template' | 'details' | 'preview'>('template');
    const [template, setTemplate] = useState<TemplateId>('classic');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    const [form, setForm] = useState({
        full_name: '', email: '', phone: '', location: '', headline: '',
        summary: '', skills: '', experience: '', education: '', linkedin: '',
        photo_url: '',
    });

    // Inject print styles to isolate CV print layout and clean default browser headers/footers
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @page {
                size: auto;
                margin: 0mm;
            }
            @media print {
                body {
                    background: white !important;
                    color: black !important;
                }
                /* Hide all page content by default */
                body * {
                    visibility: hidden !important;
                }
                /* Make the CV preview container and all its children visible */
                #cv-print, #cv-print * {
                    visibility: visible !important;
                }
                #cv-print {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 20mm !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                /* Explicitly hide common external elements just in case */
                nav, footer, iframe, .pwa-install, #ai-chatbot, .cookie-consent, #cv-banner {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
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
                    photo_url: p.avatar_url || '',
                });
            } else {
                setForm(f => ({ ...f, email: u.email || '' }));
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
                // Try to parse JSON — strip markdown code blocks if present
                let jsonStr = data.reply.trim();
                if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
                }
                try { setForm(f => ({ ...f, ...JSON.parse(jsonStr) })); }
                catch { setForm(f => ({ ...f, summary: data.reply })); }
            }
        } catch {}
        finally { setAiLoading(false); }
    };

    // Save the built CV, then open the browser's print/download dialog. Free — no payment.
    const handleDownload = async () => {
        try {
            await supabase.from('cv_documents').insert({ user_id: user?.id, template_id: template, cv_data: form, status: 'created' });
        } catch { /* non-blocking — still allow the download */ }
        window.print();
    };
    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
    const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all bg-white";
    const skillsArr = (form.skills || '').split(',').map(s => s.trim()).filter(Boolean);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-emerald-500" size={36} /></div>;

    const tpl = TEMPLATES.find(t => t.id === template)!;

    const colorMap: Record<string, { bg: string; light: string; text: string; border: string }> = {
        slate:   { bg: 'bg-slate-800', light: 'bg-slate-50', text: 'text-white', border: 'border-slate-200' },
        blue:    { bg: 'bg-blue-900', light: 'bg-blue-50', text: 'text-white', border: 'border-blue-100' },
        emerald: { bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-white', border: 'border-emerald-100' },
        violet:  { bg: 'bg-violet-700', light: 'bg-violet-50', text: 'text-white', border: 'border-violet-100' },
        indigo:  { bg: 'bg-indigo-700', light: 'bg-indigo-50', text: 'text-white', border: 'border-indigo-100' },
        amber:   { bg: 'bg-amber-100', light: 'bg-amber-50', text: 'text-slate-900', border: 'border-amber-200' },
        orange:  { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-white', border: 'border-orange-100' },
        teal:    { bg: 'bg-teal-600', light: 'bg-teal-50', text: 'text-white', border: 'border-teal-100' },
        rose:    { bg: 'bg-rose-600', light: 'bg-rose-50', text: 'text-white', border: 'border-rose-100' },
        gray:    { bg: 'bg-white', light: 'bg-gray-50', text: 'text-slate-900', border: 'border-slate-200' },
    };

    const TemplateThumb = ({ t: t2 }: { t: TemplateCfg }) => {
        const c = colorMap[t2.color];
        const isActive = t2.id === template;
        const twoCol = t2.style === 'sidebar' || t2.style === 'split';
        const darkHeader = t2.style === 'dark-header';
        const centered = t2.style === 'centered';
        const bordered = t2.style === 'bordered';

        // Tapered skeleton lines + section headings for a natural, well-spaced preview
        const para = (n: number, light = false) => (
            <div className="space-y-1">
                {Array.from({ length: n }).map((_, i) => (
                    <div key={i} className={`h-1 rounded ${light ? 'bg-white/20' : 'bg-slate-200'}`} style={{ width: `${94 - i * 15}%` }} />
                ))}
            </div>
        );
        const heading = (w: string) => <div className={`h-1.5 rounded mb-1.5 bg-slate-300 ${w}`} />;

        return (
            <div className={`relative bg-white rounded-xl border overflow-hidden aspect-[3/4] transition-all duration-300 ${isActive ? 'ring-2 ring-emerald-500 shadow-lg -translate-y-0.5' : 'border-slate-200 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1'}`}>
                {twoCol ? (
                    <div className="flex h-full">
                        <div className={`${c.bg} w-[38%] ${t2.style === 'split' ? 'order-2' : ''} p-3 flex flex-col gap-2.5`}>
                            {t2.style === 'sidebar' && <div className="w-8 h-8 rounded-full bg-white/25 mx-auto mb-0.5" />}
                            <div className="h-1.5 rounded bg-white/45 w-full" />
                            <div className="h-1 rounded bg-white/25 w-3/4" />
                            <div className="mt-auto">{para(4, true)}</div>
                        </div>
                        <div className="flex-1 p-3 flex flex-col gap-3">
                            <div>{heading('w-1/3')}{para(3)}</div>
                            <div>{heading('w-2/5')}{para(2)}</div>
                            <div>{heading('w-1/3')}{para(2)}</div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className={`${darkHeader ? c.bg : 'bg-white'} ${bordered ? 'border-b-2 border-slate-800' : darkHeader ? '' : 'border-b border-slate-200'} p-3`}>
                            <div className={`flex gap-2 ${centered ? 'flex-col items-center text-center' : 'items-center'}`}>
                                {centered && <div className="w-8 h-8 rounded-full bg-slate-200 mb-1" />}
                                <div className={centered ? 'w-full' : 'flex-1'}>
                                    <div className={`h-2 rounded ${darkHeader ? 'bg-white/55' : 'bg-slate-300'} ${centered ? 'w-2/3 mx-auto' : 'w-2/3'}`} />
                                    <div className={`h-1 rounded mt-1.5 ${darkHeader ? 'bg-white/30' : 'bg-slate-200'} ${centered ? 'w-1/2 mx-auto' : 'w-1/2'}`} />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 p-3 flex flex-col gap-3">
                            <div>{heading('w-1/4')}{para(3)}</div>
                            <div>{heading('w-1/3')}{para(3)}</div>
                            <div>{heading('w-1/4')}{para(2)}</div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ====== CV RENDERER (12 templates via pattern matching) ======
    const CVRender = ({ fullWidth, printMode }: { fullWidth?: boolean; printMode?: boolean }) => {
        const cls = printMode ? 'print-cv' : fullWidth ? '' : 'scale-[0.55] origin-top-left';
        const c = colorMap[tpl.color];
        const isSidebar = tpl.style === 'sidebar';
        const isCentered = tpl.style === 'centered';
        const isDarkHeader = tpl.style === 'dark-header';
        const isBordered = tpl.style === 'bordered';
        const isSplit = tpl.style === 'split';

        const headerBg = isDarkHeader ? `${c.bg} ${c.text}` : isSidebar ? '' : `bg-white ${isCentered ? 'text-center' : ''} ${isBordered ? 'border-b-2 border-slate-800' : ''}`;
        const sidebarBg = isSidebar ? `${c.bg} ${c.text}` : '';
        const skillChipBg = isDarkHeader ? `${c.light} text-slate-700` : `${c.light} text-${tpl.color}-700`;

        return (
            <div className={`bg-white ${fullWidth ? 'rounded-2xl border border-slate-200 shadow-lg overflow-hidden print:shadow-none print:border-none' : 'rounded-xl border shadow-sm overflow-hidden'} ${cls}`}
                style={!fullWidth ? { width: '182%' } : {}}>
                {isSidebar ? (
                    /* SIDEBAR LAYOUT: modern, creative, technical */
                    <div className="flex">
                        <div className={`w-[35%] ${sidebarBg} p-6 sm:p-8 print:p-6 space-y-5`}>
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-white/20 mx-auto flex items-center justify-center text-xl font-black mb-2 overflow-hidden">
                                    {form.photo_url ? (
                                        <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
                                    ) : (form.full_name || '?').charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-lg font-black">{form.full_name || 'Your Name'}</h2>
                                <p className="opacity-70 text-xs mt-1 font-semibold">{form.headline || 'Professional'}</p>
                            </div>
                            <ContactBlock form={form} color="text-white/70" />
                            <SkillsBlock skills={skillsArr} color="text-white/70" colorClass={c.light} />
                        </div>
                        <div className="w-[65%] p-6 sm:p-8 print:p-6 space-y-5 bg-white">
                            <SummaryBlock summary={form.summary} />
                            <ExpBlock experience={form.experience} />
                            <EduBlock education={form.education} />
                        </div>
                    </div>
                ) : (
                    /* VERTICAL LAYOUTS */
                    <div>
                        {(isDarkHeader || isCentered || isBordered) && (
                            <div className={`${headerBg} p-8 sm:p-10 print:p-8 ${isDarkHeader ? '' : 'border-b'}`}>
                                <div className={`flex ${isCentered ? 'flex-col items-center text-center' : 'items-start gap-5'}`}>
                                    {form.photo_url && (isDarkHeader || isCentered) && (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0">
                                            <img src={form.photo_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className={`text-3xl font-black tracking-tight ${isCentered ? 'text-slate-900' : ''}`}>{form.full_name || 'Your Name'}</h1>
                                        <p className={`font-semibold mt-1.5 text-base ${isDarkHeader ? `text-${tpl.color}-300` : 'text-slate-500'}`}>{form.headline || 'Professional Headline'}</p>
                                    </div>
                                </div>
                                <div className={`flex flex-wrap ${isCentered ? 'justify-center' : ''} gap-x-5 gap-y-1 mt-3 text-sm ${isDarkHeader ? 'opacity-70' : 'text-slate-400'}`}>
                                    {form.email && <span>{form.email}</span>}
                                    {form.phone && <span>{form.phone}</span>}
                                    {form.location && <span>{form.location}</span>}
                                    {form.linkedin && <span>{form.linkedin}</span>}
                                </div>
                            </div>
                        )}
                        {isSplit && (
                            <div className="flex">
                                <div className={`w-[40%] ${c.bg} ${c.text} p-6 sm:p-8 space-y-4`}>
                                    <h3 className="font-extrabold text-sm uppercase tracking-wider opacity-70">Contact</h3>
                                    <ContactBlock form={form} color="text-white/70" />
                                    <SkillsBlock skills={skillsArr} color="text-white/70" colorClass={c.light} />
                                </div>
                                <div className="w-[60%] p-6 sm:p-8 space-y-5">
                                    <SummaryBlock summary={form.summary} />
                                    <ExpBlock experience={form.experience} />
                                    <EduBlock education={form.education} />
                                </div>
                            </div>
                        )}
                        {!isSplit && (
                            <div className={`${isCentered ? 'max-w-2xl mx-auto' : ''} p-8 sm:p-10 print:p-8 space-y-6`}>
                                {!isBordered && skillsArr.length > 0 && <SkillsBlock skills={skillsArr} color="text-slate-700" colorClass={c.light} />}
                                <SummaryBlock summary={form.summary} />
                                <ExpBlock experience={form.experience} />
                                <EduBlock education={form.education} />
                                {isBordered && skillsArr.length > 0 && <SkillsBlock skills={skillsArr} color="text-slate-700" colorClass={c.light} />}
                            </div>
                        )}
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
                        <div><h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-lg">CV Builder</h1><p className="text-sm text-white/60">12 professional templates • 100% free to download</p></div>
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto">
                                {TEMPLATES.map(t => (
                                    <div key={t.id} className="cursor-pointer group" onClick={() => { setTemplate(t.id); setStep('details'); }}>
                                        <TemplateThumb t={t} />
                                        <div className="mt-2.5 text-center">
                                            <p className="font-extrabold text-xs text-slate-900 flex items-center justify-center gap-1.5">
                                                {t.name}
                                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Free</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Portfolio Inspiration Gallery */}
                            <div className="mt-12 pt-10 border-t border-slate-100">
                                <h3 className="text-lg font-extrabold text-slate-900 text-center mb-2">CV Portfolio Inspiration</h3>
                                <p className="text-sm text-slate-400 text-center mb-6">See what your professional CV can look like</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
                                    {[
                                        '/images/89134f788dd9c7573b50c5cc6c5a6733.webp',
                                        '/images/743202c6badfb8165ea151d49fb8565a.webp',
                                        '/images/cf1b0fe036c0dd3f55b8439534ec4e57.webp',
                                        '/images/ef7b4721a0640ccc032e889c4c9bf763.webp',
                                    ].map((src, i) => (
                                        <div key={src} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 aspect-[3/4]">
                                            <img src={src} alt={`CV Portfolio ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <span className="text-white text-xs font-bold">Template Style #{i+1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                    <div className="mt-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Photo</label>
                                        <CloudinaryUpload
                                            onUploadComplete={(url) => set('photo_url', url)}
                                            currentImage={form.photo_url}
                                            folder="cv-photos"
                                            label="Upload Photo"
                                        />
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

                        {/* Download — free, ad-supported (no payment) */}
                        <ScrollReveal delay={100}>
                            {tpl.free ? (
                                /* Free template — instant download */
                                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Star size={30} className="text-emerald-600" /></div>
                                    <h3 className="font-extrabold text-emerald-900 text-xl mb-1">Ready to Download!</h3>
                                    <p className="text-emerald-700 text-sm mb-5">This template is completely free — download or print it now.</p>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        <button onClick={handleDownload} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all shadow-sm inline-flex items-center gap-2"><Download size={15} /> Download / Print</button>
                                        <Link href="/dashboard" className="px-6 py-3 rounded-xl border-2 border-emerald-300 text-emerald-700 font-extrabold text-sm hover:bg-emerald-100 transition-all">Dashboard</Link>
                                    </div>
                                </div>
                            ) : (
                                /* Premium template — free download, supported by an ad */
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><Download size={28} className="text-emerald-600" /></div>
                                    <h3 className="font-extrabold text-slate-900 text-xl mb-1">Your CV is ready</h3>
                                    <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">Download it free below — ads keep this tool free for everyone.</p>
                                    <GoogleAd adSlot={CV_AD_SLOT} />
                                    <div className="flex flex-wrap justify-center gap-3 mt-5">
                                        <button onClick={handleDownload}
                                            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-700 transition-all shadow-sm inline-flex items-center gap-2">
                                            <Download size={15} /> Download My CV — Free
                                        </button>
                                        <Link href="/dashboard" className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-extrabold text-sm hover:bg-slate-50 transition-all">Dashboard</Link>
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

function ContactBlock({ form, color }: { form: Record<string,string>; color: string }) {
    return <div className={`space-y-1.5 text-xs ${color}`}>
        {form.email && <p className="flex items-center gap-1.5"><Mail size={11} />{form.email}</p>}
        {form.phone && <p className="flex items-center gap-1.5"><Phone size={11} />{form.phone}</p>}
        {form.location && <p className="flex items-center gap-1.5"><MapPin size={11} />{form.location}</p>}
        {form.linkedin && <p className="flex items-center gap-1.5"><Globe size={11} />{form.linkedin}</p>}
    </div>;
}

function SkillsBlock({ skills, color, colorClass }: { skills: string[]; color: string; colorClass: string }) {
    if (!skills.length) return null;
    return (
        <div>
            <h3 className={`text-xs font-extrabold uppercase tracking-widest mb-2 ${color} border-b border-white/10 pb-1.5`}>Skills</h3>
            <div className="flex flex-wrap gap-1">{skills.slice(0, 12).map(s => <span key={s} className={`px-2 py-0.5 rounded text-[10px] font-semibold ${colorClass}`}>{s}</span>)}</div>
        </div>
    );
}

function SummaryBlock({ summary }: { summary: string }) {
    if (!summary) return null;
    return <div><h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Summary</h3><p className="text-slate-700 text-sm leading-relaxed">{summary}</p></div>;
}

function ExpBlock({ experience }: { experience: string }) {
    if (!experience) return null;
    return <div><h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Experience</h3><p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{experience}</p></div>;
}

function EduBlock({ education }: { education: string }) {
    if (!education) return null;
    return <div><h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Education</h3><p className="text-slate-700 text-sm leading-relaxed">{education}</p></div>;
}
