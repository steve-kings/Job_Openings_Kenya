import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Lightbulb, GraduationCap, Target, MessageCircle, ArrowRight, BookOpen, PenTool } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Career Resources — CV Tips, Interview Prep & More | Job Openings Kenya',
    description: 'Free career resources for Kenyan youth. CV writing guides, interview preparation, career path guides, and professional development tips.',
};

const resources = [
    {
        title: 'Kenya Job Application Guide',
        description: 'A practical, step-by-step guide to vacancy checks, CV tailoring, cover letters, interview preparation, follow-up, and job-scam safety.',
        icon: FileText,
        href: '/career-guides',
        color: 'emerald',
        articles: [
            { title: 'Tailor an ATS-friendly CV', href: '/career-guides#cv' },
            { title: 'Recognize job scam warning signs', href: '/career-guides#safety' },
            { title: 'Prepare for interviews and follow up', href: '/career-guides#interview' },
        ],
    },
    {
        title: 'CV Builder',
        description: 'Create a professional ATS-friendly CV in minutes. AI-powered, beautiful templates, KES 50 only.',
        icon: PenTool,
        href: '/resources/cv-builder',
        color: 'emerald',
        articles: [
            { title: 'Build Your Professional CV Now', href: '/resources/cv-builder' },
            { title: 'AI-Powered Cover Letter Generator', href: '/resources/cv-builder' },
            { title: 'Download Free CV Templates', href: '/resources/cv-builder' },
        ],
    },
    {
        title: 'Interview Preparation',
        description: 'Ace your next job interview with our comprehensive guides, common questions, and practice tips.',
        icon: Lightbulb,
        href: '/blog',
        color: 'amber',
        articles: [
            { title: 'Browse Career Advice Articles', href: '/blog' },
            { title: 'Join Our WhatsApp for Daily Tips', href: 'https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C' },
            { title: 'Get AI Interview Prep on Any Job', href: '/' },
        ],
    },
    {
        title: 'Skills Development',
        description: 'Discover the most in-demand skills in Kenya and free resources to build them.',
        icon: GraduationCap,
        href: '/blog',
        color: 'blue',
        articles: [
            { title: 'Read Career Growth Articles', href: '/blog' },
            { title: 'Free Online Courses for Career Growth', href: 'https://www.kingslearn.co.ke/' },
            { title: 'Browse Training Opportunities', href: '/?type=Training' },
        ],
    },
    {
        title: 'Career Success Stories',
        description: 'Real stories from Kenyan youth who landed their dream jobs through our platform.',
        icon: Target,
        href: '/blog',
        color: 'violet',
        articles: [
            { title: 'Read Success Stories on Our Blog', href: '/blog' },
            { title: 'Join 5,000+ Youth Finding Jobs', href: 'https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C' },
            { title: 'Browse Latest Job Openings', href: '/' },
        ],
    },
];

export default function ResourcesPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur-sm mb-5">
                            <BookOpen size={14} />
                            Free Career Resources
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                            Everything You Need to Land Your Next Job
                        </h1>
                        <p className="mt-3 text-lg text-white/75 max-w-2xl">
                            Free guides, templates, and expert advice to help you build a standout CV, ace interviews, and advance your career.
                        </p>
                    </div>
                </div>
            </section>

            {/* Resources Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid sm:grid-cols-2 gap-6">
                    {resources.map((resource) => {
                        const colorMap: Record<string, string> = {
                            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                            amber: 'bg-amber-50 text-amber-600 border-amber-200',
                            blue: 'bg-blue-50 text-blue-600 border-blue-200',
                            violet: 'bg-violet-50 text-violet-600 border-violet-200',
                        };
                        const Icon = resource.icon;
                        return (
                            <div key={resource.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6">
                                <div className={`w-12 h-12 rounded-xl ${colorMap[resource.color].split(' ')[0]} flex items-center justify-center mb-4`}>
                                    <Icon size={24} className={colorMap[resource.color].split(' ')[1]} />
                                </div>
                                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{resource.title}</h3>
                                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{resource.description}</p>
                                <ul className="space-y-2.5 mb-5">
                                    {resource.articles.map((article) => (
                                        <li key={article.title}>
                                            <Link
                                                href={article.href}
                                                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-700 transition-colors group"
                                                {...(article.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                            >
                                                <ArrowRight size={13} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                                {article.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={resource.href}
                                    className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                    {...(resource.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                >
                                    Explore resources <ArrowRight size={14} />
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Section */}
                <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 sm:p-10 text-white text-center">
                    <h2 className="text-2xl sm:text-3xl font-extrabold">Need Personalized Help?</h2>
                    <p className="mt-2 text-white/80 max-w-lg mx-auto">
                        Our AI assistant can generate a tailored cover letter, provide interview prep, or help improve your CV — all for free.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/dashboard/profile"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <PenTool size={16} />
                            Build Your Profile
                        </Link>
                        <a
                            href="https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white hover:bg-green-600 transition-all shadow-sm"
                        >
                            <MessageCircle size={16} />
                            Join WhatsApp for Job Alerts
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
