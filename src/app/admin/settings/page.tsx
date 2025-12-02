'use client'

import { useState } from 'react';
import { seedDatabase } from '@/app/actions/seed';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSeed = async () => {
        if (!confirm('This will insert sample data into your database. Are you sure?')) return;

        setLoading(true);
        setMessage(null);

        try {
            const result = await seedDatabase();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-6">Admin Settings</h1>

            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title flex items-center gap-2">
                        <Database size={24} />
                        Database Management
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Use these tools to manage your database content.
                    </p>

                    <div className="divider"></div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Seed Sample Data</h3>
                            <p className="text-sm text-gray-500">
                                Populates the database with sample partners, opportunities, and blog posts.
                                Useful for testing or initial setup.
                            </p>
                        </div>
                        <button
                            onClick={handleSeed}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : 'Seed Database'}
                        </button>
                    </div>

                    {message && (
                        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{message.text}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
