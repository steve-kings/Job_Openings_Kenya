'use client'

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Quote, Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import Link from 'next/link';

export default function FeedbackPage() {
    const supabase = useMemo(() => createClient(), []);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [user, setUser] = useState<{ id: string } | null>(null);

    const [formData, setFormData] = useState({
        user_name: '',
        opportunity_won: '',
        story: '',
    });
    const [photoUrl, setPhotoUrl] = useState('');
    const [existingTestimonial, setExistingTestimonial] = useState<{ status: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Pre-fill name from profile if possible
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    setFormData(prev => ({ ...prev, user_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() }));
                    if (profile.avatar_url) setPhotoUrl(profile.avatar_url);
                }

                // Check if they already submitted a testimonial
                const { data: testimonial } = await supabase
                    .from('testimonials')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                if (testimonial) {
                    setExistingTestimonial(testimonial);
                }
            }
        };
        fetchUser();
    }, [supabase]);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('testimonials').insert({
                user_id: user.id,
                user_name: formData.user_name,
                user_photo_url: photoUrl,
                opportunity_won: formData.opportunity_won,
                story: formData.story,
                status: 'pending' // Default status
            });

            if (error) throw error;
            
            showToast('success', 'Your success story has been submitted for review! Thank you!');
            setFormData({ user_name: '', opportunity_won: '', story: '' });
            setPhotoUrl('');
            
            // Refresh existing testimonial state
            const { data: testimonial } = await supabase
                .from('testimonials')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (testimonial) setExistingTestimonial(testimonial);

        } catch (error: unknown) {
            showToast('error', error instanceof Error ? error.message : 'Failed to submit success story.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5CB800] focus:ring-2 focus:ring-[#5CB800]/20 outline-none text-sm text-gray-700 bg-gray-50 transition-all";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-[#5CB800]' : 'bg-red-500'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] rounded-3xl p-8 sm:p-10 text-white shadow-lg flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Sparkles size={40} className="text-yellow-300" />
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold mb-2">Share Your Success Story</h1>
                    <p className="text-white/90">Did you land a job or training opportunity through Job Openings Kenya? Inspire others by sharing your journey!</p>
                </div>
            </div>

            {existingTestimonial && existingTestimonial.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-yellow-800 flex items-start gap-4">
                    <AlertCircle className="shrink-0 mt-0.5 text-yellow-600" />
                    <div>
                        <h3 className="font-bold mb-1 text-yellow-900">Testimonial Under Review</h3>
                        <p className="text-sm">Thank you for sharing your story! Our team is currently reviewing it. Once approved, it will be featured on our public Discover page to inspire thousands of Kenyan job seekers.</p>
                    </div>
                </div>
            )}

            {existingTestimonial && existingTestimonial.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-green-800 flex items-start gap-4">
                    <CheckCircle className="shrink-0 mt-0.5 text-green-600" />
                    <div>
                        <h3 className="font-bold mb-1 text-green-900">Your Story is Live!</h3>
                        <p className="text-sm">Your success story has been approved and is now featured on the <Link href="/discover" className="underline font-bold">Discover More</Link> page. Thank you for inspiring others!</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Your Full Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.user_name}
                                    onChange={e => setFormData({...formData, user_name: e.target.value})}
                                    placeholder="e.g. John Doe"
                                    className={inputCls}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Opportunity Won <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.opportunity_won}
                                    onChange={e => setFormData({...formData, opportunity_won: e.target.value})}
                                    placeholder="e.g. Software Engineer at Safaricom"
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Your Photo (Optional)</label>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <CloudinaryUpload 
                                    onUploadComplete={(url) => setPhotoUrl(url)}
                                    currentImage={photoUrl}
                                    folder="Job Openings Kenya-testimonials"
                                    label="Upload Headshot"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex justify-between">
                                <span>Your Story <span className="text-red-500">*</span></span>
                                <span className="text-gray-400 font-normal">Min 100 characters</span>
                            </label>
                            <textarea 
                                required
                                minLength={100}
                                rows={6}
                                value={formData.story}
                                onChange={e => setFormData({...formData, story: e.target.value})}
                                placeholder="Tell us how Job Openings Kenya helped you land this opportunity. What was your experience like? What advice would you give to other job seekers?"
                                className={`${inputCls} resize-none`}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={loading || !user || formData.story.length < 100}
                                className="w-full py-4 bg-[#5CB800] hover:bg-[#4A9900] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Quote size={20} />}
                                {loading ? 'Submitting...' : 'Submit Success Story'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
