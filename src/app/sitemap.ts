import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';
import { getBaseUrl } from '@/lib/utils/url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getBaseUrl();
    const supabase = createClient();

    // Fetch dynamic content
    const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, updated_at')
        .eq('status', 'active');

    const { data: blogs } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published');

    const { data: profiles } = await supabase
        .from('profiles')
        .select('username, updated_at')
        .eq('is_public', true)
        .not('username', 'is', null);

    // Base Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: siteUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
        { url: `${siteUrl}/jobs`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9 },
        { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${siteUrl}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/talent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/courses`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ];

    // Dynamic Opportunities
    const oppRoutes: MetadataRoute.Sitemap = (opportunities || []).map((opp) => ({
        url: `${siteUrl}/jobs/${opp.id}`,
        lastModified: opp.updated_at ? new Date(opp.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Dynamic Blogs
    const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((blog) => ({
        url: `${siteUrl}/blog/${blog.slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    // Dynamic Profiles
    const profileRoutes: MetadataRoute.Sitemap = (profiles || []).map((profile) => ({
        url: `${siteUrl}/talent/${profile.username}`,
        lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...oppRoutes, ...blogRoutes, ...profileRoutes];
}
