'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Share2, Lock, Eye } from 'lucide-react';

interface BlogPost {
    title: string;
    slug: string;
    category: string;
    featured_image?: string;
    author_name: string;
    created_at: string;
    views?: number;
    excerpt: string;
    content: string;
}

interface BlogPostClientProps {
    post: BlogPost;
    user: { id: string } | null;
    slug: string;
}

export default function BlogPostClient({ post, user, slug }: BlogPostClientProps) {
    const [copySuccess, setCopySuccess] = useState(false);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
                    <p className="text-gray-600 mb-6">This article may have been removed or doesn&apos;t exist.</p>
                    <Link href="/blog" className="inline-flex items-center justify-center bg-[#5CB800] text-white hover:bg-[#4A9900] px-4 py-2 rounded-lg font-medium">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    // Category colors
    const categoryColors: { [key: string]: { bg: string; text: string } } = {
        'Success Stories': { bg: 'bg-[#5CB800]', text: 'text-[#5CB800]' },
        'Career Tips': { bg: 'bg-[#5CB800]', text: 'text-[#5CB800]' },
        'Opportunities': { bg: 'bg-[#5CB800]', text: 'text-[#5CB800]' },
        'News': { bg: 'bg-[#4A9900]', text: 'text-[#4A9900]' },
    };
    const colors = categoryColors[post.category] || { bg: 'bg-[#5CB800]', text: 'text-[#5CB800]' };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this article: ${post.title}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleWhatsAppShare = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.open(url, '_blank');
    };

    const handleFacebookShare = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleTwitterShare = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleLinkedInShare = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Image Section */}
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
                {post.featured_image ? (
                    <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#5CB800] to-[#4A9900]"></div>
                )}
                
                {/* Job Openings Kenya Watermark - Bright & Creative */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                        <span className="text-white font-black text-5xl sm:text-7xl lg:text-9xl rotate-[-15deg] uppercase tracking-[0.3em] opacity-30 drop-shadow-[0_0_30px_rgba(243,156,18,0.5)]" style={{ textShadow: '0 0 40px rgba(243,156,18,0.6), 0 0 80px rgba(196,69,54,0.4)' }}>
                            Job Openings Kenya
                        </span>
                        {/* Accent lines */}
                        <div className="absolute -top-4 -left-4 w-20 h-1 bg-[#5CB800] opacity-50 rotate-[-15deg]"></div>
                        <div className="absolute -bottom-4 -right-4 w-20 h-1 bg-[#5CB800] opacity-50 rotate-[-15deg]"></div>
                    </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-end">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12 pb-8 sm:pb-12">
                        <Link href="/blog" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors">
                            <ArrowLeft size={20} />
                            <span>Back to Blog</span>
                        </Link>
                        
                        <div className="max-w-4xl">
                            <span className={`${colors.bg} text-white px-4 py-1.5 rounded-full text-sm font-semibold inline-block mb-4`}>
                                {post.category}
                            </span>
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6 text-white/90">
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
                <div className="max-w-4xl mx-auto">
                    <article className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 lg:p-12">
                        {/* Excerpt */}
                        <div className={`border-l-4 ${colors.text.replace('text-', 'border-')} pl-4 sm:pl-6 mb-8`}>
                            <p className="text-lg sm:text-xl text-gray-700 italic leading-relaxed">
                                {post.excerpt}
                            </p>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            <button 
                                onClick={handleWhatsAppShare}
                                className="inline-flex items-center justify-center text-sm px-3 py-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#1da851] gap-2 font-medium"
                            >
                                <Share2 size={14} />
                                WhatsApp
                            </button>
                            <button 
                                onClick={handleFacebookShare}
                                className="inline-flex items-center justify-center text-sm px-3 py-1.5 rounded-lg bg-[#1877F2] text-white hover:bg-[#0c63d4] gap-2 font-medium"
                            >
                                <Share2 size={14} />
                                Facebook
                            </button>
                            <button 
                                onClick={handleTwitterShare}
                                className="inline-flex items-center justify-center text-sm px-3 py-1.5 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#0c8bd9] gap-2 font-medium"
                            >
                                <Share2 size={14} />
                                Twitter
                            </button>
                            <button 
                                onClick={handleLinkedInShare}
                                className="inline-flex items-center justify-center text-sm px-3 py-1.5 rounded-lg bg-[#0A66C2] text-white hover:bg-[#004182] gap-2 font-medium"
                            >
                                <Share2 size={14} />
                                LinkedIn
                            </button>
                            <button 
                                onClick={handleCopyLink}
                                className={`inline-flex items-center justify-center text-sm px-3 py-1.5 rounded-lg gap-2 font-medium ${copySuccess ? 'bg-[#5CB800] text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                            >
                                <Share2 size={14} />
                                {copySuccess ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg max-w-none font-sans">
                            <div
                                className="text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>

                        {!user && (
                            <aside className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6" aria-label="Free member tools">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">Save jobs and track applications</h2>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                            Articles are free to read. Create an account only if you want access to personal job-saving and application-tracking tools.
                                        </p>
                                        <Link
                                            href={`/login?redirect=/blog/${slug}`}
                                            className="mt-3 inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
                                        >
                                            Login or create an account
                                        </Link>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </article>

                    {/* Author Card */}
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center text-white text-2xl font-bold`}>
                                {post.author_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{post.author_name}</h3>
                                <p className="text-gray-600">Job Openings Kenya Contributor</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
