'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html lang="en" data-theme="jobopeningskenya">
            <body className="min-h-screen bg-base-100">
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-gray-500 mb-8">
                            We&apos;re sorry, but an unexpected error occurred. Please try again or return to the home page.
                        </p>

                        {error.digest && (
                            <p className="text-xs text-gray-400 mb-6 font-mono">
                                Error ID: {error.digest}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center bg-[#5CB800] hover:bg-[#4A9900] text-white gap-2 px-4 py-2 rounded-lg font-medium"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:bg-gray-100 gap-2 px-4 py-2 rounded-lg font-medium"
                            >
                                <Home size={16} />
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
