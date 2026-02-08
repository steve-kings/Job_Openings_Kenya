import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
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
                // Check if profile exists, if not create one for OAuth users
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user.id)
                    .single()

                if (!profile) {
                    // Create profile for OAuth user
                    await supabase.from('profiles').insert({
                        id: data.user.id,
                        full_name: data.user.user_metadata.full_name || data.user.user_metadata.name || 'User',
                        role: 'user'
                    })
                }

                // Check if user is admin
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                // Redirect based on role
                if (userProfile?.role === 'admin') {
                    return NextResponse.redirect(`${origin}/admin`)
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
