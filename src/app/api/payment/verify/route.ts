import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
    if (!PAYSTACK_SECRET) {
        return NextResponse.json({ error: 'Payment not configured.' }, { status: 500 });
    }

    try {
        const { reference, user_id, product, amount } = await req.json();
        if (!reference || typeof reference !== 'string') {
            return NextResponse.json({ error: 'Transaction reference required' }, { status: 400 });
        }

        // Verify with Paystack
        const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        });
        const data = await res.json();

        if (!data.status || data.data?.status !== 'success') {
            // Log failed attempt
            if (SUPABASE_URL && SUPABASE_KEY && user_id) {
                const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
                await supabase.from('payment_transactions').insert({
                    user_id, reference, amount: amount || 0, product: product || 'unknown',
                    status: 'failed', email: data.data?.customer?.email,
                }).select().single();
            }
            return NextResponse.json({ verified: false, message: data.message || 'Payment not verified' }, { status: 402 });
        }

        // Record successful transaction
        if (SUPABASE_URL && SUPABASE_KEY && user_id) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data: existing } = await supabase.from('payment_transactions').select('id').eq('reference', reference).single();
            if (!existing) {
                await supabase.from('payment_transactions').insert({
                    user_id, reference,
                    amount: data.data.amount / 100,
                    currency: data.data.currency,
                    product: product || 'unknown',
                    status: 'verified',
                    email: data.data.customer?.email,
                    verified_at: new Date().toISOString(),
                });
            }
        }

        return NextResponse.json({
            verified: true,
            amount: data.data.amount / 100,
            currency: data.data.currency,
            email: data.data.customer?.email,
            reference: data.data.reference,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
