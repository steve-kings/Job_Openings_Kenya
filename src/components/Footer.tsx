import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, ExternalLink } from 'lucide-react';
import FooterInstallButton from './FooterInstallButton';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-[#8B3A3A] to-gray-900 text-white mt-auto">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="mb-4">
                            <img 
                                src="/images/yena logo.jpeg" 
                                alt="YENA Logo" 
                                className="h-16 w-auto object-contain"
                            />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Empowering Africa's youth through education, opportunities, and community support.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C44536] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Facebook size={18} />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F39C12] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C44536] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#F39C12] flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#F39C12]">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/courses" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    Learning
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    Opportunities
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#F39C12]">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/dashboard" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://whatsapp.com/channel/0029Vb5tFTSK0IBb2oi04V2b"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-[#10B981] transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-[#10B981] group-hover:w-2 transition-all"></span>
                                    WhatsApp Channel
                                    <ExternalLink size={14} />
                                </a>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-300 hover:text-[#F39C12] transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-[#F39C12] group-hover:w-2 transition-all"></span>
                                    Terms of Use
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-[#F39C12]">Get in Touch</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-300">
                                <Mail size={18} className="text-[#F39C12] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm">Email</p>
                                    <a href="mailto:info@yena.org" className="hover:text-[#F39C12] transition-colors">
                                        info@yena.org
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-gray-300">
                                <Phone size={18} className="text-[#F39C12] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm">Phone</p>
                                    <a href="tel:+254788419041" className="hover:text-[#F39C12] transition-colors">
                                        +254 788 419 041
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
                            <h4 className="text-xl font-bold text-white mb-2">Get the YENA App</h4>
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
                            © {currentYear} YENA - Youth Empowerment Network Africa. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Developed by</span>
                            <a 
                                href="https://kingscreation.co.ke" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#F39C12] hover:text-[#C44536] font-semibold transition-colors"
                            >
                                Kings Creation
                            </a>
                            <span className="text-gray-500">|</span>
                            <a 
                                href="tel:+254788419041" 
                                className="text-gray-400 hover:text-[#F39C12] transition-colors"
                            >
                                +254 788 419 041
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
