import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/brevo';
import { getBaseUrl } from '@/lib/utils/url';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        
        // Ensure user is authenticated and admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Subscribers
        const { data: subscribers, error: subError } = await supabase
            .from('subscribers')
            .select('email')
            .eq('status', 'active');

        if (subError) throw subError;
        
        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 });
        }

        // 2. Fetch Top Opportunities
        const { data: opportunities, error: oppError } = await supabase
            .from('opportunities')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);

        if (oppError || !opportunities || opportunities.length === 0) {
            return NextResponse.json({ error: 'No active opportunities found to send' }, { status: 404 });
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
                    
                    ${opportunities.map((job: any) => `
                    <div class="job-card">
                        <span class="job-type">${job.type}</span>
                        <h2 class="job-title">${job.title}</h2>
                        <p class="job-company">${job.company} • ${job.location || 'Remote'}</p>
                        <a href="${siteUrl}/jobs/${job.id}" class="btn">View & Apply</a>
                    </div>
                    `).join('')}
                    
                    <div style="text-align: center; margin-top: 40px;">
                        <a href="${siteUrl}/jobs" style="color: #5CB800; font-weight: 600; text-decoration: underline; font-size: 16px;">View All 1000+ Opportunities</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>You're receiving this email because you subscribed to the Job Openings Kenya Weekly Opportunities.</p>
                    <p>&copy; ${new Date().getFullYear()} Job Openings Kenya. All rights reserved.<br>Empowering African Youth</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send email via Brevo API
        const bccList = subscribers.map(sub => ({ email: sub.email }));

        // Split into chunks if needed (Brevo limit is usually 50-100 per API call for BCC, let's assume 50)
        const chunkSize = 50;
        let sentCount = 0;

        for (let i = 0; i < bccList.length; i += chunkSize) {
            const chunk = bccList.slice(i, i + chunkSize);
            await sendEmail({
                to: [{ email: 'info.Job Openings Kenya@gmail.com', name: 'Job Openings Kenya Admin' }],
                bcc: chunk,
                subject: '🔥 Your Weekly Top 5 Opportunities - Job Openings Kenya',
                htmlContent: htmlContent,
            });
            sentCount += chunk.length;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Newsletter sent successfully to ${sentCount} subscribers!`
        });

    } catch (error: any) {
        console.error('Error sending newsletter:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
