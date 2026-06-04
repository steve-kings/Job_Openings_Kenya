import Link from 'next/link';
import { Facebook, Linkedin, Mail, Phone, ExternalLink } from 'lucide-react';
import FooterInstallButton from './FooterInstallButton';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-[#4A9900] to-gray-900 text-white mt-auto">
            {/* Newsletter Section */}
            <div className="border-b border-white/10 bg-[#4A9900]/20">
                <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
                        <div className="text-center md:text-left flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">Subscribe to Weekly Job Alerts</h3>
                            <p className="text-gray-300 text-sm">Get the top 5 hand-picked jobs, grants, and scholarships delivered to your inbox every week.</p>
                        </div>
                        <div className="w-full md:w-auto flex-1 max-w-md">
                            <NewsletterForm />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="mb-4">
                            <img
                                src="/job_openings_kenya_logo.jpeg"
                                alt="Job Openings Kenya Logo"
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your go-to portal for the latest job openings, grants, scholarships, and opportunities in Kenya.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5CB800] flex items-center justify-center transition-all hover:scale-110">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#5CB800] flex items-center justify-center transition-all hover:scale-110">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#5CB800]">Quick Links</h4>
                        <ul className="space-y-2">
                            {[
                                { href: '/about', label: 'About Us' },
                                { href: '/', label: 'Latest Jobs' },
                                { href: '/jobs', label: 'Advanced Search' },
                                { href: '/blog', label: 'Blog & News' },
                                { href: '/contact', label: 'Contact' },
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-gray-300 hover:text-[#5CB800] transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 rounded-full bg-[#5CB800] group-hover:w-2 transition-all"></span>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Employers & Seekers */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#5CB800]">Portals</h4>
                        <ul className="space-y-2">
                            {[
                                { href: '/dashboard', label: 'Job Seeker Portal' },
                                { href: '/employer', label: 'Employer Portal' },
                                { href: '/employer/post', label: 'Post a Job' },
                                { href: '/talent', label: 'Talent Directory' },
                                { href: '/dashboard/saved', label: 'Saved Jobs' },
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="text-gray-300 hover:text-[#5CB800] transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 rounded-full bg-[#5CB800] group-hover:w-2 transition-all"></span>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#5CB800]">Get in Touch</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-300">
                                <Mail size={18} className="text-[#5CB800] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm">Email</p>
                                    <a href="mailto:info@jobopeningskenya.co.ke" className="hover:text-[#5CB800] transition-colors">
                                        info@jobopeningskenya.co.ke
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <Phone size={18} className="text-[#5CB800] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm">Phone</p>
                                    <a href="tel:+254752182132" className="hover:text-[#5CB800] transition-colors">
                                        +254 752 182 132
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Get the App Section */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h4 className="text-xl font-bold text-white mb-2">Get the Job Openings Kenya App</h4>
                            <p className="text-gray-400 text-sm">Install our app for quick access to the latest job openings</p>
                        </div>
                        <FooterInstallButton />
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container mx-auto px-4 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            © {currentYear} Job Openings Kenya. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Developed by</span>
                            <a href="https://kingscreation.co.ke" target="_blank" rel="noopener noreferrer" className="text-[#5CB800] hover:text-[#4A9900] font-semibold transition-colors">
                                Kings Creation
                            </a>
                            <span className="text-gray-500">|</span>
                            <a href="tel:+254752182132" className="text-gray-400 hover:text-[#5CB800] transition-colors">
                                +254 752 182 132
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
