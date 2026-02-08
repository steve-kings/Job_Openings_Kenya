import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
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
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
