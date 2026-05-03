import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/utils/url';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: job } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (!job) {
        return new ImageResponse(
            (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#fff' }}>
                    <h1>Opportunity Not Found</h1>
                </div>
            ), { width: 1200, height: 630 }
        );
    }

    const siteUrl = getBaseUrl();
    const logoUrl = `${siteUrl}/1000jobs_logo.jpeg`;
    
    // Fallback if company logo isn't available, use thumbnail or main logo
    const companyImageUrl = job.thumbnail_url || logoUrl;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    backgroundImage: 'linear-gradient(to bottom right, #f8fafc, #e0f2fe)',
                    padding: '80px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Header Logo */}
                <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', top: '40px', left: '80px' }}>
                    <img src={logoUrl} alt="1000Jobs" width="60" height="60" style={{ borderRadius: '12px', marginRight: '16px' }} />
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976D2' }}>1000Jobs</span>
                </div>

                {/* Job Title */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '40px' }}>
                    <h1 style={{ fontSize: '72px', fontWeight: '800', color: '#0f172a', margin: '0 0 24px 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        {job.title.length > 80 ? job.title.substring(0, 80) + '...' : job.title}
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
                        {/* Company Logo or Icon */}
                        {companyImageUrl && (
                            <img src={companyImageUrl} alt={job.company} width="50" height="50" style={{ borderRadius: '8px', marginRight: '20px', objectFit: 'cover' }} />
                        )}
                        <span style={{ fontSize: '40px', color: '#334155', fontWeight: '600' }}>
                            {job.company}
                        </span>
                    </div>

                    {/* Metadata Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                        {job.location && (
                            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 32px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '100px', fontSize: '32px', fontWeight: '600' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {job.location}
                            </div>
                        )}
                        {job.type && (
                            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 32px', backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: '100px', fontSize: '32px', fontWeight: '600', textTransform: 'capitalize' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                                {job.type.replace('_', ' ')}
                            </div>
                        )}
                        {job.salary_range && (
                            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 32px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '100px', fontSize: '32px', fontWeight: '600' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                                {job.salary_range}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Decor */}
                <div style={{ position: 'absolute', bottom: '40px', right: '80px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '32px', color: '#64748b' }}>Apply now at </span>
                    <span style={{ fontSize: '32px', color: '#1976D2', fontWeight: 'bold', marginLeft: '12px' }}>1000jobs.org</span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
