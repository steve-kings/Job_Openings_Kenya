import type { Metadata } from 'next';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';
import { Shield, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy | Job Openings Kenya',
    description: 'Privacy Policy for Job Openings Kenya — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="relative overflow-hidden min-h-[240px] sm:min-h-[280px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
                    <ScrollReveal>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                                <Shield size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-lg">Privacy Policy</h1>
                                <p className="text-sm text-white/60 mt-0.5">Last updated: June 2026</p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <ScrollReveal>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-8 text-slate-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">1. Introduction</h2>
                            <p>Job Openings Kenya (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>jobopeningskenya.co.ke</strong> (the &ldquo;Platform&rdquo;). Please read this policy carefully. By using the Platform, you agree to the collection and use of information in accordance with this policy.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">2. Information We Collect</h2>
                            <p className="mb-2">We may collect the following types of information:</p>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li><strong>Personal Information:</strong> When you register, we may collect your name, email address, and profile details you voluntarily provide.</li>
                                <li><strong>Usage Data:</strong> We automatically collect information about how you interact with the Platform — pages visited, time spent, clicks, and referring URLs.</li>
                                <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to improve your browsing experience and analyze traffic.</li>
                                <li><strong>Job Application Data:</strong> Jobs you save, applications you track, and searches you perform.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li>To provide and maintain our Platform and its features.</li>
                                <li>To personalize your experience and show relevant job recommendations.</li>
                                <li>To send newsletters and job alerts (only if you&apos;ve subscribed).</li>
                                <li>To communicate with you about account-related matters.</li>
                                <li>To detect and prevent fraudulent or unauthorized activity.</li>
                                <li>To analyze usage patterns and improve our services.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">4. Sharing Your Information</h2>
                            <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share information:</p>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li>With service providers who help us operate the Platform (e.g., hosting, email delivery).</li>
                                <li>If required by law, court order, or government regulation.</li>
                                <li>To protect the rights, property, or safety of Job Openings Kenya, our users, or the public.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">5. Data Security</h2>
                            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">6. Third-Party Links</h2>
                            <p>Our Platform may contain links to third-party websites (such as KingsLearn, employer career portals, or WhatsApp). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">7. Your Rights</h2>
                            <p>Under the Kenya Data Protection Act, 2019, you have the right to:</p>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li>Access the personal data we hold about you.</li>
                                <li>Request correction of inaccurate data.</li>
                                <li>Request deletion of your data.</li>
                                <li>Withdraw consent at any time.</li>
                                <li>Object to processing of your personal data.</li>
                            </ul>
                            <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:privacy@jobopeningskenya.co.ke" className="text-emerald-600 font-bold hover:underline">privacy@jobopeningskenya.co.ke</a>.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">8. Cookies Policy</h2>
                            <p>We use essential cookies for authentication and security. We also use analytics cookies (Google Analytics) to understand how visitors use our Platform. You can control cookie preferences through your browser settings.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">9. Changes to This Policy</h2>
                            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. Continued use of the Platform after changes constitutes acceptance of the updated policy.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">10. Contact Us</h2>
                            <p>If you have questions about this Privacy Policy, please contact us:</p>
                            <ul className="list-disc pl-6 space-y-1.5 mt-2">
                                <li>Email: <a href="mailto:info@jobopeningskenya.co.ke" className="text-emerald-600 font-bold hover:underline">info@jobopeningskenya.co.ke</a></li>
                                <li>Website: <Link href="/contact" className="text-emerald-600 font-bold hover:underline">Contact Page</Link></li>
                            </ul>
                        </section>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                            <ArrowRight size={15} className="rotate-180" /> Back to Home
                        </Link>
                    </div>
                </ScrollReveal>
            </div>

            <div className="h-12" />
        </div>
    );
}
