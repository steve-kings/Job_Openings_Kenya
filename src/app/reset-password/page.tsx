'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faCheck } from '@fortawesome/free-solid-svg-icons';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        // Check if user has a valid recovery session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                setIsValidSession(true);
            }
            setCheckingSession(false);
        };

        checkSession();

        // Listen for auth state changes (when user clicks the reset link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error: any) {
            setError(error.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
        if (password.length < 8) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
        if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 75, label: 'Good', color: 'bg-blue-500' };
        }
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            return { strength: 100, label: 'Strong', color: 'bg-green-500' };
        }
        return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    };

    const passwordStrength = getPasswordStrength();

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-[#C44536]"></span>
                    <p className="mt-4 text-gray-600">Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    if (!isValidSession && !checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-4 border-red-500 p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h3>
                        <p className="text-gray-600 mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link href="/forgot-password" className="btn bg-[#C44536] text-white border-none hover:bg-[#8B3A3A] w-full">
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#C44536] via-[#F39C12] to-[#8B3A3A] p-6 mt-4">
                        <h2 className="text-2xl font-bold text-white text-center">
                            Create New Password
                        </h2>
                        <p className="text-white/90 text-center text-sm mt-2">
                            Enter your new password below
                        </p>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faCheck} className="text-4xl text-[#10B981]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful!</h3>
                                <p className="text-gray-600 mb-6">
                                    Your password has been updated. Redirecting you to login...
                                </p>
                                <Link href="/login" className="btn bg-[#C44536] text-white border-none hover:bg-[#8B3A3A] w-full">
                                    Go to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                {error && (
                                    <div className="alert bg-red-50 border border-red-300 text-red-700">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">New Password</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            className="input input-bordered w-full pl-10 pr-10 focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                    {/* Password Strength Indicator */}
                                    {password.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500">Password strength</span>
                                                <span className={`font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                                    style={{ width: `${passwordStrength.strength}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Confirm Password</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm new password"
                                            className={`input input-bordered w-full pl-10 pr-10 focus:border-[#C44536] focus:ring-2 focus:ring-[#C44536]/20 ${
                                                confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                                            }`}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <label className="label">
                                            <span className="label-text-alt text-red-500">Passwords do not match</span>
                                        </label>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <label className="label">
                                            <span className="label-text-alt text-green-500 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCheck} /> Passwords match
                                            </span>
                                        </label>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none w-full btn-lg"
                                    disabled={loading || password !== confirmPassword}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
