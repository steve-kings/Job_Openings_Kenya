import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/utils/url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getBaseUrl();
    const supabase = await createClient();

    // Fetch dynamic content with image fields
    const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, updated_at, thumbnail_url, title')
        .eq('status', 'active');

    const { data: blogs } = await supabase
        .from('blog_posts')
        .select('slug, updated_at, featured_image')
        .eq('status', 'published');

    const { data: profiles } = await supabase
        .from('profiles')
        .select('username, updated_at')
        .eq('is_public', true)
        .not('username', 'is', null);

    // Get unique companies for company pages
    const { data: companies } = await supabase
        .from('opportunities')
        .select('company')
        .eq('status', 'active');

    const uniqueCompanies = [...new Set((companies || []).map((c: { company: string }) => c.company))];

    // Base static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: siteUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
        { url: `${siteUrl}/jobs`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9 },
        { url: `${siteUrl}/companies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
        { url: `${siteUrl}/map`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${siteUrl}/resources`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.75 },
        { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${siteUrl}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/talent`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/discover`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    ];

    // Dynamic Opportunities — with images for Google for Jobs
    const oppRoutes: MetadataRoute.Sitemap = (opportunities || []).map((opp: { id: string; updated_at?: string; thumbnail_url?: string; title?: string }) => ({
        url: `${siteUrl}/jobs/${opp.id}`,
        lastModified: opp.updated_at ? new Date(opp.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images: opp.thumbnail_url ? [opp.thumbnail_url] : [`${siteUrl}/job_openings_kenya_logo.jpeg`],
    }));

    // Dynamic Blogs — with featured images
    const blogRoutes: MetadataRoute.Sitemap = (blogs || []).map((blog: { slug: string; updated_at?: string; featured_image?: string }) => ({
        url: `${siteUrl}/blog/${blog.slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        images: blog.featured_image ? [blog.featured_image] : [],
    }));

    // Company profile pages
    const companyRoutes: MetadataRoute.Sitemap = uniqueCompanies.map((company: string) => ({
        url: `${siteUrl}/companies/${encodeURIComponent(company.toLowerCase().replace(/\s+/g, '-'))}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic Profiles
    const profileRoutes: MetadataRoute.Sitemap = (profiles || []).map((profile: { username: string; updated_at?: string }) => ({
        url: `${siteUrl}/talent/${profile.username}`,
        lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...oppRoutes, ...blogRoutes, ...companyRoutes, ...profileRoutes];
}
