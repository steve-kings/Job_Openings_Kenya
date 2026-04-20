'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Settings, Award, Menu, X, Bookmark } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { savedJobs, setDrawerOpen } = useBookmarks();
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profileData);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setMobileMenuOpen(false);
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    // Automatically close mobile menu when navigating to a new route
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/jobs', label: 'Opportunities' },
        { href: '/talent', label: 'Talent' },
        { href: '/community', label: 'Community' },
        { href: 'https://kings-learn.vercel.app', label: 'Learning', external: true },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-[#1976D2]">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-14 lg:h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <img 
                            src="/1000jobs_logo.jpeg" 
                            alt="1000Jobs Logo" 
                            className="h-9 lg:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            link.external ? (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-lg font-medium transition-all text-gray-700 hover:bg-[#1976D2]/10 hover:text-[#1976D2]"
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        isActive(link.href)
                                            ? 'bg-[#1976D2] text-white'
                                            : 'text-gray-700 hover:bg-[#1976D2]/10 hover:text-[#1976D2]'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Right Side - User Profile or Login */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setDrawerOpen(true)}
                            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Saved Jobs"
                        >
                            <Bookmark size={22} className={savedJobs.length > 0 ? "fill-[#1976D2] text-[#1976D2]" : ""} />
                            {savedJobs.length > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                                    {savedJobs.length}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="dropdown dropdown-end">
                                <div
                                    tabIndex={0}
                                    role="button"
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    {profile?.avatar_url ? (
                                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden shadow-md border-2 border-white">
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#1976D2] flex items-center justify-center text-white font-bold shadow-md">
                                            {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {profile?.full_name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {profile?.role === 'admin' ? 'Admin' : 'Student'}
                                        </p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-600 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul
                                    tabIndex={0}
                                    className="dropdown-content menu p-2 shadow-xl bg-white rounded-lg w-56 mt-2 border border-gray-200"
                                >
                                    <li className="menu-title px-4 py-2">
                                        <span className="text-xs text-gray-500">Signed in as</span>
                                        <span className="text-sm font-semibold text-gray-900 truncate">
                                            {user.email}
                                        </span>
                                    </li>
                                    <div className="divider my-1"></div>
                                    <li>
                                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-[#1976D2]/10 hover:text-[#1976D2]">
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-[#4CAF50]/10 hover:text-[#4CAF50]">
                                            <Award size={18} />
                                            My Certificates
                                        </Link>
                                    </li>
                                    {profile?.role === 'admin' && (
                                        <li>
                                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2 hover:bg-[#1565C0]/10 hover:text-[#1565C0]">
                                                <Settings size={18} />
                                                Admin Panel
                                            </Link>
                                        </li>
                                    )}
                                    <div className="divider my-1"></div>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="btn bg-[#1976D2] text-white border-none hover:bg-[#1565C0] transition-colors btn-sm lg:btn-md"
                            >
                                <User size={18} className="hidden sm:inline" />
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} className="text-gray-700" />
                            ) : (
                                <Menu size={24} className="text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                link.external ? (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-3 rounded-lg font-medium transition-all text-gray-700 hover:bg-[#1976D2]/10 hover:text-[#1976D2]"
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                            isActive(link.href)
                                                ? 'bg-[#1976D2] text-white'
                                                : 'text-gray-700 hover:bg-[#1976D2]/10 hover:text-[#1976D2]'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
