'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
        } catch (error: any) {
            setError(error.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-red-50 py-12 px-4">
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

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#5CB800] via-[#5CB800] to-[#4A9900] p-6 mt-4">
                        <h2 className="text-2xl font-bold text-white text-center">
                            Forgot Password?
                        </h2>
                        <p className="text-white/90 text-center text-sm mt-2">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 bg-[#5CB800]/10 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-[#5CB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                                <p className="text-gray-600 mb-6">
                                    We've sent a password reset link to <strong>{email}</strong>. 
                                    Please check your inbox and follow the instructions.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="btn btn-outline border-[#5CB800] text-[#5CB800] hover:bg-[#5CB800] hover:text-white w-full"
                                    >
                                        Try Another Email
                                    </button>
                                    <Link href="/login" className="btn bg-[#5CB800] text-white border-none hover:bg-[#4A9900] w-full">
                                        Back to Login
                                    </Link>
                                </div>
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
                                        <span className="label-text font-semibold">Email Address</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FontAwesomeIcon icon={faEnvelope} />
                                        </span>
                                        <input
                                            type="email"
                                            placeholder="e.g., wanjiku@example.com"
                                            className="input input-bordered w-full pl-10 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn bg-[#5CB800] text-white hover:bg-[#4A9900] border-none w-full btn-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>

                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-[#5CB800] hover:text-[#4A9900] font-semibold transition-colors"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
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

