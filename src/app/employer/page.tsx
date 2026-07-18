import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { CheckCircle, Building2, Users, ArrowRight, FileText, Eye, Zap, Shield, Clock, Sparkles } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata: Metadata = {
    title: 'Post a Job — Hire Top Talent | Job Openings Kenya',
    description: 'Post your job openings on Job Openings Kenya and reach thousands of qualified Kenyan job seekers. Fast, simple, and reviewed by our team.',
};

const steps = [
    { number: '1', icon: Building2, title: 'Create Account', desc: 'Sign up as an employer in under 2 minutes.' },
    { number: '2', icon: FileText, title: 'Post Your Job', desc: 'Fill in the role details, requirements, and how to apply.' },
    { number: '3', icon: Eye, title: 'We Review', desc: 'Our team verifies within 24 hours for quality.' },
    { number: '4', icon: Zap, title: 'Goes Live', desc: 'Your listing reaches thousands of active job seekers.' },
];

const benefits = [
    { icon: Users, title: '10,000+ Job Seekers', desc: 'Active, motivated Kenyan talent browsing daily.' },
    { icon: Clock, title: '24hr Review', desc: 'Fast turnaround — your job goes live quickly.' },
    { icon: Shield, title: 'Clear Process', desc: 'Listings show practical application details.' },
    { icon: Zap, title: 'Simple Process', desc: 'One form, submit, done. No hassle.' },
];

export default function EmployerLandingPage() {
    return (
        <div className="bg-white">
            {/* ═══════ HERO ═══════ */}
            <section className="relative overflow-hidden min-h-[500px] sm:min-h-[560px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left: Content */}
                        <ScrollReveal>
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white mb-6">
                                    <Building2 size={14} /> For Employers
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black leading-[1.06] tracking-tight drop-shadow-lg">
                                    Hire the best{' '}
                                    <span className="text-emerald-300">talent</span> in Kenya
                                </h1>
                                <p className="mt-4 text-lg text-white/75 max-w-lg leading-relaxed">
                                    Post your job openings and connect with thousands of qualified, motivated job seekers. Fast, simple, and reviewed by our team.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                    <Link href="/login?role=employer"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-emerald-700 px-6 py-3.5 text-sm font-extrabold hover:bg-gray-100 transition-all shadow-xl">
                                        <Sparkles size={17} /> Create Employer Account
                                    </Link>
                                    <Link href="/login?redirect=/employer/dashboard"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 text-white px-6 py-3.5 text-sm font-extrabold hover:bg-white/10 transition-all">
                                        Sign In <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Right: Preview card */}
                        <ScrollReveal direction="right" variant="scale">
                            <div className="hidden lg:block relative">
                                <div className="absolute inset-0 bg-emerald-400/20 rounded-3xl blur-3xl scale-75" />
                                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm">J</div>
                                        <div>
                                            <p className="text-sm font-extrabold text-white">Senior Developer</p>
                                            <p className="text-xs text-white/60">Your Company Name</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs text-white/70">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">Full-time</span>
                                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold">Nairobi</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full w-3/4" />
                                        <div className="h-2 bg-white/10 rounded-full w-1/2" />
                                        <div className="h-2 bg-white/10 rounded-full w-5/6" />
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] text-white/50">Live in 24 hours</span>
                                        <span className="text-[10px] font-bold text-emerald-300">✓ Verified</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ═══════ BENEFITS BAR ═══════ */}
            <section className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-50">
                        {benefits.map(({ icon: Icon, title, desc }, i) => (
                            <ScrollReveal key={title} delay={100 + i * 80} variant="fade">
                                <div className="py-8 px-4 sm:px-6 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                                        <Icon size={20} className="text-emerald-600" />
                                    </div>
                                    <p className="font-extrabold text-sm text-slate-900">{title}</p>
                                    <p className="text-xs text-slate-400 mt-1">{desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ HOW IT WORKS ═══════ */}
            <section className="py-20 lg:py-28 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">How it works</h2>
                            <p className="mt-3 text-slate-500 max-w-lg mx-auto">Four simple steps to reach thousands of job seekers</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <ScrollReveal key={step.number} delay={150 + i * 100} variant="scale">
                                <div className="relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm mb-4">
                                        {step.number}
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                                        <step.icon size={20} className="text-emerald-600" />
                                    </div>
                                    <h3 className="font-extrabold text-slate-900 mb-1">{step.title}</h3>
                                    <p className="text-sm text-slate-500">{step.desc}</p>
                                    {/* Connector arrow */}
                                    {i < steps.length - 1 && (
                                        <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                                            <ArrowRight size={20} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ WHY POST HERE ═══════ */}
            <section className="py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-14 items-center">
                        <ScrollReveal>
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6">
                                    Why employers choose{' '}
                                    <span className="text-emerald-600">Job Openings Kenya</span>
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        'Reach thousands of active Kenyan job seekers daily',
                                        'Jobs reviewed & published within 24 hours',
                                        'Listings appear on homepage, search, and category pages',
                                        'Access to talent directory to proactively find candidates',
                                        'Simple dashboard to manage all your postings',
                                        'No hidden fees — transparent and straightforward',
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="text-slate-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal direction="right" variant="scale">
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 sm:p-10 text-white shadow-2xl shadow-emerald-500/20">
                                <Users size={40} className="mb-5 opacity-80" />
                                <h3 className="text-2xl font-extrabold mb-3">Ready to find your next hire?</h3>
                                <p className="text-white/80 mb-8 leading-relaxed">
                                    Join hundreds of Kenyan companies already posting on our platform. Create your employer account today.
                                </p>
                                <Link href="/login?role=employer"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 hover:bg-gray-100 w-full py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg">
                                    Get Started <ArrowRight size={17} />
                                </Link>
                                <p className="text-center text-white/60 text-xs mt-4">
                                    Already have an account?{' '}
                                    <Link href="/login?redirect=/employer/dashboard" className="text-white underline font-semibold">Sign in</Link>
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ═══════ BOTTOM CTA ═══════ */}
            <section className="py-16 bg-slate-900">
                <ScrollReveal>
                    <div className="max-w-2xl mx-auto px-4 text-center">
                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Start hiring today</h2>
                        <p className="text-slate-400 mb-8">Post your first job and reach Kenya&apos;s best talent.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link href="/login?role=employer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 text-sm font-extrabold transition-all">
                                <Sparkles size={17} /> Create Account
                            </Link>
                            <Link href="/employer/post"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 px-6 py-3.5 text-sm font-extrabold transition-all">
                                Post a Job <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
