import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import MapViewClient from './MapViewClient';

export const metadata: Metadata = {
    title: 'Job Map — Find Opportunities Near You | Job Openings Kenya',
    description: 'Explore job openings and training programs across Kenya on an interactive map. Find opportunities near your location.',
};

export const revalidate = 3600;

export default async function MapPage() {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: opportunities } = await supabase
        .from('opportunities')
        .select('id, title, company, type, location, deadline, salary_min, salary_max, salary_currency')
        .eq('status', 'active')
        .or(`deadline.gte.${today},deadline.is.null`)
        .order('created_at', { ascending: false });

    return <MapViewClient opportunities={opportunities || []} />;
}
