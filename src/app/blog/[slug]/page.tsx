import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';
import { getBaseUrl } from '@/lib/utils/url';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

    if (!post) {
        return {
            title: 'Article Not Found | 1000Jobs',
        };
    }

    const siteUrl = getBaseUrl();
    const url = `${siteUrl}/blog/${resolvedParams.slug}`;
    const dynamicOgImageUrl = `${siteUrl}/api/og/blog/${resolvedParams.slug}`;
    
    return {
        title: `${post.title} | 1000Jobs Blog`,
        description: post.excerpt || post.content.substring(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160),
            url: url,
            siteName: '1000Jobs - 1000Jobs',
            images: [
                {
                    url: dynamicOgImageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: post.created_at,
            authors: [post.author_name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160),
            images: [dynamicOgImageUrl],
        },
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

    const { data: { user } } = await supabase.auth.getUser();

    // Increment views (best-effort — won't break if function doesn't exist)
    if (post?.id) {
        try { await supabase.rpc('increment_blog_views', { row_id: post.id }); } catch {}
    }

    return <BlogPostClient post={post} user={user} slug={resolvedParams.slug} />;
}
