import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
    if (!PAYSTACK_SECRET) {
        return NextResponse.json({ error: 'Payment not configured.' }, { status: 500 });
    }

    try {
        const { reference } = await req.json();
        if (!reference || typeof reference !== 'string') {
            return NextResponse.json({ error: 'Transaction reference required' }, { status: 400 });
        }

        // Verify with Paystack
        const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
        });

        const data = await res.json();

        if (!data.status || data.data?.status !== 'success') {
            return NextResponse.json({ verified: false, message: data.message || 'Payment not verified' }, { status: 402 });
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
