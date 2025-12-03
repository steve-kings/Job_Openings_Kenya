'use client'

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const supabase = createClient();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            setSuccess('Login successful! Redirecting...');
            
            // Check if user is admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            setTimeout(() => {
                if (profile?.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            }, 1000);

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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            setSuccess('Account created successfully! Please check your email to verify your account.');
            setEmail('');
            setPassword('');
            setFullName('');
            
            // Switch to login form after 3 seconds
            setTimeout(() => {
                setIsLogin(true);
                setSuccess('');
            }, 3000);

        } catch (error: any) {
            setError(error.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-[#C44536]">
                    {/* Logo */}
                    <div className="flex justify-center pt-8">
                        <img 
                            src="/images/yena logo.jpeg" 
                            alt="YENA Logo" 
                            className="h-20 w-auto object-contain"
                        />
                    </div>
                    
                    {/* Header with Tabs */}
                    <div className="bg-gradient-to-r from-[#C44536] via-[#F39C12] to-[#8B3A3A] p-6 mt-4">
                        <h2 className="text-3xl font-bold text-white text-center mb-6">
                            Welcome to YENA
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsLogin(true);
                                    setError('');
                                    setSuccess('');
                                }}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                                    isLogin
                                        ? 'bg-white text-[#C44536]'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    setIsLogin(false);
                                    setError('');
                                    setSuccess('');
                                }}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                                    !isLogin
                                        ? 'bg-white text-[#C44536]'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Error/Success Messages */}
                        {error && (
                            <div className="alert alert-error mb-4">
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success mb-4">
                                <span>{success}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        {isLogin ? (
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Email</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </span>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            className="input input-bordered w-full pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Password</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input input-bordered w-full pl-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn bg-gradient-to-r from-[#C44536] to-[#F39C12] text-white hover:opacity-90 border-none w-full btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        ) : (
                            /* Signup Form */
                            <form onSubmit={handleEmailSignup} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Full Name</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="e.g., Wanjiku Kamau"
                                            className="input input-bordered w-full pl-10"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Email</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </span>
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            className="input input-bordered w-full pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Password</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input input-bordered w-full pl-10"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <label className="label">
                                        <span className="label-text-alt">Minimum 6 characters</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="btn bg-gradient-to-r from-[#C44536] to-[#F39C12] text-white hover:opacity-90 border-none w-full btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating account...' : 'Sign Up'}
                                </button>
                            </form>
                        )}

                        {/* Divider */}
                        <div className="divider my-6">OR</div>

                        {/* Google Login */}
                        <button
                            onClick={handleGoogleLogin}
                            className="btn btn-outline border-2 border-[#C44536] text-[#C44536] hover:bg-[#C44536] hover:text-white w-full btn-lg gap-2"
                        >
                            <FontAwesomeIcon icon={faGoogle} className="text-xl" />
                            Continue with Google
                        </button>

                        {/* Footer Text */}
                        <p className="text-center text-sm text-gray-600 mt-6">
                            {isLogin ? (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setIsLogin(false)}
                                        className="text-[#C44536] font-semibold hover:underline"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setIsLogin(true)}
                                        className="text-[#C44536] font-semibold hover:underline"
                                    >
                                        Login
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
