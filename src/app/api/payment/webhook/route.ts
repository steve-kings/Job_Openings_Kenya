import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
    if (!PAYSTACK_SECRET) {
        return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    // Verify Paystack signature
    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    try {
        const body = await req.text();
        const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');
        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Only process charge.success events
        if (event.event !== 'charge.success') {
            return NextResponse.json({ received: true });
        }

        const { reference, amount, currency, customer, metadata } = event.data;
        const userId = metadata?.user_id;
        const product = metadata?.product || 'unknown';

        if (!SUPABASE_URL || !SUPABASE_KEY) {
            return NextResponse.json({ received: true });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // Record transaction (idempotent — skip if reference already exists)
        const { data: existing } = await supabase
            .from('payment_transactions')
            .select('id')
            .eq('reference', reference)
            .single();

        if (!existing) {
            await supabase.from('payment_transactions').insert({
                reference,
                amount: amount / 100, // Convert to KES
                currency,
                product,
                status: 'verified',
                email: customer?.email,
                user_id: userId || null,
                metadata: metadata || null,
                verified_at: new Date().toISOString(),
            });
        }

        // If CV Builder payment, ensure cv_documents is marked paid
        if (product === 'cv_builder' && userId) {
            // Find the most recent unpaid CV for this user and mark it paid
            const { data: cvDocs } = await supabase
                .from('cv_documents')
                .select('id')
                .eq('user_id', userId)
                .eq('status', 'created')
                .order('created_at', { ascending: false })
                .limit(1);

            if (cvDocs && cvDocs.length > 0) {
                await supabase
                    .from('cv_documents')
                    .update({ status: 'paid' })
                    .eq('id', cvDocs[0].id);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        // Always return 200 to prevent Paystack from retrying indefinitely
        return NextResponse.json({ received: true });
    }
}
