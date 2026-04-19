import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, User, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - 1000Jobs | Stories, Insights & Community Updates',
    description: 'Read success stories from African youth, get career tips, and stay updated with the latest opportunities and community news from 1000Jobs.',
    openGraph: {
        title: '1000Jobs Blog - Stories, Insights & Community Updates',
        description: 'Read success stories from African youth, get career tips, and stay updated with the latest opportunities.',
        images: ['/images/img4.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '1000Jobs Blog - Stories & Insights',
        description: 'Read success stories from African youth and get career tips.',
        images: ['/images/img4.jpg'],
    },
};

export const revalidate = 3600; // Revalidate every hour

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

    // Get featured post (most recent)
    const featuredPost = posts?.[0];
    const regularPosts = posts?.slice(1) || [];

    // Category colors
    const categoryColors: { [key: string]: { bg: string; text: string; border: string } } = {
        'Success Stories': { bg: 'bg-[#4CAF50]', text: 'text-[#4CAF50]', border: 'border-[#4CAF50]' },
        'Career Tips': { bg: 'bg-[#4CAF50]', text: 'text-[#4CAF50]', border: 'border-[#4CAF50]' },
        'Opportunities': { bg: 'bg-[#1976D2]', text: 'text-[#1976D2]', border: 'border-[#1976D2]' },
        'News': { bg: 'bg-[#1565C0]', text: 'text-[#1565C0]', border: 'border-[#1565C0]' },
    };

    const getCategoryColor = (category: string) => {
        return categoryColors[category] || { bg: 'bg-[#1976D2]', text: 'text-[#1976D2]', border: 'border-[#1976D2]' };
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative min-h-[400px] bg-gradient-to-br from-gray-900 via-[#1565C0] to-[#1976D2] text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[#4CAF50] rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4CAF50] rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20 lg:py-28">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-[#4CAF50] text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
                            <BookOpen size={18} />
                            <span>1000Jobs Blog</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Stories, Insights &
                            <span className="block text-[#4CAF50]">Community Updates</span>
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                            Read success stories from African youth, get career tips, and stay updated with the latest opportunities.
                        </p>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                    </svg>
                </div>
            </div>

            {/* Featured Post */}
            {featuredPost && (
                <div className="py-12 bg-white">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="text-[#1976D2]" size={24} />
                            <h2 className="text-2xl font-bold text-gray-900">Featured Story</h2>
                        </div>
                        
                        <Link href={`/blog/${featuredPost.slug}`}>
                            <div className="grid lg:grid-cols-2 gap-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 group border-2 border-gray-100">
                                <div className="relative h-96 lg:h-auto overflow-hidden">
                                    <img
                                        src={featuredPost.featured_image || '/images/img4.jpg'}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    {/* 1000Jobs Watermark - Bright & Creative */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="relative">
                                            <span className="text-white font-black text-7xl rotate-[-15deg] uppercase tracking-[0.3em] opacity-30 drop-shadow-[0_0_25px_rgba(243,156,18,0.5)]" style={{ textShadow: '0 0 35px rgba(243,156,18,0.6), 0 0 70px rgba(196,69,54,0.4)' }}>
                                                1000Jobs
                                            </span>
                                            <div className="absolute -top-3 -left-3 w-16 h-0.5 bg-[#4CAF50] opacity-50 rotate-[-15deg]"></div>
                                            <div className="absolute -bottom-3 -right-3 w-16 h-0.5 bg-[#1976D2] opacity-50 rotate-[-15deg]"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8 lg:p-12 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`${getCategoryColor(featuredPost.category).bg} text-white px-4 py-1.5 rounded-full text-sm font-semibold`}>
                                            {featuredPost.category}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#1976D2] transition-colors">
                                        {featuredPost.title}
                                    </h3>
                                    
                                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                        {featuredPost.excerpt}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <User size={18} />
                                            <span className="font-medium">{featuredPost.author_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#1976D2] font-semibold group-hover:gap-3 transition-all">
                                            <span>Read Full Story</span>
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* All Posts Grid */}
            <div className="py-12 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
                    
                    {!posts || posts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                            <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h3>
                            <p className="text-gray-500">Check back soon for inspiring stories and insights!</p>
                        </div>
                    ) : regularPosts.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl">
                            <p className="text-gray-500">More articles coming soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {regularPosts.map((post) => {
                                const colors = getCategoryColor(post.category);
                                return (
                                    <Link key={post.id} href={`/blog/${post.slug}`}>
                                        <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border-2 ${colors.border} border-opacity-0 hover:border-opacity-100 hover:-translate-y-2`}>
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={post.featured_image || '/images/img5.jpg'}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                {/* 1000Jobs Watermark - Bright & Creative */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="relative">
                                                        <span className="text-white font-black text-5xl rotate-[-15deg] uppercase tracking-[0.3em] opacity-30 drop-shadow-[0_0_20px_rgba(243,156,18,0.5)]" style={{ textShadow: '0 0 30px rgba(243,156,18,0.6), 0 0 60px rgba(196,69,54,0.4)' }}>
                                                            1000Jobs
                                                        </span>
                                                        <div className="absolute -top-2 -left-2 w-12 h-0.5 bg-[#4CAF50] opacity-50 rotate-[-15deg]"></div>
                                                        <div className="absolute -bottom-2 -right-2 w-12 h-0.5 bg-[#1976D2] opacity-50 rotate-[-15deg]"></div>
                                                    </div>
                                                </div>
                                                {/* Category Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className={`${colors.bg} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                                                        {post.category}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                                    <Calendar size={14} />
                                                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                
                                                <h3 className={`text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:${colors.text} transition-colors`}>
                                                    {post.title}
                                                </h3>
                                                
                                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                    {post.excerpt}
                                                </p>
                                                
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <User size={16} />
                                                        <span>{post.author_name}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${colors.text} font-semibold text-sm group-hover:gap-2 transition-all`}>
                                                        <span>Read</span>
                                                        <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-4xl font-bold mb-6">Want to Share Your Story?</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Have an inspiring journey or valuable insights to share with the 1000Jobs community? We'd love to feature your story!
                    </p>
                    <a 
                        href="mailto:stories@1000jobs.org" 
                        className="btn bg-[#4CAF50] text-white hover:bg-[#e08d0a] btn-lg border-none px-10"
                    >
                        Submit Your Story
                    </a>
                </div>
            </div>
        </div>
    );
}
