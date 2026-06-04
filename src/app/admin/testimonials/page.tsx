'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Trash2, User, Quote, Loader2, RefreshCcw, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function AdminTestimonialsPage() {
    const supabase = createClient();
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setTestimonials(data);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        setActionLoading(id);
        const { error } = await supabase
            .from('testimonials')
            .update({ status })
            .eq('id', id);
        
        if (!error) {
            setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        }
        setActionLoading(null);
    };

    const deleteTestimonial = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        setActionLoading(id);
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);
        
        if (!error) {
            setTestimonials(prev => prev.filter(t => t.id !== id));
        }
        setActionLoading(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage Testimonials</h1>
                    <p className="text-gray-600">Review and approve user success stories</p>
                </div>
                <button 
                    onClick={fetchTestimonials}
                    className="btn btn-sm sm:btn-md bg-white border-gray-200 text-gray-700 hover:bg-gray-50 gap-2"
                >
                    <RefreshCcw size={16} /> Refresh
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#5CB800]" size={40} />
                </div>
            ) : testimonials.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Quote className="mx-auto text-gray-300 mb-4" size={60} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Testimonials Yet</h3>
                    <p className="text-gray-500">When users submit success stories, they will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {testimonials.map(t => (
                        <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6">
                            {/* User Info */}
                            <div className="w-full md:w-64 shrink-0 flex flex-col items-center text-center space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                {t.user_photo_url ? (
                                    <img src={t.user_photo_url} alt={t.user_name} className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-[#5CB800]/10 text-[#5CB800] flex items-center justify-center font-bold text-2xl shadow-sm border-2 border-white">
                                        {t.user_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-900 leading-tight">{t.user_name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    t.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {t.status}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-[#5CB800] mb-3 flex items-start gap-2">
                                        <Sparkles size={20} className="shrink-0 mt-0.5" />
                                        Won: {t.opportunity_won}
                                    </h3>
                                    <div className="relative bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                                        <Quote size={40} className="absolute top-2 left-2 text-[#5CB800]/10" />
                                        <p className="text-gray-700 leading-relaxed relative z-10 whitespace-pre-wrap pl-6 italic">
                                            "{t.story}"
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                                    {t.status !== 'approved' && (
                                        <button 
                                            onClick={() => updateStatus(t.id, 'approved')}
                                            disabled={actionLoading === t.id}
                                            className="btn btn-sm bg-[#5CB800] hover:bg-[#4A9900] text-white border-none gap-1.5"
                                        >
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                    )}
                                    {t.status !== 'rejected' && (
                                        <button 
                                            onClick={() => updateStatus(t.id, 'rejected')}
                                            disabled={actionLoading === t.id}
                                            className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 border-none gap-1.5"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => deleteTestimonial(t.id)}
                                        disabled={actionLoading === t.id}
                                        className="btn btn-sm bg-red-50 hover:bg-red-100 text-red-600 border-none gap-1.5"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
