import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

const ALLOWED_STATUSES = ['applied', 'saved', 'interviewing', 'offered', 'rejected'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const rateLimitResult = checkRateLimit({
            maxRequests: 30,
            windowMs: 60_000,
            identifier: `applications:${getClientIdentifier(request)}`,
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

        const { id } = await params;
        const { status, notes } = await request.json();

        const updateData: Record<string, unknown> = {};
        if (status) {
            if (!ALLOWED_STATUSES.includes(status)) {
                return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
            }
            updateData.status = status;
        }
        if (notes !== undefined) {
            if (typeof notes === 'string' && notes.length > 5000) {
                return NextResponse.json({ error: 'Notes exceed maximum length of 5000 characters' }, { status: 400 });
            }
            updateData.notes = notes;
        }

        const { data, error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, application: data });
    } catch (error: unknown) {
        console.error('Error updating application:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const rateLimitResult = checkRateLimit({
            maxRequests: 30,
            windowMs: 60_000,
            identifier: `applications:${getClientIdentifier(request)}`,
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

        const { id } = await params;

        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting application:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
