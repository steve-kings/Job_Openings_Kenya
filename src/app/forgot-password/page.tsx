'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getBaseUrl } from '@/lib/utils/url';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${getBaseUrl()}/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/40 py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 overflow-hidden border border-gray-100">
                    {/* Logo */}
                    <div className="flex justify-center pt-8 pb-2">
                        <Image
                            src="/job_openings_kenya_logo.jpeg"
                            alt="Job Openings Kenya Logo"
                            width={160}
                            height={64}
                            className="h-16 w-auto object-contain"
                        />
                    </div>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 pt-5 pb-6">
                        <h2 className="text-2xl font-black text-white text-center tracking-tight">
                            Forgot Password?
                        </h2>
                        <p className="text-white/85 text-center text-sm mt-2 font-medium">
                            No worries! Enter your email and we&apos;ll send you a reset link.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8">
                        {success ? (
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Check Your Email</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    We&apos;ve sent a password reset link to <strong>{email}</strong>.
                                    Please check your inbox and follow the instructions.
                                </p>
                                <p className="text-xs text-gray-400 mb-6 font-medium">
                                    Didn&apos;t receive it? Check your spam folder or try again.
                                </p>
                                <div className="space-y-2.5">
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="w-full py-2.5 rounded-xl border-2 border-emerald-500 text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition-all"
                                    >
                                        Try Another Email
                                    </button>
                                    <Link href="/login" className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white text-sm font-bold text-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all">
                                        Back to Login
                                    </Link>
                                </div>
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="e.g., wanjiku@example.com"
                                            className={inputCls}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
                                </button>

                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-bold transition-colors"
                                >
                                    <ArrowLeft size={14} />
                                    Back to Login
                                </Link>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

