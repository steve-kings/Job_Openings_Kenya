import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const supabase = await createClient();
        
        const { error } = await supabase
            .from('subscribers')
            .insert([{ email }]);

        if (error) {
            if (error.code === '23505') { // Unique violation code in Postgres
                return NextResponse.json({ error: 'This email is already subscribed!' }, { status: 400 });
            }
            console.error('Supabase Error:', error);
            return NextResponse.json({ error: 'Failed to subscribe. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
    } catch (error: any) {
        console.error('Subscription API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
