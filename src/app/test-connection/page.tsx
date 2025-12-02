'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestSupabasePage() {
    const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
    const [opportunitiesCount, setOpportunitiesCount] = useState(0);
    const [coursesCount, setCoursesCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function testConnection() {
            try {
                const supabase = createClient();

                // Test 1: Fetch opportunities
                const { data: opportunities, error: oppError } = await supabase
                    .from('opportunities')
                    .select('*')
                    .eq('status', 'active');

                if (oppError) throw oppError;

                // Test 2: Fetch courses
                const { data: courses, error: coursesError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('status', 'published');

                if (coursesError) throw coursesError;

                setOpportunitiesCount(opportunities?.length || 0);
                setCoursesCount(courses?.length || 0);
                setConnectionStatus('success');
            } catch (err: any) {
                setError(err.message);
                setConnectionStatus('error');
            }
        }

        testConnection();
    }, []);

    return (
        <div className="container-custom py-10">
            <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
                <div className="card-body">
                    <h1 className="text-3xl font-bold text-center mb-6">🔌 Supabase Connection Test</h1>

                    {connectionStatus === 'testing' && (
                        <div className="text-center py-8">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p className="mt-4 text-gray-600">Testing connection...</p>
                        </div>
                    )}

                    {connectionStatus === 'success' && (
                        <div className="alert alert-success">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <h3 className="font-bold">Connection Successful!</h3>
                                <div className="text-sm">
                                    <p>✅ Supabase is connected and working</p>
                                    <p>✅ Found {opportunitiesCount} opportunities</p>
                                    <p>✅ Found {coursesCount} courses</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {connectionStatus === 'error' && (
                        <div className="alert alert-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <h3 className="font-bold">Connection Error</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="divider"></div>

                    <div className="space-y-3">
                        <h2 className="font-bold text-lg">Configuration Details:</h2>
                        <div className="bg-base-200 p-4 rounded-lg space-y-2 text-sm font-mono">
                            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Not set'}</p>
                            <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="space-y-3">
                        <h2 className="font-bold text-lg">Next Steps:</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Make sure you've run the SQL setup script in Supabase</li>
                            <li>Enable Google authentication in Supabase dashboard</li>
                            <li>Create your admin user and set role to 'admin'</li>
                            <li>Start creating content in the admin dashboard!</li>
                        </ol>
                    </div>

                    <div className="card-actions justify-center mt-6">
                        <a href="/" className="btn btn-primary">Go to Home</a>
                        <a href="/admin" className="btn btn-secondary">Admin Dashboard</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
