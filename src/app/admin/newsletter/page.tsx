'use client';
import { useState, useEffect } from 'react';
import { Mail, Users, Send, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function NewsletterAdminPage() {
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [activeOppsCount, setActiveOppsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const supabase = createClient();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Count subscribers (graceful fail if table doesn't exist yet)
            const { count: subCount, error: subError } = await supabase
                .from('subscribers')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');
                
            if (!subError) {
                setSubscribersCount(subCount || 0);
            }

            // Count opportunities
            const { count: oppCount } = await supabase
                .from('opportunities')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');
                
            setActiveOppsCount(oppCount || 0);
            
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNewsletter = async () => {
        if (!confirm(`Are you sure you want to send the newsletter to ${subscribersCount} subscribers? This action cannot be undone.`)) return;
        
        setSending(true);
        setMessage({ type: '', text: '' });
        
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST'
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to send newsletter');
            
            setMessage({ type: 'success', text: data.message });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="animate-spin text-[#5CB800]" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-t-4 border-[#5CB800]">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-[#5CB800]/10 rounded-xl text-[#5CB800]">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Newsletter Management</h1>
                        <p className="text-gray-500">Send the weekly digest of top opportunities to your subscribers.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-[#5CB800]" size={24} />
                            <h2 className="card-title text-xl">Audience</h2>
                        </div>
                        <p className="text-4xl font-black text-gray-900 mb-1">{subscribersCount}</p>
                        <p className="text-gray-500">Active email subscribers</p>
                        
                        {subscribersCount === 0 && (
                            <div className="alert alert-warning mt-4 text-sm bg-yellow-50 text-yellow-800 border-yellow-200">
                                <AlertCircle size={16} />
                                <span>Nobody has subscribed yet! Make sure you ran the create-subscribers.sql script.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card bg-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="text-[#5CB800]" size={24} />
                            <h2 className="card-title text-xl">Content Ready</h2>
                        </div>
                        <p className="text-4xl font-black text-gray-900 mb-1">{activeOppsCount >= 5 ? '5' : activeOppsCount}</p>
                        <p className="text-gray-500">Opportunities will be featured</p>
                        
                        {activeOppsCount < 5 && (
                            <div className="alert alert-info mt-4 text-sm bg-blue-50 text-blue-800 border-blue-200">
                                <AlertCircle size={16} />
                                <span>Usually, 5 opportunities are sent. You currently only have {activeOppsCount} active.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card bg-white shadow-xl">
                <div className="card-body items-center text-center p-8 sm:p-12">
                    <div className="w-20 h-20 bg-[#5CB800]/10 rounded-full flex items-center justify-center text-[#5CB800] mb-6">
                        <Send size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Send Weekly Digest</h2>
                    <p className="text-gray-600 max-w-lg mx-auto mb-8">
                        This will automatically query the 5 most recent active opportunities and send them in a beautifully formatted email to all <strong>{subscribersCount}</strong> subscribers.
                    </p>

                    {message.text && (
                        <div className={`alert mb-6 ${message.type === 'success' ? 'alert-success text-white' : 'alert-error text-white'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <button
                        onClick={handleSendNewsletter}
                        disabled={sending || subscribersCount === 0}
                        className="btn btn-lg bg-[#5CB800] hover:bg-[#4A9900] text-white border-none gap-3 shadow-lg px-8"
                    >
                        {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                        {sending ? 'Sending...' : 'Dispatch Newsletter Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}
