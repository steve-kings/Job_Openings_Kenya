import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import JobDetailClient from './JobDetailClient';
import { getBaseUrl } from '@/lib/utils/url';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: job } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (!job) {
        return {
            title: 'Opportunity Not Found | Job Openings Kenya',
        };
    }

    const siteUrl = getBaseUrl();
    const url = `${siteUrl}/jobs/${resolvedParams.id}`;
    const dynamicOgImageUrl = `${siteUrl}/api/og/job/${resolvedParams.id}`;
    
    return {
        title: `${job.title} - ${job.company} | Job Openings Kenya`,
        description: job.short_description || job.description.substring(0, 160),
        openGraph: {
            title: job.title,
            description: job.short_description || job.description.substring(0, 160),
            url: url,
            siteName: 'Job Openings Kenya - Job Openings Kenya',
            images: [
                {
                    url: dynamicOgImageUrl,
                    width: 1200,
                    height: 630,
                    alt: job.title,
                }
            ],
            locale: 'en_US',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: job.title,
            description: job.short_description || job.description.substring(0, 160),
            images: [dynamicOgImageUrl],
        },
    };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: job } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    const { data: { user } } = await supabase.auth.getUser();

    // Increment views
    if (job) {
        await supabase.rpc('increment_opportunity_views', { row_id: resolvedParams.id });
    }

    // Fetch similar opportunities
    let similarJobs: any[] = [];
    if (job) {
        const { data: similar } = await supabase
            .from('opportunities')
            .select('id, title, company, type, location, thumbnail_url, deadline')
            .eq('type', job.type)
            .eq('status', 'active')
            .neq('id', job.id)
            .order('created_at', { ascending: false })
            .limit(4);
            
        similarJobs = similar || [];
    }

    return <JobDetailClient job={job} user={user} opportunityId={resolvedParams.id} similarJobs={similarJobs} />;
}
