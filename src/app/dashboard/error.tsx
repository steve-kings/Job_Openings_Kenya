'use client'

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32} className="text-blue-600" />
                </div>

                <h1 className="text-xl font-bold text-gray-900 mb-2">
                    Dashboard Error
                </h1>
                <p className="text-gray-500 mb-6">
                    An error occurred while loading your dashboard. Please try again.
                </p>

                {error.digest && (
                    <p className="text-xs text-gray-400 mb-4 font-mono">
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
                        href="/dashboard"
                        className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:bg-gray-100 gap-2 px-4 py-2 rounded-lg font-medium"
                    >
                        <Home size={16} />
                        Dashboard Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
