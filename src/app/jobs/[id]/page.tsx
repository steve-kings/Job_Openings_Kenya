import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import JobDetailClient from './JobDetailClient';

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
            title: 'Opportunity Not Found | YENA',
        };
    }

    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yena.vercel.app'}/jobs/${resolvedParams.id}`;
    
    return {
        title: `${job.title} - ${job.company} | YENA`,
        description: job.short_description || job.description.substring(0, 160),
        openGraph: {
            title: job.title,
            description: job.short_description || job.description.substring(0, 160),
            url: url,
            siteName: 'YENA - Youth Empowerment Network Africa',
            images: job.thumbnail_url ? [
                {
                    url: job.thumbnail_url,
                    width: 1200,
                    height: 630,
                    alt: job.title,
                }
            ] : [],
            locale: 'en_US',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: job.title,
            description: job.short_description || job.description.substring(0, 160),
            images: job.thumbnail_url ? [job.thumbnail_url] : [],
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

    return <JobDetailClient job={job} user={user} opportunityId={resolvedParams.id} />;
}
