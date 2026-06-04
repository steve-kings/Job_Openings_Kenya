'use client'

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { getBaseUrl } from '@/lib/utils/url';

// Inner component that uses useSearchParams
function LoginForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [accountType, setAccountType] = useState<'jobseeker' | 'employer'>('jobseeker');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const role = searchParams.get('role');
        const redirect = searchParams.get('redirect') || '';
        if (role === 'employer' || redirect.includes('/employer')) {
            setAccountType('employer');
            setIsLogin(false);
        }
    }, [searchParams]);

    const getRedirectUrl = (role: string) => {
        const redirect = searchParams.get('redirect');
        if (redirect) return redirect;
        if (role === 'admin') return '/admin';
        if (role === 'employer') return '/employer/dashboard';
        return '/dashboard';
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${getBaseUrl()}/auth/callback` },
        });
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            setSuccess('Login successful! Redirecting...');
            const { data: profile } = await supabase
                .from('profiles').select('role').eq('id', data.user.id).single();
            setTimeout(() => router.push(getRedirectUrl(profile?.role || 'student')), 1000);
        } catch (error: any) {
            setError(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const role = accountType === 'employer' ? 'employer' : 'student';
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, role } },
            });
            if (error) throw error;
            if (data.user && role === 'employer') {
                await supabase.from('profiles').update({ role: 'employer' }).eq('id', data.user.id);
            }
            setSuccess('Account created! Please check your email to verify your account.');
            setEmail(''); setPassword(''); setFullName('');
            setTimeout(() => { setIsLogin(true); setSuccess(''); }, 3000);
        } catch (error: any) {
            setError(error.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50 to-lime-50 py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-[#5CB800]">
                    {/* Logo */}
                    <div className="flex justify-center pt-8">
                        <img
                            src="/job_openings_kenya_logo.jpeg"
                            alt="Job Openings Kenya Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </div>

                    {/* Header with Tabs */}
                    <div className="bg-gradient-to-r from-[#5CB800] to-[#4A9900] p-6 mt-4">
                        <h2 className="text-3xl font-bold text-white text-center mb-6">
                            Welcome to Job Openings Kenya
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${isLogin ? 'bg-white text-[#5CB800]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${!isLogin ? 'bg-white text-[#5CB800]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}
                        {success && <div className="alert alert-success mb-4"><span>{success}</span></div>}

                        <button
                            onClick={handleGoogleLogin}
                            className="btn btn-outline border-2 border-[#5CB800] text-[#5CB800] hover:bg-[#5CB800] hover:text-white w-full btn-lg gap-2 mb-6"
                        >
                            <FontAwesomeIcon icon={faGoogle} className="text-xl" />
                            Continue with Google
                        </button>

                        <div className="divider my-6">OR</div>

                        {isLogin ? (
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Email</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </span>
                                        <input type="email" placeholder="your@email.com" className="input input-bordered w-full pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Password</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                        <input type="password" placeholder="••••••••" className="input input-bordered w-full pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                    <label className="label">
                                        <Link href="/forgot-password" className="label-text-alt text-[#5CB800] hover:text-[#4A9900] font-semibold transition-colors">
                                            Forgot Password?
                                        </Link>
                                    </label>
                                </div>
                                <button type="submit" className="btn bg-[#5CB800] text-white hover:bg-[#4A9900] border-none w-full btn-lg" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleEmailSignup} className="space-y-4">
                                {/* Account Type Selector */}
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">I am signing up as a</span></label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAccountType('jobseeker')}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${accountType === 'jobseeker' ? 'border-[#5CB800] bg-[#5CB800]/10 text-[#5CB800]' : 'border-gray-200 text-gray-600 hover:border-[#5CB800]/50'}`}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="text-xl" />
                                            <span className="font-semibold text-sm">Job Seeker</span>
                                            <span className="text-xs opacity-70">Find jobs & opportunities</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAccountType('employer')}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${accountType === 'employer' ? 'border-[#4A9900] bg-[#4A9900]/10 text-[#4A9900]' : 'border-gray-200 text-gray-600 hover:border-[#4A9900]/50'}`}
                                        >
                                            <FontAwesomeIcon icon={faBuilding} className="text-xl" />
                                            <span className="font-semibold text-sm">Employer</span>
                                            <span className="text-xs opacity-70">Post jobs & hire talent</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Full Name</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder={accountType === 'employer' ? 'e.g., John Kamau (Contact Person)' : 'e.g., Wanjiku Kamau'}
                                            className="input input-bordered w-full pl-10"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Email</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </span>
                                        <input type="email" placeholder="your@email.com" className="input input-bordered w-full pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text font-semibold">Password</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                        <input type="password" placeholder="••••••••" className="input input-bordered w-full pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                                    </div>
                                    <label className="label"><span className="label-text-alt">Minimum 6 characters</span></label>
                                </div>

                                <button type="submit" className="btn bg-[#5CB800] text-white hover:bg-[#4A9900] border-none w-full btn-lg" disabled={loading}>
                                    {loading ? 'Creating account...' : `Sign Up as ${accountType === 'employer' ? 'Employer' : 'Job Seeker'}`}
                                </button>
                            </form>
                        )}

                        <p className="text-center text-sm text-gray-600 mt-6">
                            {isLogin ? (
                                <>Don&apos;t have an account?{' '}
                                    <button onClick={() => setIsLogin(false)} className="text-[#5CB800] font-semibold hover:underline">Sign up</button>
                                </>
                            ) : (
                                <>Already have an account?{' '}
                                    <button onClick={() => setIsLogin(true)} className="text-[#5CB800] font-semibold hover:underline">Login</button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Default export wrapped in Suspense (required for useSearchParams)
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-[#5CB800]"></span>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
