'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

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

    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) setIsValidSession(true);
            setCheckingSession(false);
        };
        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') setIsValidSession(true);
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 25, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
        if (password.length < 8) return { strength: 50, label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-500' };
        if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            return { strength: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
        }
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            return { strength: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
        }
        return { strength: 50, label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-500' };
    };
    const strength = getPasswordStrength();

    const inputCls = "w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white";

    if (checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40">
                <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" />
                    <p className="mt-4 text-sm text-gray-500 font-medium">Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    if (!isValidSession && !checkingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 overflow-hidden border border-gray-100 p-8 text-center">
                        <div className="flex justify-center pt-4 pb-2">
                            <Image src="/job_openings_kenya_logo.jpeg" alt="Logo" width={100} height={64} className="h-16 w-auto object-contain" />
                        </div>
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                            <ShieldAlert size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Invalid or Expired Link</h3>
                        <p className="text-sm text-gray-500 mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
                        <Link href="/forgot-password" className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white text-sm font-bold text-center shadow-lg shadow-emerald-500/20 transition-all">
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 overflow-hidden border border-gray-100">
                    <div className="flex justify-center pt-8 pb-2">
                        <Image src="/job_openings_kenya_logo.jpeg" alt="Logo" width={100} height={64} className="h-16 w-auto object-contain" />
                    </div>
                    <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 pt-5 pb-6">
                        <h2 className="text-2xl font-black text-white text-center tracking-tight">Create New Password</h2>
                        <p className="text-white/85 text-center text-sm mt-2 font-medium">Enter your new password below</p>
                    </div>
                    <div className="p-6 sm:p-8">
                        {success ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Password Reset Successful!</h3>
                                <p className="text-sm text-gray-500 mb-6">Your password has been updated. Redirecting to login...</p>
                                <Link href="/login" className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white text-sm font-bold text-center shadow-lg shadow-emerald-500/20 transition-all">
                                    Go to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                {error && (
                                    <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-700 text-sm font-semibold">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            className={inputCls}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {password.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-[11px] mb-1">
                                                <span className="text-gray-400 font-semibold">Password strength</span>
                                                <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: `${strength.strength}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm new password"
                                            className={`${inputCls} ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-[11px] text-red-500 mt-1 font-semibold">Passwords do not match</p>
                                    )}
                                    {confirmPassword && password === confirmPassword && (
                                        <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Passwords match</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || password !== confirmPassword}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

