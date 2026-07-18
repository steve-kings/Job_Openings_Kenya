import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import JobDetailClient from './JobDetailClient';
import { getBaseUrl } from '@/lib/utils/url';
import { cleanSummaryText } from '@/lib/utils/jobs';
import { notFound } from 'next/navigation';
import { hasSubstantiveJobContent } from '@/lib/content-quality';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data: job } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', resolvedParams.id)
        .eq('status', 'active')
        .or(`deadline.gte.${today},deadline.is.null`)
        .single();

    if (!job) {
        return {
            title: 'Opportunity Not Found',
            robots: { index: false, follow: false },
        };
    }

    const siteUrl = getBaseUrl();
    const url = `${siteUrl}/jobs/${resolvedParams.id}`;
    const dynamicOgImageUrl = `${siteUrl}/api/og/job/${resolvedParams.id}`;
    const description = cleanSummaryText(job).substring(0, 160)
        || `View the ${job.title} opportunity at ${job.company}, including the role details and application instructions.`;
    
    return {
        title: `${job.title} at ${job.company}`,
        description,
        alternates: { canonical: url },
        robots: job.source
            ? { index: false, follow: true }
            : hasSubstantiveJobContent(job)
                ? { index: true, follow: true }
                : { index: false, follow: true },
        openGraph: {
            title: job.title,
            description,
            url: url,
            siteName: 'Job Openings Kenya',
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
            description,
            images: [dynamicOgImageUrl],
        },
    };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    
    const { data: job } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', resolvedParams.id)
        .eq('status', 'active')
        .or(`deadline.gte.${today},deadline.is.null`)
        .single();

    if (!job || !job.type) notFound();

    const { data: { user } } = await supabase.auth.getUser();

    // Increment views
    await supabase.rpc('increment_opportunity_views', { row_id: resolvedParams.id });

    interface SimilarJob {
        id: string;
        title: string;
        company: string;
        type: string;
        location: string;
        thumbnail_url?: string;
        deadline: string;
    }

    // Fetch similar opportunities (exclude expired; a null deadline = rolling basis)
    let similarJobs: SimilarJob[] = [];
    const { data: similar } = await supabase
        .from('opportunities')
        .select('id, title, company, type, location, thumbnail_url, deadline')
        .eq('type', job.type)
        .eq('status', 'active')
        .neq('id', job.id)
        .or(`deadline.gte.${today},deadline.is.null`)
        .order('created_at', { ascending: false })
        .limit(4);

    similarJobs = similar || [];

    // Fetch cover letter price from site settings
    let coverLetterPrice = 20; // default fallback
    try {
        const { data: priceData } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'cover_letter_price')
            .single();
        if (priceData?.value) coverLetterPrice = parseInt(priceData.value, 10);
    } catch { /* use default */ }

    return <JobDetailClient job={job} user={user} opportunityId={resolvedParams.id} similarJobs={similarJobs} coverLetterPrice={coverLetterPrice} />;
}
