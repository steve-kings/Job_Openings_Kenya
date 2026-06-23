import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

export async function POST(request: Request) {
    try {
        // Rate limiting: 10 schedule operations per minute
        const rateLimitResult = checkRateLimit({
            maxRequests: 10,
            windowMs: 60_000,
            identifier: `schedule:${getClientIdentifier(request)}`,
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

        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify admin role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { subject, htmlContent, sendAt } = await request.json();

        if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
            return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
        }
        if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }
        if (!sendAt || typeof sendAt !== 'string') {
            return NextResponse.json({ error: 'Send date is required' }, { status: 400 });
        }

        const sendDate = new Date(sendAt);
        if (isNaN(sendDate.getTime()) || sendDate <= new Date()) {
            return NextResponse.json({ error: 'Send date must be in the future' }, { status: 400 });
        }

        // Limit subject length
        if (subject.length > 200) {
            return NextResponse.json({ error: 'Subject must be under 200 characters' }, { status: 400 });
        }

        // Limit content size (prevent massive HTML blobs)
        if (htmlContent.length > 200_000) {
            return NextResponse.json({ error: 'Content exceeds maximum size' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('scheduled_emails')
            .insert([
                {
                    subject: subject.trim(),
                    html_content: htmlContent,
                    send_at: sendDate.toISOString(),
                    status: 'pending',
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, scheduledEmail: data });
    } catch (error: unknown) {
        console.error('Schedule email error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
