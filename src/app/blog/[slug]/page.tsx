'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Share2, Lock, Eye } from 'lucide-react';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [slug, setSlug] = useState<string>('');
    const supabase = createClient();

    useEffect(() => {
        const init = async () => {
            // Await params
            const resolvedParams = await params;
            setSlug(resolvedParams.slug);

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', resolvedParams.slug)
                .single();

            if (error) {
                console.error('Error fetching post:', error);
            } else {
                setPost(data);
                // Increment views
                if (data.id) {
                    await supabase.rpc('increment_blog_views', { row_id: data.id });
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-[#C44536]"></span>
                    <p className="mt-4 text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
                    <p className="text-gray-600 mb-6">This article may have been removed or doesn't exist.</p>
                    <Link href="/blog" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    const canRead = !!user;

    // Category colors
    const categoryColors: { [key: string]: { bg: string; text: string } } = {
        'Success Stories': { bg: 'bg-[#10B981]', text: 'text-[#10B981]' },
        'Career Tips': { bg: 'bg-[#F39C12]', text: 'text-[#F39C12]' },
        'Opportunities': { bg: 'bg-[#C44536]', text: 'text-[#C44536]' },
        'News': { bg: 'bg-[#8B3A3A]', text: 'text-[#8B3A3A]' },
    };
    const colors = categoryColors[post.category] || { bg: 'bg-[#C44536]', text: 'text-[#C44536]' };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Image Section */}
            <div className="relative h-[500px] overflow-hidden">
                {post.featured_image ? (
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#C44536] to-[#8B3A3A]"></div>
                )}
                
                {/* YENA Watermark - Bright & Creative */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                        <span className="text-white font-black text-9xl rotate-[-15deg] uppercase tracking-[0.3em] opacity-30 drop-shadow-[0_0_30px_rgba(243,156,18,0.5)]" style={{ textShadow: '0 0 40px rgba(243,156,18,0.6), 0 0 80px rgba(196,69,54,0.4)' }}>
                            YENA
                        </span>
                        {/* Accent lines */}
                        <div className="absolute -top-4 -left-4 w-20 h-1 bg-[#F39C12] opacity-50 rotate-[-15deg]"></div>
                        <div className="absolute -bottom-4 -right-4 w-20 h-1 bg-[#C44536] opacity-50 rotate-[-15deg]"></div>
                    </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-end">
                    <div className="container mx-auto px-6 lg:px-12 pb-12">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors">
                            <ArrowLeft size={20} />
                            <span>Back to Blog</span>
                        </Link>
                        
                        <div className="max-w-4xl">
                            <span className={`${colors.bg} text-white px-4 py-1.5 rounded-full text-sm font-semibold inline-block mb-4`}>
                                {post.category}
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-white/90">
                                <span className="flex items-center gap-2">
                                    <User size={18} />
                                    <span className="font-medium">{post.author_name}</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <Calendar size={18} />
                                    <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </span>
                                {post.views && (
                                    <span className="flex items-center gap-2">
                                        <Eye size={18} />
                                        <span>{post.views.toLocaleString()} views</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="container mx-auto px-6 lg:px-12 py-12">
                <div className="max-w-4xl mx-auto">
                    <article className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
                        {/* Excerpt */}
                        <div className={`border-l-4 ${colors.text.replace('text-', 'border-')} pl-6 mb-8`}>
                            <p className="text-xl text-gray-700 italic leading-relaxed">
                                {post.excerpt}
                            </p>
                        </div>

                        {/* Share Button */}
                        <div className="flex justify-end mb-8">
                            <button 
                                onClick={handleShare} 
                                className="btn btn-outline btn-sm gap-2"
                            >
                                <Share2 size={16} />
                                Share Article
                            </button>
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            {canRead ? (
                                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {post.content}
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="whitespace-pre-wrap blur-sm select-none h-60 overflow-hidden opacity-30">
                                        {post.content.substring(0, 500)}...
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
                                        <div className={`w-20 h-20 rounded-full ${colors.bg} bg-opacity-10 flex items-center justify-center mb-4`}>
                                            <Lock size={40} className={colors.text} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 text-gray-900">Login to Read Full Article</h3>
                                        <p className="text-gray-600 mb-6 text-center max-w-md">
                                            Join YENA to access full articles, courses, and exclusive opportunities.
                                        </p>
                                        <Link 
                                            href={`/login?redirect=/blog/${slug}`} 
                                            className={`btn ${colors.bg} text-white hover:opacity-90 btn-lg border-none px-10`}
                                        >
                                            Login / Sign Up
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>

                    {/* Author Card */}
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center text-white text-2xl font-bold`}>
                                {post.author_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{post.author_name}</h3>
                                <p className="text-gray-600">YENA Contributor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
