import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
    try {
        const rateLimitResult = checkRateLimit({
            maxRequests: 30,
            windowMs: 60_000,
            identifier: `saved-searches:${getClientIdentifier(request)}`,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('saved_searches')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ savedSearches: data || [] });
    } catch (error: unknown) {
        console.error('Error fetching saved searches:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const rateLimitResult = checkRateLimit({
            maxRequests: 10,
            windowMs: 60_000,
            identifier: `saved-searches:${getClientIdentifier(request)}`,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, query = '', type = 'All', location = '', notify_email = true, notify_whatsapp = false } = body;

        if (!email || typeof email !== 'string' || !VALID_EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('saved_searches')
            .insert([{
                user_id: user.id,
                email,
                query: typeof query === 'string' ? query : '',
                type,
                location,
                notify_email,
                notify_whatsapp,
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'This search is already saved.' }, { status: 409 });
            }
            throw error;
        }

        // Also subscribe email to the newsletter if not already subscribed
        const { error: subError } = await supabase
            .from('subscribers')
            .insert([{ email, interests: { query, type, location } }])
            .select();

        if (subError && subError.code !== '23505') {
            console.warn('Could not auto-subscribe email:', subError.message);
        }

        return NextResponse.json({ success: true, savedSearch: data });
    } catch (error: unknown) {
        console.error('Error creating saved search:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const rateLimitResult = checkRateLimit({
            maxRequests: 20,
            windowMs: 60_000,
            identifier: `saved-searches:${getClientIdentifier(request)}`,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const { error } = await supabase
            .from('saved_searches')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting saved search:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
