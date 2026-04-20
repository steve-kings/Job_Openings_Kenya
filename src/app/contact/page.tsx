'use client'

import { useState } from 'react';
import { Mail, Phone, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormStatus('loading');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);

        try {
            // Web3Forms API endpoint
            // Add your Web3Forms Access Key in the hidden input below
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setFormStatus('success');
                (e.target as HTMLFormElement).reset();
                // Reset success message after 5 seconds
                setTimeout(() => setFormStatus('idle'), 5000);
            } else {
                setFormStatus('error');
                setErrorMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setFormStatus('error');
            setErrorMessage('Failed to send message. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#1976D2] via-[#4CAF50] to-[#1565C0] text-white py-16 lg:py-20">
                <div className="container mx-auto px-4 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-black mb-4">Get in Touch</h1>
                    <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
                        We're here to help you succeed. Reach out to us and let's start a conversation.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-t-4 border-[#1976D2]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1976D2] to-[#4CAF50] flex items-center justify-center">
                                    <MessageSquare className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Send us a Message</h2>
                                    <p className="text-gray-600">We'll get back to you within 24 hours</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* 
                                    WEB3FORMS INTEGRATION:
                                    Replace 'YOUR_ACCESS_KEY_HERE' with your actual Web3Forms access key
                                    Get your free access key at: https://web3forms.com
                                */}
                                <input type="hidden" name="access_key" value="0781f351-97bf-4b33-8b27-997af7828342" />
                                <input type="hidden" name="subject" value="New Contact Form Submission from 1000Jobs Website" />
                                <input type="hidden" name="from_name" value="1000Jobs Contact Form" />

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Full Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="e.g., Wanjiku Kamau"
                                            className="input input-bordered w-full focus:border-[#1976D2] focus:outline-none focus:ring-2 focus:ring-[#1976D2]/20"
                                            required
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Email Address</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="e.g., wanjiku@example.com"
                                            className="input input-bordered w-full focus:border-[#1976D2] focus:outline-none focus:ring-2 focus:ring-[#1976D2]/20"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Phone Number</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="e.g., +254 712 345 678"
                                            className="input input-bordered w-full focus:border-[#1976D2] focus:outline-none focus:ring-2 focus:ring-[#1976D2]/20"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Subject</span>
                                        </label>
                                        <select
                                            name="subject_category"
                                            className="select select-bordered w-full focus:border-[#1976D2] focus:outline-none focus:ring-2 focus:ring-[#1976D2]/20"
                                            required
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Course Information">Course Information</option>
                                            <option value="Partnership">Partnership Opportunity</option>
                                            <option value="Job Opportunity">Job Opportunity</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700">Your Message</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        className="textarea textarea-bordered h-40 focus:border-[#1976D2] focus:outline-none focus:ring-2 focus:ring-[#1976D2]/20"
                                        placeholder="Tell us how we can help you..."
                                        required
                                    ></textarea>
                                </div>

                                {/* Success Message */}
                                {formStatus === 'success' && (
                                    <div className="alert bg-[#4CAF50]/10 border border-[#4CAF50] text-[#4CAF50]">
                                        <CheckCircle size={20} />
                                        <span className="font-semibold">Message sent successfully! We'll get back to you soon.</span>
                                    </div>
                                )}

                                {/* Error Message */}
                                {formStatus === 'error' && (
                                    <div className="alert bg-red-50 border border-red-300 text-red-700">
                                        <AlertCircle size={20} />
                                        <span className="font-semibold">{errorMessage}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={formStatus === 'loading'}
                                    className="btn bg-[#1976D2] text-white border-none hover:bg-[#1565C0] w-full btn-lg disabled:opacity-50"
                                >
                                    {formStatus === 'loading' ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                        {/* Email Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-[#1976D2] hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#1976D2]/10 flex items-center justify-center">
                                    <Mail className="text-[#1976D2]" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Email Us</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">General Inquiries</p>
                                    <a href="mailto:info@1000jobs.org" className="text-[#1976D2] font-semibold hover:text-[#4CAF50] transition-colors">
                                        info@1000jobs.org
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Partnerships</p>
                                    <a href="mailto:partners@1000jobs.org" className="text-[#1976D2] font-semibold hover:text-[#4CAF50] transition-colors">
                                        partners@1000jobs.org
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-[#4CAF50] hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                                    <Phone className="text-[#4CAF50]" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Call Us</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                                    <a href="tel:+254752182132" className="text-[#4CAF50] font-semibold hover:text-[#1976D2] transition-colors text-lg">
                                        +254 752 182 132
                                    </a>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Available Monday - Friday</p>
                                    <p className="text-xs text-gray-500">9:00 AM - 5:00 PM EAT</p>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Card */}
                        <div className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] text-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                                <h3 className="text-xl font-bold">Join Our Community</h3>
                            </div>
                            <p className="mb-4 text-white/90">
                                Get daily opportunities, updates, and connect with other youth across Africa.
                            </p>
                            <a
                                href="https://whatsapp.com/channel/0029VbCAOUzDuMRgzkuhZe1e"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn bg-white text-[#4CAF50] hover:bg-gray-100 border-none w-full"
                            >
                                Join WhatsApp Channel
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
