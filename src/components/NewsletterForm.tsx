'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function NewsletterForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const form = e.target as HTMLFormElement;
        const emailInput = form.elements.namedItem('email') as HTMLInputElement;

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            emailInput.value = '';
            setMessage({ type: 'success', text: 'Thanks for subscribing! Check your inbox soon.' });
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to subscribe' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 outline-none focus:border-emerald-400 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="shrink-0 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Subscribe'}
                </button>
            </form>
            {message.text && (
                <p className={`text-xs mt-2 font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
