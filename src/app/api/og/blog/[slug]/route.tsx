import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { getBaseUrl } from '@/lib/utils/url';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const resolvedParams = await params;
    const supabase = await createClient();
    
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

    if (!post) {
        return new ImageResponse(
            (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#fff' }}>
                    <h1>Article Not Found</h1>
                </div>
            ), { width: 1200, height: 630 }
        );
    }

    const siteUrl = getBaseUrl();
    const logoUrl = `${siteUrl}/job_openings_kenya_logo.jpeg`;
    
    const featuredImage = post.featured_image;

    // Format date
    const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundColor: '#ffffff',
                    fontFamily: 'sans-serif',
                    overflow: 'hidden'
                }}
            >
                {/* Left Content Column */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: featuredImage ? '60%' : '100%',
                    padding: '80px',
                    backgroundColor: '#f8fafc',
                    borderRight: featuredImage ? '2px solid #e2e8f0' : 'none',
                }}>
                    {/* Header Logo */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) only supports raw <img>, not next/image */}
                        <img src={logoUrl} alt="Job Openings Kenya" width="60" height="60" style={{ borderRadius: '12px', marginRight: '16px' }} />
                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#5CB800' }}>Job Openings Kenya Blog</span>
                    </div>

                    {/* Article Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px', marginBottom: '20px' }}>
                        <h1 style={{ 
                            fontSize: post.title.length > 60 ? '56px' : '64px', 
                            fontWeight: '800', 
                            color: '#0f172a', 
                            lineHeight: 1.2, 
                            letterSpacing: '-0.02em',
                            margin: 0
                        }}>
                            {post.title}
                        </h1>
                    </div>

                    {/* Footer Metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#5CB800', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold', marginRight: '16px' }}>
                                {post.author_name ? post.author_name[0].toUpperCase() : 'A'}
                            </div>
                            <span style={{ fontSize: '32px', color: '#334155', fontWeight: '600' }}>
                                {post.author_name || 'Job Openings Kenya Team'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '28px', color: '#64748b' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {dateStr}
                        </div>
                    </div>
                </div>

                {/* Right Image Column */}
                {featuredImage && (
                    <div style={{
                        display: 'flex',
                        width: '40%',
                        height: '100%',
                        position: 'relative'
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) only supports raw <img>, not next/image */}
                        <img 
                            src={featuredImage} 
                            alt=""
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                            }} 
                        />
                    </div>
                )}
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
