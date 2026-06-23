import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/brevo';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createClient();
        const now = new Date().toISOString();

        // 1. Fetch pending scheduled emails that are due
        const { data: pendingEmails, error: fetchError } = await supabase
            .from('scheduled_emails')
            .select('*')
            .eq('status', 'pending')
            .lte('send_at', now)
            .order('send_at', { ascending: true })
            .limit(5);

        if (fetchError) throw fetchError;

        if (!pendingEmails || pendingEmails.length === 0) {
            return NextResponse.json({ success: true, message: 'No scheduled emails to send.' });
        }

        const results = [];

        for (const email of pendingEmails) {
            try {
                // Fetch subscribers
                const { data: subscribers, error: subError } = await supabase
                    .from('subscribers')
                    .select('email')
                    .eq('status', 'active');

                if (subError || !subscribers || subscribers.length === 0) {
                    await supabase
                        .from('scheduled_emails')
                        .update({ status: 'failed' })
                        .eq('id', email.id);
                    results.push({ id: email.id, status: 'failed', reason: 'No subscribers' });
                    continue;
                }

                // Send in BCC chunks of 50
                const bccList = subscribers.map((sub: { email: string }) => ({ email: sub.email }));
                const chunkSize = 50;
                let sentCount = 0;

                for (let i = 0; i < bccList.length; i += chunkSize) {
                    const chunk = bccList.slice(i, i + chunkSize);
                    await sendEmail({
                        to: [{ email: 'info@jobopeningskenya.co.ke', name: 'Job Openings Kenya Team' }],
                        bcc: chunk,
                        subject: email.subject,
                        htmlContent: email.html_content,
                    });
                    sentCount += chunk.length;
                }

                // Mark as sent
                await supabase
                    .from('scheduled_emails')
                    .update({
                        status: 'sent',
                        sent_at: new Date().toISOString(),
                        recipient_count: sentCount,
                    })
                    .eq('id', email.id);

                results.push({ id: email.id, status: 'sent', recipients: sentCount });
            } catch (err: unknown) {
                console.error(`Failed to send scheduled email ${email.id}:`, err);
                await supabase
                    .from('scheduled_emails')
                    .update({ status: 'failed' })
                    .eq('id', email.id);
                results.push({ id: email.id, status: 'failed', reason: err instanceof Error ? err.message : 'Unknown error' });
            }
        }

        return NextResponse.json({ success: true, processed: results });
    } catch (error: unknown) {
        console.error('[Cron] Scheduled emails error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
