import Link from 'next/link';
import Image from 'next/image';
import { Compass, Globe, Quote, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Discover More | Job Openings Kenya',
    description: 'Explore remote jobs, grants, success stories, and our latest articles.',
};

export const revalidate = 3600;

export default async function DiscoverPage() {
    const supabase = await createClient();

    // Fetch approved testimonials
    const { data: testimonials } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

    // Fetch latest blog posts
    const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, created_at, featured_image')
        .order('created_at', { ascending: false })
        .limit(3);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Hero */}
            <div className="bg-[#4A9900] text-white py-16">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <Compass className="mx-auto mb-4 text-blue-200" size={64} />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover More</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Explore exclusive remote opportunities, inspiring success stories, and our latest career advice.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 -mt-8 relative z-10">
                {/* Categories Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <Link href="/?type=Job&q=Remote" className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-2 transition-transform group border border-gray-100">
                        <div className="w-14 h-14 bg-blue-50 text-[#5CB800] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Globe size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Remote Jobs</h3>
                        <p className="text-gray-600 text-sm mb-4">Work from anywhere. Explore verified remote opportunities across the globe.</p>
                        <span className="text-[#5CB800] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Browse Remote <ArrowRight size={16} />
                        </span>
                    </Link>

                    <Link href="/?type=Training" className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-2 transition-transform group border border-gray-100">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Training</h3>
                        <p className="text-gray-600 text-sm mb-4">Professional certifications and courses to boost your career and skills.</p>
                        <span className="text-purple-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Browse Training <ArrowRight size={16} />
                        </span>
                    </Link>

                    <Link href="#success-stories" className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-2 transition-transform group border border-gray-100">
                        <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Success Stories</h3>
                        <p className="text-gray-600 text-sm mb-4">Read inspiring stories from youth who landed their dream opportunities.</p>
                        <span className="text-yellow-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read Stories <ArrowRight size={16} />
                        </span>
                    </Link>

                    <Link href="#blog" className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-2 transition-transform group border border-gray-100">
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileText size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Articles & Advice</h3>
                        <p className="text-gray-600 text-sm mb-4">Career tips, interview guides, and industry news to help you succeed.</p>
                        <span className="text-purple-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read Articles <ArrowRight size={16} />
                        </span>
                    </Link>
                </div>

                {/* Success Stories Section */}
                <div id="success-stories" className="mb-20 scroll-mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="text-yellow-500" /> Success Stories
                            </h2>
                            <p className="text-gray-600 mt-2">Real stories from the Job Openings Kenya community.</p>
                        </div>
                        <Link href="/dashboard/feedback" className="inline-flex items-center justify-center bg-[#5CB800] hover:bg-[#4A9900] text-white hidden sm:flex gap-2 shadow-md px-4 py-2 rounded-lg font-medium">
                            <Quote size={18} /> Share Your Story
                        </Link>
                    </div>

                    {(!testimonials || testimonials.length === 0) ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Quote className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Stories Yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">Be the first to share how Job Openings Kenya helped you land an opportunity!</p>
                            <Link href="/dashboard/feedback" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5CB800] hover:bg-[#4A9900] text-white font-semibold text-sm shadow-md transition-colors">
                                <Quote size={18} /> Share Your Story
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map(t => (
                                <div key={t.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col hover:-translate-y-1 transition-transform">
                                    <div className="flex items-center gap-4 mb-6">
                                        {t.user_photo_url ? (
                                            <Image src={t.user_photo_url} alt={t.user_name} width={64} height={64} unoptimized className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-white" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5CB800] to-[#4A9900] text-white flex items-center justify-center font-bold text-2xl shadow-sm border-2 border-white">
                                                {t.user_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">{t.user_name}</h4>
                                            <p className="text-xs text-[#5CB800] font-bold uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                                Won: {t.opportunity_won}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative flex-1">
                                        <Quote size={40} className="absolute -top-2 -left-2 text-gray-100 -z-10" />
                                        <p className="text-gray-700 leading-relaxed italic relative z-10 text-sm">
                                            &ldquo;{t.story}&rdquo;
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Articles & Blogs */}
                <div id="blog" className="scroll-mt-24">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
                            <p className="text-gray-600 mt-2">Career advice, interview tips, and news.</p>
                        </div>
                        <Link href="/blog" className="text-[#5CB800] font-semibold hover:underline hidden sm:block">
                            View All Articles &rarr;
                        </Link>
                    </div>

                    {(!blogs || blogs.length === 0) ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                            <p className="text-gray-500">Check back later for fresh articles.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {blogs.map(post => (
                                <Link href={`/blog/${post.slug}`} key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group flex flex-col hover:-translate-y-2 transition-transform">
                                    <div className="h-48 overflow-hidden bg-gray-100 relative">
                                        {post.featured_image ? (
                                            <Image src={post.featured_image} alt={post.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                <FileText size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm">
                                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5CB800] transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                                            {post.excerpt}
                                        </p>
                                        <span className="text-[#5CB800] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-gray-50">
                                            Read More <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="mt-8 text-center sm:hidden">
                        <Link href="/blog" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 w-full py-2.5 rounded-lg font-medium hover:bg-gray-50">
                            View All Articles
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
