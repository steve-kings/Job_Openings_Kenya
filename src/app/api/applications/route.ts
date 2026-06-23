import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

export async function GET(request: Request) {
    try {
        // Rate limiting: 30 reads per minute
        const rateLimitResult = checkRateLimit({
            maxRequests: 30,
            windowMs: 60_000,
            identifier: `applications:${getClientIdentifier(request)}`,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                        'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
                    },
                }
            );
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                notes,
                applied_at,
                updated_at,
                opportunity:opportunity_id (
                    id, title, company, type, location, deadline, apply_url, salary_min, salary_max, salary_currency
                )
            `)
            .eq('user_id', user.id)
            .order('applied_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ applications: data || [] });
    } catch (error: unknown) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Rate limiting: 20 application submissions per minute
        const rateLimitResult = checkRateLimit({
            maxRequests: 20,
            windowMs: 60_000,
            identifier: `applications:${getClientIdentifier(request)}`,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                        'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
                    },
                }
            );
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { opportunityId, status = 'applied', notes = '' } = await request.json();

        if (!opportunityId || typeof opportunityId !== 'string') {
            return NextResponse.json({ error: 'opportunityId is required' }, { status: 400 });
        }

        // Validate status value
        const allowedStatuses = ['applied', 'saved', 'interviewing', 'offered', 'rejected'];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        // Validate notes length
        if (typeof notes === 'string' && notes.length > 5000) {
            return NextResponse.json({ error: 'Notes exceed maximum length of 5000 characters' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('applications')
            .insert([{
                user_id: user.id,
                opportunity_id: opportunityId,
                status,
                notes,
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'You have already applied to this opportunity.' }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ success: true, application: data });
    } catch (error: unknown) {
        console.error('Error creating application:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
