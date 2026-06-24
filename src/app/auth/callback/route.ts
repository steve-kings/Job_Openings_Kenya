import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/utils/url'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const origin = getBaseUrl()
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')
    const next = searchParams.get('next') ?? '/dashboard'

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, error_description)
        return NextResponse.redirect(`${origin}/login?error=${error}`)
    }

    if (code) {
        try {
            const supabase = await createClient()
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
                console.error('Exchange error:', exchangeError)
                return NextResponse.redirect(`${origin}/login?error=auth_failed`)
            }

            if (data.user) {
                // Determine the intended role from the next redirect path
                const intendedRole = next.includes('/employer') ? 'employer' : 'student';
                const googleName = data.user.user_metadata.full_name || data.user.user_metadata.name || '';
                const googleAvatar = data.user.user_metadata.avatar_url || data.user.user_metadata.picture || null;

                // Check if profile exists
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .eq('id', data.user.id)
                    .single()

                if (!profile) {
                    // Create profile for new OAuth user
                    await supabase.from('profiles').insert({
                        id: data.user.id,
                        full_name: googleName || 'User',
                        avatar_url: googleAvatar,
                        role: intendedRole,
                    })
                } else {
                    // Update existing profile — fill in missing fields from Google
                    const updates: Record<string, string | null> = {};
                    if (googleAvatar && !profile.avatar_url) {
                        updates.avatar_url = googleAvatar;
                    }
                    if (googleName && (!profile.full_name || profile.full_name.trim() === '')) {
                        updates.full_name = googleName;
                    }
                    // If profile was created by trigger with role 'student' but user is employer-intent
                    if (intendedRole === 'employer') {
                        const { data: current } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', data.user.id)
                            .single();
                        if (current?.role === 'student') {
                            updates.role = 'employer';
                        }
                    }
                    if (Object.keys(updates).length > 0) {
                        await supabase
                            .from('profiles')
                            .update(updates)
                            .eq('id', data.user.id);
                    }
                }

                // Fetch final role for redirect
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                // Redirect based on role
                if (userProfile?.role === 'admin') {
                    return NextResponse.redirect(`${origin}/admin`)
                }
                if (userProfile?.role === 'employer') {
                    return NextResponse.redirect(`${origin}/employer/dashboard`)
                }

                return NextResponse.redirect(`${origin}${next}`)
            }
        } catch (err) {
            console.error('Callback error:', err)
            return NextResponse.redirect(`${origin}/login?error=callback_failed`)
        }
    }

    // No code or error, redirect to login
    return NextResponse.redirect(`${origin}/login`)
}
