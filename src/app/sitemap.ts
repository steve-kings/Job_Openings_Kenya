import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/utils/url';
import { hasSubstantiveArticleContent, hasSubstantiveJobContent } from '@/lib/content-quality';

interface SitemapOpportunity {
    id: string;
    company: string;
    updated_at?: string | null;
    thumbnail_url?: string | null;
    description?: string | null;
    short_description?: string | null;
    requirements?: string[] | null;
    responsibilities?: string[] | null;
    benefits?: string[] | null;
}

interface SitemapBlog {
    slug: string;
    content?: string | null;
    updated_at?: string | null;
    featured_image?: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getBaseUrl();
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Fetch dynamic content with image fields
    const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, company, updated_at, thumbnail_url, description, short_description, requirements, responsibilities, benefits')
        .eq('status', 'active')
        .is('source', null)
        .or(`deadline.gte.${today},deadline.is.null`);

    const { data: blogs } = await supabase
        .from('blog_posts')
        .select('slug, content, updated_at, featured_image')
        .eq('status', 'published');

    const { data: profiles } = await supabase
        .from('profiles')
        .select('username, updated_at')
        .eq('is_public', true)
        .not('username', 'is', null);

    const indexableOpportunities = ((opportunities || []) as SitemapOpportunity[])
        .filter(hasSubstantiveJobContent);
    const indexableBlogs = ((blogs || []) as SitemapBlog[])
        .filter((blog) => hasSubstantiveArticleContent(blog.content));
    const uniqueCompanies = [...new Set(indexableOpportunities
        .map((opportunity) => opportunity.company)
        .filter(Boolean))];

    // Base static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: siteUrl, changeFrequency: 'daily', priority: 1.0 },
        { url: `${siteUrl}/companies`, changeFrequency: 'daily', priority: 0.85 },
        { url: `${siteUrl}/map`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${siteUrl}/resources`, changeFrequency: 'weekly', priority: 0.75 },
        { url: `${siteUrl}/career-guides`, changeFrequency: 'monthly', priority: 0.85 },
        { url: `${siteUrl}/blog`, changeFrequency: 'daily', priority: 0.8 },
        { url: `${siteUrl}/community`, changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/talent`, changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/discover`, changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/popular`, changeFrequency: 'daily', priority: 0.7 },
        { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${siteUrl}/terms`, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${siteUrl}/editorial-policy`, changeFrequency: 'yearly', priority: 0.5 },
    ];

    // Dynamic Opportunities — with images for Google for Jobs
    const oppRoutes: MetadataRoute.Sitemap = indexableOpportunities.map((opp) => ({
        url: `${siteUrl}/jobs/${opp.id}`,
        ...(opp.updated_at ? { lastModified: new Date(opp.updated_at) } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images: opp.thumbnail_url ? [opp.thumbnail_url] : [`${siteUrl}/job_openings_kenya_logo.jpeg`],
    }));

    // Dynamic Blogs — with featured images
    const blogRoutes: MetadataRoute.Sitemap = indexableBlogs.map((blog) => ({
        url: `${siteUrl}/blog/${blog.slug}`,
        ...(blog.updated_at ? { lastModified: new Date(blog.updated_at) } : {}),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        images: blog.featured_image ? [blog.featured_image] : [],
    }));

    // Company profile pages
    const companyRoutes: MetadataRoute.Sitemap = uniqueCompanies.map((company: string) => ({
        url: `${siteUrl}/companies/${encodeURIComponent(company.toLowerCase().replace(/\s+/g, '-'))}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic Profiles
    const profileRoutes: MetadataRoute.Sitemap = (profiles || []).map((profile: { username: string; updated_at?: string }) => ({
        url: `${siteUrl}/talent/${profile.username}`,
        ...(profile.updated_at ? { lastModified: new Date(profile.updated_at) } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...oppRoutes, ...blogRoutes, ...companyRoutes, ...profileRoutes];
}
