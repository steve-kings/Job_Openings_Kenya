import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, ExternalLink } from 'lucide-react';
import FooterInstallButton from './FooterInstallButton';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-[#1565C0] to-gray-900 text-white mt-auto">
            {/* Newsletter Section */}
            <div className="border-b border-white/10 bg-[#1565C0]/20">
                <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
                        <div className="text-center md:text-left flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2">Subscribe to Weekly Opportunities</h3>
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
                                src="/1000jobs_logo.jpeg" 
                                alt="1000Jobs Logo" 
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Empowering Africa's youth through education, opportunities, and community support.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://www.facebook.com/profile.php?id=61587179078827"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1976D2] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Facebook size={18} />
                            </a>
                            {/* Hidden until pages are created
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#4CAF50] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#1976D2] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Instagram size={18} />
                            </a>
                            */}
                            <a
                                href="https://www.linkedin.com/company/1000-job-opportunities/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#4CAF50] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#4CAF50]">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <a href="https://kings-learn.vercel.app" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    Learning
                                </a>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    Opportunities
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#4CAF50]">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/dashboard" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://whatsapp.com/channel/0029VbCAOUzDuMRgzkuhZe1e"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    WhatsApp Channel
                                    <ExternalLink size={14} />
                                </a>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-300 hover:text-[#4CAF50] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#4CAF50] group-hover:w-2 transition-all"></span>
                                    Terms of Use
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#4CAF50]">Get in Touch</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-300">
                                <Mail size={18} className="text-[#4CAF50] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm">Email</p>
                                    <a href="mailto:info@1000jobs.co.ke" className="hover:text-[#4CAF50] transition-colors">
                                        info@1000jobs.co.ke
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <Phone size={18} className="text-[#4CAF50] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm">Phone</p>
                                    <a href="tel:+254752182132" className="hover:text-[#4CAF50] transition-colors">
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
                            <h4 className="text-xl font-bold text-white mb-2">Get the 1000Jobs App</h4>
                            <p className="text-gray-400 text-sm">Install our app for quick access to opportunities</p>
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
                            © {currentYear} 1000Jobs - 1000Jobs. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Developed by</span>
                            <a 
                                href="https://kingscreation.co.ke" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#4CAF50] hover:text-[#1976D2] font-semibold transition-colors"
                            >
                                Kings Creation
                            </a>
                            <span className="text-gray-500">|</span>
                            <a 
                                href="tel:+254752182132" 
                                className="text-gray-400 hover:text-[#4CAF50] transition-colors"
                            >
                                +254 752 182 132
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
