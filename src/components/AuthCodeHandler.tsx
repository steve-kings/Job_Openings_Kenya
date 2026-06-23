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

        let cancelled = false;
        (async () => {
            const supabase = createClient();
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (cancelled) return;
            if (!error && data.user) {
                const { data: profile } = await supabase
                    .from('profiles').select('role').eq('id', data.user.id).single();
                if (profile?.role === 'admin') router.push('/admin');
                else if (profile?.role === 'employer') router.push('/employer/dashboard');
                else router.push('/dashboard');
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
