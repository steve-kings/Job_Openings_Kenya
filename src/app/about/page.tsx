import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import PartnersSection from '@/components/PartnersSection';
import ScrollReveal from '@/components/ScrollReveal';
import HeroSlider from '@/components/HeroSlider';
import { createClient } from '@/lib/supabase/server';
import { Lightbulb, Users, Handshake, Trophy, Rocket, ShieldCheck, BookOpen, Search, ChevronDown, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us | Job Openings Kenya',
    alternates: { canonical: '/about' },
    description: 'Learn how Job Openings Kenya publishes current, Kenya-focused opportunities using automated quality checks, editorial review, and source transparency.',
    openGraph: { title: 'About Job Openings Kenya', description: 'A Kenya-focused portal for current job openings and career resources.', images: ['/images/right-talent-desktop.png'], type: 'website' },
    twitter: { card: 'summary_large_image', title: 'About Job Openings Kenya', description: 'A Kenya-focused portal for current job openings and career resources.', images: ['/images/right-talent-desktop.png'] },
};

export const revalidate = 3600;

const goals = [
    { icon: Lightbulb, title: 'Inform', sub: 'Screened listings daily' },
    { icon: Users, title: 'Connect', sub: 'Seekers with employers' },
    { icon: Handshake, title: 'Partner', sub: 'With top organisations' },
    { icon: Trophy, title: 'Empower', sub: 'Careers across Kenya' },
    { icon: Rocket, title: 'Transform', sub: 'Lives through opportunity' },
];

const features = [
    { title: 'Listing Quality Checks', desc: 'Employer submissions may receive editorial review, while approved external feeds pass automated Kenya, freshness, content, and application-link checks.', icon: ShieldCheck },
    { title: 'Career Resources', desc: 'Access CV templates, interview tips, and expert articles to help you land your dream role.', icon: BookOpen },
    { title: 'Advanced Search', desc: 'Filter jobs by type, location, and salary range to find opportunities that match your skills.', icon: Search },
];

const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up and set up your job seeker profile to get personalized recommendations.' },
    { num: '02', title: 'Browse & Apply', desc: 'Explore current listings, check the employer or external source, save favourites, and apply through the listed channel.' },
    { num: '03', title: 'Track Applications', desc: 'Use our built-in tracker to monitor your applications from submission to offer.' },
    { num: '04', title: 'Get Hired', desc: 'Prepare with AI tools and land your next opportunity with confidence.' },
];

const sectors = ['Technology & IT','Finance & Banking','Healthcare & Medicine','Education & Training','Engineering & Construction','Hospitality & Tourism','Agriculture & Farming','Marketing & Media'];

const faqs = [
    { q: 'Is Job Openings Kenya free to use?', a: 'Yes, absolutely. Browsing jobs, applying, and using our career tools are completely free for all job seekers.' },
    { q: 'How do you screen job listings?', a: 'Employer-submitted listings may be reviewed editorially. Approved external feeds use automated checks for Kenya relevance, freshness, useful content, and valid application links; these listings are labelled and link to their source. No screening can guarantee an employer or job, so always verify before applying.' },
    { q: 'Can employers post jobs for free?', a: 'Yes, employers can submit job postings at no cost. Premium placement options are available for wider visibility.' },
    { q: 'Do you offer training programs?', a: 'We list training, internships, and attachment opportunities alongside full-time roles. Filter by "Training" to find them and confirm the provider details before enrolling.' },
    { q: 'How can I track my applications?', a: 'Log in and use the Application Tracker dashboard to save job statuses, notes, and deadlines all in one place.' },
];

