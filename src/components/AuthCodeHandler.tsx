'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CodeProcessor() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) return;

        const next = searchParams.get('next') || '/dashboard';

        let cancelled = false;
        (async () => {
            const supabase = createClient();
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (cancelled) return;
            if (!error && data.user) {
                // Populate profile fields from Google metadata if missing
                const googleName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || '';
                const googleAvatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name, avatar_url')
                    .eq('id', data.user.id)
                    .single();

                const intendedRole = next.includes('/employer') ? 'employer' : 'student';

                if (!profile) {
                    // Create profile if it doesn't exist (rare fallback case)
                    await supabase.from('profiles').insert({
                        id: data.user.id,
                        full_name: googleName || 'User',
                        avatar_url: googleAvatar,
                        role: intendedRole,
                    });
                } else {
                    // Fill in missing fields
                    const updates: Record<string, string | null> = {};
                    if (googleAvatar && !profile.avatar_url) updates.avatar_url = googleAvatar;
                    if (googleName && (!profile.full_name || profile.full_name.trim() === '')) updates.full_name = googleName;
                    if (intendedRole === 'employer' && profile.role === 'student') updates.role = 'employer';
                    if (Object.keys(updates).length > 0) {
                        await supabase.from('profiles').update(updates).eq('id', data.user.id);
                    }
                }

                // Fetch final role and redirect
                const { data: finalProfile } = await supabase
                    .from('profiles').select('role').eq('id', data.user.id).single();
                if (finalProfile?.role === 'admin') router.push('/admin');
                else if (finalProfile?.role === 'employer') router.push('/employer/dashboard');
                else router.push(next);
            } else {
                router.push('/login?error=auth_failed');
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return null;
}

export default function AuthCodeHandler() {
    return (
        <Suspense fallback={null}>
            <CodeProcessor />
        </Suspense>
    );
}
