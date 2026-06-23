'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCodeHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            (async () => {
                const supabase = createClient();
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (!error && data.user) {
                    // Check role and redirect
                    const { data: profile } = await supabase
                        .from('profiles').select('role').eq('id', data.user.id).single();
                    if (profile?.role === 'admin') router.push('/admin');
                    else if (profile?.role === 'employer') router.push('/employer/dashboard');
                    else router.push('/dashboard');
                } else {
                    router.push('/login?error=auth_failed');
                }
            })();
        }
    }, []); // Only run once on mount

    return null;
}
