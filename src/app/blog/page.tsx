import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Calendar, User, ArrowRight, BookOpen, ChevronDown, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Job Openings Kenya | Stories, Insights & Career Tips',
    description: 'Read success stories from Kenyan job seekers, get career tips, and stay updated with the latest opportunities and community news.',
    openGraph: {
        title: 'Job Openings Kenya Blog',
        description: 'Read success stories from Kenyan job seekers and get career tips.',
        images: ['/images/advance-your-career.png'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Job Openings Kenya Blog',
        description: 'Read success stories from Kenyan job seekers and get career tips.',
        images: ['/images/advance-your-career.png'],
    },
};

export const revalidate = 3600;

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    featured_image: string | null;
    category: string;
    created_at: string;
    author_name: string;
    status: string;
}

interface FAQItem {
    q: string;
    a: string;
}

const faqs: FAQItem[] = [
    {
        q: 'How do I find the latest job openings in Kenya?',
        a: 'Visit our homepage and browse the latest verified listings. You can filter by job type, location, and even set up email alerts to get notified when matching jobs are posted.',
    },
    {
        q: 'Are the job listings on Job Openings Kenya verified?',
        a: 'Yes. Every listing is reviewed before publication to ensure it is legitimate, scam-free, and genuinely available. We partner with trusted employers across Kenya.',
    },
    {
        q: 'Can I apply for jobs directly through the platform?',
        a: 'Absolutely. Each job listing has an apply button that redirects you to the employer\'s application portal or lets you apply via email. We also offer tools to generate cover letters and prepare for interviews.',
    },
    {
        q: 'How do I track my job applications?',
        a: 'Create a free account and use our Application Tracker dashboard. You can log every job you apply to, set status updates (applied, interview, offered), and add personal notes.',
    },
    {
        q: 'Do you offer training and internship opportunities?',
        a: 'Yes. In addition to full-time jobs, we list training programs, internships, and attachments across various sectors. Use the category filter to find them.',
    },
    {
        q: 'How can employers post jobs on the platform?',
        a: 'Employers can visit the Employer Portal to submit job postings. Our team reviews and approves submissions within 24 hours. Premium posting options are also available for wider reach.',
    },
];

export default async function BlogPage() {
    const supabase = await createClient();

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.warn('Error fetching posts:', error.message || error);
    }

    const allPosts: BlogPost[] = posts || [];

    // Compute categories with counts
    const categoryMap = new Map<string, number>();
    allPosts.forEach((p) => {
        categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    });
    const categories = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mb-3">
                        <Link href="/" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                            <Home size={12} /> Home
                        </Link>
                        <span>/</span>
                        <span className="text-emerald-600">Blog</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Blog & Stories</h1>
                    <p className="text-sm text-gray-500 mt-2 max-w-xl">
                        Career tips, success stories, and insights to help you navigate the Kenyan job market.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Blog Posts */}
                    <div className="lg:col-span-2">
                        {!allPosts.length ? (
                            <div className="text-center py-20 border border-gray-100 rounded-2xl bg-gray-50/50">
                                <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-gray-900">No Posts Yet</h3>
                                <p className="text-sm text-gray-500 mt-1">Check back soon for inspiring stories and insights.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {allPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                                        <article className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all bg-white">
                                            {/* Thumbnail */}
                                            <div className="relative sm:w-52 sm:h-40 w-full h-48 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                                <Image
                                                    src={post.featured_image || '/images/advance-your-career.png'}
                                                    alt={post.title}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 208px"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                                                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                                                        {post.category}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={11} />
                                                        {formatDate(post.created_at)}
                                                    </span>
                                                </div>

                                                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                    {post.title}
                                                </h2>

                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                                    {post.excerpt}
                                                </p>

                                                <div className="mt-3 flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                        <User size={12} className="text-gray-400" />
                                                        {post.author_name}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:gap-1.5 transition-all">
                                                        Read More
                                                        <ArrowRight size={12} />
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar */}
                    <aside className="space-y-8">
                        {/* Categories */}
                        <div className="border border-gray-100 rounded-2xl p-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Categories</h3>
                            {!categories.length ? (
                                <p className="text-sm text-gray-400">No categories yet.</p>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {categories.map((cat) => (
                                        <div key={cat.name} className="flex items-center justify-between py-2.5">
                                            <span className="text-sm font-medium text-gray-600">{cat.name}</span>
                                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Newsletter Mini */}
                        <div className="border border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-green-50/50">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Stay Updated</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Get the latest career tips and job insights delivered to your inbox.
                            </p>
                            <form
                                action="/api/newsletter/subscribe"
                                method="POST"
                                className="space-y-2"
                            >
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="your@email.com"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 bg-white"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Frequently Asked Questions</h2>
                    <p className="text-sm text-gray-500 mb-8 max-w-lg">
                        Got questions about using Job Openings Kenya? Here are answers to the most common ones.
                    </p>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <details
                                key={i}
                                className="group border border-gray-100 rounded-xl overflow-hidden open:shadow-sm transition-shadow"
                            >
                                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none bg-white hover:bg-gray-50 transition-colors select-none">
                                    <span className="text-sm sm:text-base font-bold text-slate-800 pr-4">{faq.q}</span>
                                    <ChevronDown
                                        size={18}
                                        className="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180"
                                    />
                                </summary>
                                <div className="px-4 sm:px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
