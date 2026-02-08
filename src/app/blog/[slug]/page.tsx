import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

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
            title: 'Article Not Found | YENA',
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://youth-empowerment-and-networking-af.vercel.app';
    const url = `${siteUrl}/blog/${resolvedParams.slug}`;
    const fallbackImage = `${siteUrl}/images/yena logo.jpeg`;
    const imageUrl = post.featured_image || fallbackImage;
    
    return {
        title: `${post.title} | YENA Blog`,
        description: post.excerpt || post.content.substring(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt || post.content.substring(0, 160),
            url: url,
            siteName: 'YENA - Youth Empowerment Network Africa',
            images: [
                {
                    url: imageUrl,
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
            images: [imageUrl],
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

    // Increment views
    if (post?.id) {
        await supabase.rpc('increment_blog_views', { row_id: post.id });
    }

    return <BlogPostClient post={post} user={user} slug={resolvedParams.slug} />;
}
