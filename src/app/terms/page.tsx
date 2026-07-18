import type { Metadata } from 'next';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';
import { FileText, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service | Job Openings Kenya',
    alternates: { canonical: '/terms' },
    description: 'Terms of Service for Job Openings Kenya — rules, guidelines, and conditions for using our platform.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="relative overflow-hidden min-h-[240px] sm:min-h-[280px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
                    <ScrollReveal>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                                <FileText size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-lg">Terms of Service</h1>
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
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing or using Job Openings Kenya (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">2. Description of Service</h2>
                            <p>Job Openings Kenya is an online job board that helps job seekers discover opportunities across Kenya. The Platform lists job openings, training programs, internships, and career resources. We also provide tools for application tracking, saved searches, and community discussions.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">3. User Accounts</h2>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li>You must provide accurate and complete information when creating an account.</li>
                                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                                <li>You must be at least 16 years old to use the Platform.</li>
                                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">4. Job Listings & Content</h2>
                            <ul className="list-disc pl-6 space-y-1.5">
                                <li>Employer submissions may be reviewed editorially; approved external feeds may be screened and published automatically.</li>
                                <li>Automated external listings are identified and should be confirmed on their linked source page.</li>
                                <li>Employers are responsible for the accuracy of their job postings.</li>
                                <li>We do not guarantee that listed opportunities are still available at the time of application.</li>
                                <li>We reserve the right to remove any listing or content at our discretion.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">5. User Conduct</h2>
                            <p>When using the Platform, you agree <strong>not</strong> to:</p>
                            <ul className="list-disc pl-6 space-y-1.5 mt-2">
                                <li>Post false, misleading, or fraudulent job listings.</li>
                                <li>Harass, abuse, or harm other users.</li>
                                <li>Use the Platform for any illegal or unauthorized purpose.</li>
                                <li>Upload viruses, malware, or malicious code.</li>
                                <li>Scrape, data-mine, or systematically extract content without permission.</li>
                                <li>Impersonate any person or organization.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">6. Intellectual Property</h2>
                            <p>All content on the Platform — including text, graphics, logos, and software — is the property of Job Openings Kenya or its content suppliers and is protected by Kenyan and international copyright laws. Job listings posted by employers remain the property of those employers.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">7. Limitation of Liability</h2>
                            <p>Job Openings Kenya acts as a platform connecting job seekers with employers. We are <strong>not</strong> a party to any employment contract that may result from using our Platform. We do not guarantee employment. We are not liable for any damages arising from your use of the Platform, including but not limited to direct, indirect, incidental, or consequential damages.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">8. Third-Party Links & Services</h2>
                            <p>The Platform links to external websites such as KingsLearn (kingslearn.co.ke), employer career portals, and WhatsApp. These third-party services have their own terms and policies. We are not responsible for their content or practices.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">9. Termination</h2>
                            <p>We may terminate or suspend your access to the Platform immediately, without prior notice, for any violation of these Terms. Upon termination, your right to use the Platform will cease immediately.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">10. Governing Law</h2>
                            <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of Kenyan courts.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">11. Changes to Terms</h2>
                            <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on this page. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-extrabold text-slate-900 mb-3">12. Contact</h2>
                            <p>For questions about these Terms of Service, contact us:</p>
                            <ul className="list-disc pl-6 space-y-1.5 mt-2">
                                <li>Email: <a href="mailto:info@jobopenings.co.ke" className="text-emerald-600 font-bold hover:underline">info@jobopenings.co.ke</a></li>
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
