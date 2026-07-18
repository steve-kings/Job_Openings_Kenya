import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/utils/url';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getBaseUrl();

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/auth/', '/dashboard/', '/employer/dashboard/'],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
