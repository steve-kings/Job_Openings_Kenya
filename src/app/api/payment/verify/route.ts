import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Expected prices in KES (fallbacks if site_settings unavailable)
const DEFAULT_PRICES: Record<string, number> = {
    cv_builder: 50,
    cover_letter: 20,
    cv_pro_design: 200,
};

async function getExpectedPrice(product: string): Promise<number | null> {
    if (!SUPABASE_URL || !SUPABASE_KEY) return DEFAULT_PRICES[product] || null;
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        // Map product to site_settings key
        const keyMap: Record<string, string> = {
            cv_builder: 'cv_price',
            cover_letter: 'cover_letter_price',
            cv_pro_design: 'cv_pro_design_price',
        };
        const settingKey = keyMap[product];
        if (!settingKey) return DEFAULT_PRICES[product] || null;

        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', settingKey)
            .single();

        if (data?.value) return parseInt(data.value, 10);
        return DEFAULT_PRICES[product] || null;
    } catch {
        return DEFAULT_PRICES[product] || null;
    }
}

export async function POST(req: Request) {
    if (!PAYSTACK_SECRET) {
        return NextResponse.json({ error: 'Payment not configured.' }, { status: 500 });
    }

    // Rate limiting: 15 verification attempts per minute
    const rateLimitResult = checkRateLimit({
        maxRequests: 15,
        windowMs: 60_000,
        identifier: `payment-verify:${getClientIdentifier(req)}`,
    });
    if (!rateLimitResult.success) {
        return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 });
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

        // Validate amount matches expected price
        const paidAmount = data.data.amount / 100; // Convert from kobo/cents to KES
        const expectedPrice = await getExpectedPrice(product);

        if (expectedPrice !== null && paidAmount < expectedPrice) {
            // Amount too low — possible client-side manipulation
            console.warn(`Payment amount mismatch: paid ${paidAmount} KES, expected ${expectedPrice} KES for ${product}`);
            if (SUPABASE_URL && SUPABASE_KEY && user_id) {
                const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
                await supabase.from('payment_transactions').insert({
                    user_id, reference,
                    amount: paidAmount,
                    currency: data.data.currency,
                    product: product || 'unknown',
                    status: 'failed',
                    email: data.data.customer?.email,
                    metadata: { reason: `Amount mismatch: paid ${paidAmount}, expected ${expectedPrice}` },
                });
            }
            return NextResponse.json({
                verified: false,
                message: `Payment amount mismatch. Expected KES ${expectedPrice}, paid KES ${paidAmount}.`,
            }, { status: 402 });
        }

        // Record successful transaction
        if (SUPABASE_URL && SUPABASE_KEY && user_id) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data: existing } = await supabase.from('payment_transactions').select('id').eq('reference', reference).single();
            if (!existing) {
                await supabase.from('payment_transactions').insert({
                    user_id, reference,
                    amount: paidAmount,
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
            amount: paidAmount,
            currency: data.data.currency,
            email: data.data.customer?.email,
            reference: data.data.reference,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
