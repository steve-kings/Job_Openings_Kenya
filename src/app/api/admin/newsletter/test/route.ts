import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/brevo';
import { getBaseUrl } from '@/lib/utils/url';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json({ error: 'Please provide a valid email parameter (e.g. ?email=test@example.com)' }, { status: 400 });
    }

    try {
        // Rate limiting: 10 test emails per minute per client
        const rateLimitResult = checkRateLimit({
            maxRequests: 10,
            windowMs: 60_000,
            identifier: `newsletter-test:${getClientIdentifier(request)}`,
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
                    },
                }
            );
        }

        const supabase = await createClient();

        // Verify authentication and admin role
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get top 5 most recent active opportunities
        const { data: opportunities, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error || !opportunities || opportunities.length === 0) {
            return NextResponse.json({ error: 'No opportunities found to send' }, { status: 404 });
        }

        const siteUrl = getBaseUrl();
        const logoUrl = `${siteUrl}/job_openings_kenya_logo.jpeg`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weekly Top Opportunities - Job Openings Kenya</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
                .header { background-color: #5CB800; color: #ffffff; padding: 40px 30px; text-align: center; }
                .header img { width: 60px; height: 60px; border-radius: 12px; margin-bottom: 16px; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
                .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
                .content { padding: 40px 30px; }
                .intro { font-size: 16px; margin-bottom: 30px; }
                .job-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-decoration: none; display: block; color: inherit; transition: border-color 0.2s ease; }
                .job-card:hover { border-color: #5CB800; }
                .job-type { display: inline-block; padding: 4px 12px; background-color: #e0f2fe; color: #0284c7; border-radius: 50px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }
                .job-title { margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
                .job-company { margin: 0 0 16px 0; font-size: 15px; color: #64748b; font-weight: 500; }
                .job-meta { display: flex; gap: 16px; font-size: 14px; color: #64748b; }
                .btn { display: inline-block; padding: 12px 24px; background-color: #5CB800; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; margin-top: 10px; width: 100%; box-sizing: border-box; }
                .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 13px; color: #64748b; }
                .footer a { color: #5CB800; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" alt="Job Openings Kenya Logo">
                    <h1>Your Weekly Opportunities</h1>
                    <p>The top 5 hand-picked roles for you this week.</p>
                </div>

                <div class="content">
                    <p class="intro">Hello there! Here is your curated list of the latest high-impact opportunities on the Job Openings Kenya platform. Don't miss out—apply before the deadlines!</p>

                    ${opportunities.map((job: Record<string, unknown>) => `
                    <div class="job-card">
                        <span class="job-type">${job.type}</span>
                        <h2 class="job-title">${job.title}</h2>
                        <p class="job-company">${job.company} • ${(job.location as string) || 'Remote'}</p>
                        <a href="${siteUrl}/jobs/${job.id}" class="btn">View & Apply</a>
                    </div>
                    `).join('')}

                    <div style="text-align: center; margin-top: 40px;">
                        <a href="${siteUrl}/jobs" style="color: #5CB800; font-weight: 600; text-decoration: underline; font-size: 16px;">View All 1000+ Opportunities</a>
                    </div>
                </div>

                <div class="footer">
                    <p>You're receiving this email because you are a valued member of the Job Openings Kenya community.</p>
                    <p>&copy; ${new Date().getFullYear()} Job Openings Kenya. All rights reserved.<br>Empowering African Youth</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send email via Brevo API
        const result = await sendEmail({
            to: [{ email: email }],
            subject: '🔥 Your Weekly Top 5 Opportunities - Job Openings Kenya',
            htmlContent: htmlContent,
            senderName: 'Job Openings Kenya Team',
            senderEmail: 'info@jobopeningskenya.co.ke'
        });

        return NextResponse.json({
            success: true,
            message: `Newsletter sent successfully to ${email}`,
            brevoMessageId: result.messageId
        });

    } catch (error: unknown) {
        console.error('Error sending newsletter:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
