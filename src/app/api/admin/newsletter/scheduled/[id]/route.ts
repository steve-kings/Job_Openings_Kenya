import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const { error } = await supabase
            .from('scheduled_emails')
            .delete()
            .eq('id', id)
            .eq('status', 'pending');

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Scheduled email cancelled' });
    } catch (error: unknown) {
        console.error('Cancel scheduled email error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
