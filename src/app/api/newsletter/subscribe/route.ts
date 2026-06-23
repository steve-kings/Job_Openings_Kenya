import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
    try {
        // Rate limiting: 5 subscription attempts per minute per client
        const rateLimitResult = checkRateLimit({
            maxRequests: 5,
            windowMs: 60_000,
            identifier: `subscribe:${getClientIdentifier(request)}`,
        });

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
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

        const { email, preferences } = await request.json();

        if (!email || typeof email !== 'string' || !VALID_EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Try inserting with interests JSONB if column exists; fallback to email only
        const insertData: Record<string, unknown> = { email };
        if (preferences && typeof preferences === 'object' && !Array.isArray(preferences)) {
            insertData.interests = preferences;
        }

        const { error } = await supabase
            .from('subscribers')
            .insert([insertData]);

        if (error) {
            if (error.code === '23505') { // Unique violation code in Postgres
                return NextResponse.json({ error: 'This email is already subscribed!' }, { status: 400 });
            }
            // If interests column doesn't exist, retry with email only
            if (error.message && error.message.toLowerCase().includes('interests')) {
                const { error: retryError } = await supabase
                    .from('subscribers')
                    .insert([{ email }]);
                if (!retryError) {
                    return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
                }
            }
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: 'Failed to subscribe. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
    } catch (error: unknown) {
        console.error('Subscription API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
