import Link from 'next/link';
import NextImage from 'next/image';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-white mt-auto">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* Brand */}
                    <div className="space-y-5">
                        <NextImage
                            src="/job_openings_kenya_logo.jpeg"
                            alt="Job Openings Kenya"
                            width={120}
                            height={48}
                            className="h-12 w-auto object-contain"
                        />
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your trusted portal for the latest job openings, internships, and professional training opportunities across Kenya.
                        </p>
                        <div className="space-y-2.5 text-sm text-gray-400">
                            <a href="mailto:info@jobopeningskenya.co.ke" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Mail size={14} className="text-emerald-500" />
                                info@jobopeningskenya.co.ke
                            </a>
                            <a href="tel:+254790855690" className="flex items-center gap-2 hover:text-white transition-colors">
                                <Phone size={14} className="text-emerald-500" />
                                +254 790 855 690
                            </a>
                            <span className="flex items-center gap-2">
                                <MapPin size={14} className="text-emerald-500" />
                                Nairobi, Kenya
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-5">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {[
                                { href: '/', label: 'Home' },
                                { href: '/about', label: 'About Us' },
                                { href: '/jobs', label: 'Browse Jobs' },
                                { href: '/blog', label: 'Blog & Stories' },
                                { href: '/contact', label: 'Contact' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Portals */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-5">Portals</h4>
                        <ul className="space-y-2.5">
                            {[
                                { href: '/dashboard', label: 'Job Seeker Dashboard' },
                                { href: '/employer', label: 'Employer Portal' },
                                { href: '/employer/post', label: 'Post a Job' },
                                { href: '/talent', label: 'Talent Directory' },
                                { href: '/dashboard/applications', label: 'Application Tracker' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter + Social */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-5">Newsletter</h4>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                            Subscribe to get the latest job alerts and career tips delivered to your inbox.
                        </p>
                        <NewsletterForm />

                        <div className="mt-6">
                            <h5 className="text-xs font-black uppercase tracking-widest text-white mb-3">Follow Us</h5>
                            <div className="flex items-center gap-2.5">
                                {[
                                    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                                    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                                    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                                    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                                ].map(({ icon: Icon, href, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-emerald-500 flex items-center justify-center transition-colors"
                                    >
                                        <Icon size={16} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
                        <p>© {currentYear} Job Openings Kenya. All rights reserved.</p>
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                            <a href="https://kingscreation.co.ke" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Developed by KingsCreation.co.ke</a>
                            <span className="text-gray-600">|</span>
                            <span>0769956286</span>
                            <span className="text-gray-600">|</span>
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