export default async function About() {
    const supabase = await createClient();
    const [{ count: userCount }, { count: opportunityCount }, { count: partnerCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
    ]);

    const stats = [
        { value: userCount || 0, label: 'Job Seekers', sub: 'Registered across Kenya' },
        { value: opportunityCount || 0, label: 'Opportunities', sub: 'Kenya-focused listings' },
        { value: partnerCount || 0, label: 'Partners', sub: 'Employers & organisations' },
    ];

    return (
        <div className="bg-white">
            {/* Hero with slider background */}
            <section className="relative overflow-hidden min-h-[360px] sm:min-h-[420px] flex items-center text-white">
                <div className="absolute inset-0">
                    <HeroSlider />
                </div>
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
                    <ScrollReveal>
                        <div className="max-w-2xl">
                            <span className="inline-block text-[11px] font-black uppercase tracking-widest text-emerald-300 mb-4">About Us</span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6">Who We Are</h1>
                            <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl">Job Openings Kenya connects talent with current, Kenya-focused opportunities and clear application sources.</p>
                        </div>
                    </ScrollReveal>
                </div>
                <svg viewBox="0 0 1440 60" fill="none" className="absolute bottom-0 w-full z-10"><path d="M0 60L48 52C96 44 192 28 288 22C384 16 480 20 576 26C672 32 768 40 864 42C960 44 1056 40 1152 36C1248 32 1344 28 1392 26L1440 24V60H0Z" fill="white" /></svg>
            </section>

            {/* Mission */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <ScrollReveal>
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-6">Connecting Talent with Opportunity in Kenya</h2>
                                <p className="text-gray-600 leading-relaxed mb-6">We started as a simple initiative to share useful job listings and have grown into a comprehensive platform serving job seekers and employers nationwide.</p>
                                <p className="text-gray-600 leading-relaxed mb-8">Our mission is to reduce barriers to employment by bringing together current job openings, professional training, and practical career resources for Kenyan youth.</p>
                                <div className="flex flex-wrap gap-3">
                                    <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors">Browse Jobs <ArrowRight size={14} /></Link>
                                    <Link href="/employer" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:border-emerald-500 hover:text-emerald-700 transition-colors">For Employers</Link>
                                </div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={150} direction="right">
                            <div className="rounded-2xl overflow-hidden shadow-xl bg-gray-100 relative h-80 lg:h-96"><Image src="/images/right-talent-desktop.png" alt="Team" fill className="object-cover" /></div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Dark Features */}
            <section className="bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal>
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">Reliable, Innovative Career Solutions</h2>
                                <p className="text-gray-300 leading-relaxed mb-8">We combine automated listing checks with editorial review where appropriate. External listings are identified and link to their source, while our career tools help you prepare and track applications.</p>
                                <div className="space-y-5">
                                    {features.map((f) => (
                                        <div key={f.title} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0"><f.icon size={18} className="text-emerald-400" /></div>
                                            <div><h4 className="font-bold text-sm mb-0.5">{f.title}</h4><p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={150} direction="right">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4"><div className="rounded-xl overflow-hidden h-48 relative"><Image src="/images/seeker-hero.png" alt="" fill className="object-cover" /></div><div className="rounded-xl overflow-hidden h-32 relative"><Image src="/images/cover-378x198.png" alt="" fill className="object-cover" /></div></div>
                                <div className="space-y-4 pt-8"><div className="rounded-xl overflow-hidden h-32 relative"><Image src="/images/14-1-378x198.png" alt="" fill className="object-cover" /></div><div className="rounded-xl overflow-hidden h-48 relative"><Image src="/images/1-2-378x198.png" alt="" fill className="object-cover" /></div></div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Goals */}
            <section className="py-16 lg:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal><div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Our Goals</h2><p className="text-gray-500 max-w-lg mx-auto">What drives us every day to improve the platform and serve our community.</p></div></ScrollReveal>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                        {goals.map((g, i) => (
                            <ScrollReveal key={g.title} delay={i * 100}>
                                <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center"><g.icon size={24} className="text-emerald-600" /></div>
                                    <h3 className="font-bold text-slate-900 mb-1">{g.title}</h3><p className="text-xs text-gray-500">{g.sub}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal><div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">How It Works</h2><p className="text-gray-500 max-w-lg mx-auto">Your journey from job search to employment in four simple steps.</p></div></ScrollReveal>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s, i) => (
                            <ScrollReveal key={s.num} delay={i * 120}>
                                <div className="relative p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all h-full">
                                    <span className="text-4xl font-black text-emerald-100 absolute top-4 right-4">{s.num}</span>
                                    <div className="relative"><h3 className="font-bold text-slate-900 mb-2">{s.title}</h3><p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p></div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-emerald-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
                        {stats.map((s, i) => (
                            <ScrollReveal key={s.label} delay={i * 100}>
                                <div>
                                    <div className="text-5xl font-black mb-1">{s.value.toLocaleString()}</div>
                                    <div className="text-lg font-bold">{s.label}</div>
                                    <div className="text-sm text-white/80">{s.sub}</div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sectors */}
            <section className="py-16 lg:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal><div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Industries We Serve</h2><p className="text-gray-500 max-w-lg mx-auto">We cover opportunities across all major sectors in the Kenyan economy.</p></div></ScrollReveal>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sectors.map((sector, i) => (
                            <ScrollReveal key={sector} delay={i * 50}>
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="text-sm font-semibold text-slate-700">{sector}</span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 lg:py-20 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ScrollReveal><div className="text-center mb-10"><h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Frequently Asked Questions</h2><p className="text-gray-500 max-w-lg mx-auto">Common questions about using Job Openings Kenya.</p></div></ScrollReveal>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <ScrollReveal key={i} delay={i * 60}>
                                <details className="group border border-gray-100 rounded-xl overflow-hidden open:shadow-sm transition-shadow bg-white">
                                    <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors select-none">
                                        <span className="text-sm sm:text-base font-bold text-slate-800 pr-4">{faq.q}</span>
                                        <ChevronDown size={18} className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                                    </summary>
                                    <div className="px-4 sm:px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">{faq.a}</div>
                                </details>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <ScrollReveal>
                        <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Ready to Find Your Next Opportunity?</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Browse the latest Kenya-focused job openings or partner with us to reach qualified candidates.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors">Browse Job Openings <ArrowRight size={14} /></Link>
                            <a href="mailto:info@jobopenings.co.ke" className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white/20 text-white rounded-xl text-sm font-bold hover:bg-white hover:text-slate-900 transition-colors">Partner With Us</a>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <PartnersSection />
        </div>
    );
}
