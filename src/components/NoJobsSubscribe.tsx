'use client';

import { useState } from 'react';
import { Loader2, Bell, CheckCircle } from 'lucide-react';

export default function NoJobsSubscribe({ query, type, location }: { query: string; type: string; location: string }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    preferences: { query, type, location },
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to subscribe');

            setEmail('');
            setMessage({ type: 'success', text: 'You\'re subscribed! We\'ll email you when matching jobs arrive.' });
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to subscribe' });
        } finally {
            setLoading(false);
        }
    };

    if (message.type === 'success') {
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700">
                <CheckCircle size={16} />
                {message.text}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-2">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Bell size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        className="w-full rounded-lg border border-blue-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Subscribe'}
                </button>
            </div>
            {message.text && message.type === 'error' && (
                <p className="text-xs text-red-600">{message.text}</p>
            )}
        </form>
    );
}
