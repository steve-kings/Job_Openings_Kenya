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
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to subscribe' });
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
                    placeholder="Enter your email address" 
                    className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#4CAF50]"
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    className="btn bg-[#4CAF50] hover:bg-[#388E3C] text-white border-none px-6 w-[140px]"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Subscribe'}
                </button>
            </form>
            {message.text && (
                <p className={`text-sm mt-2 font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
