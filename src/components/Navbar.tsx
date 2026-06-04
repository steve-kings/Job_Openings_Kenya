'use client'

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, LayoutDashboard, Settings, Menu, X, Bookmark, ChevronDown, Search, FileText, Briefcase, Users, Building2 } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [jobsDropdownOpen, setJobsDropdownOpen] = useState(false);
    const [mobileJobsOpen, setMobileJobsOpen] = useState(false);
    const { savedJobs, setDrawerOpen } = useBookmarks();
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            if (!session?.user) setProfile(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Close jobs dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setJobsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setMobileMenuOpen(false);
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        setMobileMenuOpen(false);
        setJobsDropdownOpen(false);
    }, [pathname]);

    // Determine dashboard link based on role
    const getDashboardLink = () => {
        if (profile?.role === 'employer') return '/employer/dashboard';
        if (profile?.role === 'admin') return '/admin';
        return '/dashboard';
    };

    const getRoleLabel = () => {
        if (profile?.role === 'admin') return 'Admin';
        if (profile?.role === 'employer') return 'Employer';
        return 'Job Seeker';
    };

    const staticNavLinks = [
        { href: '/about', label: 'About' },
        { href: '/talent', label: 'Talent' },
        { href: '/blog', label: 'Blog' },
        { href: '/popular', label: 'Popular' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md border-b-2 border-[#5CB800]">
            <div className="container mx-auto px-4 lg:px-8 relative">
                <div className="flex items-center justify-between h-14 lg:h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <img
                            src="/job_openings_kenya_logo.jpeg"
                            alt="Job Openings Kenya Logo"
                            className="h-9 lg:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {/* Jobs Mega Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setJobsDropdownOpen(!jobsDropdownOpen)}
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${jobsDropdownOpen || isActive('/') ? 'bg-[#5CB800] text-white' : 'text-gray-700 hover:bg-[#5CB800]/10 hover:text-[#5CB800]'}`}
                            >
                                Jobs
                                <ChevronDown size={16} className={`transition-transform duration-200 ${jobsDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown panel — rendered outside overflow context */}
                            {jobsDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999]">
                                    {/* For Job Seekers */}
                                    <div className="p-4">
                                        <p className="text-xs font-bold text-[#5CB800] uppercase tracking-widest mb-3 px-2">For Job Seekers</p>
                                        <Link href="/" onClick={() => setJobsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#5CB800]/10 text-gray-700 hover:text-[#5CB800] transition-colors group">
                                            <div className="w-8 h-8 bg-[#5CB800]/10 rounded-lg flex items-center justify-center group-hover:bg-[#5CB800]/20 transition-colors">
                                                <Briefcase size={16} className="text-[#5CB800]" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Latest Jobs</p>
                                                <p className="text-xs text-gray-500">Browse all active listings</p>
                                            </div>
                                        </Link>
                                        <Link href="/jobs" onClick={() => setJobsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#5CB800]/10 text-gray-700 hover:text-[#5CB800] transition-colors group">
                                            <div className="w-8 h-8 bg-[#5CB800]/10 rounded-lg flex items-center justify-center group-hover:bg-[#5CB800]/20 transition-colors">
                                                <Search size={16} className="text-[#5CB800]" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Advanced Search</p>
                                                <p className="text-xs text-gray-500">Filter by type & location</p>
                                            </div>
                                        </Link>
                                        <Link
                                            href={user ? '/dashboard/profile' : '/login?redirect=/dashboard/profile'}
                                            onClick={() => setJobsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#5CB800]/10 text-gray-700 hover:text-[#5CB800] transition-colors group"
                                        >
                                            <div className="w-8 h-8 bg-[#5CB800]/10 rounded-lg flex items-center justify-center group-hover:bg-[#5CB800]/20 transition-colors">
                                                <FileText size={16} className="text-[#5CB800]" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Add Resume</p>
                                                <p className="text-xs text-gray-500">Build your job seeker profile</p>
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="border-t border-gray-100 mx-4"></div>

                                    {/* For Employers */}
                                    <div className="p-4">
                                        <p className="text-xs font-bold text-[#4A9900] uppercase tracking-widest mb-3 px-2">For Employers</p>
                                        <Link
                                            href={user && profile?.role === 'employer' ? '/employer/post' : '/employer'}
                                            onClick={() => setJobsDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#4A9900]/10 text-gray-700 hover:text-[#4A9900] transition-colors group"
                                        >
                                            <div className="w-8 h-8 bg-[#4A9900]/10 rounded-lg flex items-center justify-center group-hover:bg-[#4A9900]/20 transition-colors">
                                                <Building2 size={16} className="text-[#4A9900]" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Post a Job</p>
                                                <p className="text-xs text-gray-500">Reach thousands of seekers</p>
                                            </div>
                                        </Link>
                                        <Link href="/talent" onClick={() => setJobsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#4A9900]/10 text-gray-700 hover:text-[#4A9900] transition-colors group">
                                            <div className="w-8 h-8 bg-[#4A9900]/10 rounded-lg flex items-center justify-center group-hover:bg-[#4A9900]/20 transition-colors">
                                                <Users size={16} className="text-[#4A9900]" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">Search Resumes</p>
                                                <p className="text-xs text-gray-500">Find qualified candidates</p>
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="border-t border-gray-100 mx-4"></div>

                                    {/* Job Fair */}
                                    <div className="p-4">
                                        <Link href="/blog" onClick={() => setJobsDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                            <span className="text-xl">🎪</span>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">Job Fair</p>
                                                <p className="text-xs text-gray-500">Events, news & career tips</p>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {staticNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    isActive(link.href)
                                        ? 'bg-[#5CB800] text-white'
                                        : 'text-gray-700 hover:bg-[#5CB800]/10 hover:text-[#5CB800]'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Saved Jobs"
                        >
                            <Bookmark size={22} className={savedJobs.length > 0 ? 'fill-[#5CB800] text-[#5CB800]' : ''} />
                            {savedJobs.length > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                                    {savedJobs.length}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                    {profile?.avatar_url ? (
                                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden shadow-md border-2 border-white">
                                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#5CB800] flex items-center justify-center text-white font-bold shadow-md">
                                            {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                                        <p className="text-xs text-gray-500">{getRoleLabel()}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-600 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-white rounded-lg w-56 mt-2 border border-gray-200">
                                    <li className="menu-title px-4 py-2">
                                        <span className="text-xs text-gray-500">Signed in as</span>
                                        <span className="text-sm font-semibold text-gray-900 truncate">{user.email}</span>
                                    </li>
                                    <div className="divider my-1"></div>
                                    <li>
                                        <Link href={getDashboardLink()} className="flex items-center gap-3 px-4 py-2 hover:bg-[#5CB800]/10 hover:text-[#5CB800]">
                                            <LayoutDashboard size={18} />
                                            {profile?.role === 'employer' ? 'Employer Dashboard' : 'Dashboard'}
                                        </Link>
                                    </li>
                                    {profile?.role === 'admin' && (
                                        <li>
                                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2 hover:bg-[#4A9900]/10 hover:text-[#4A9900]">
                                                <Settings size={18} />
                                                Admin Panel
                                            </Link>
                                        </li>
                                    )}
                                    <div className="divider my-1"></div>
                                    <li>
                                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50">
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="btn bg-[#5CB800] text-white border-none hover:bg-[#4A9900] transition-colors btn-sm lg:btn-md">
                                    <User size={18} className="hidden sm:inline" />
                                    Login
                                </Link>
                                <Link href="/employer" className="hidden sm:flex btn btn-outline border-[#5CB800] text-[#5CB800] hover:bg-[#5CB800] hover:text-white btn-sm lg:btn-md transition-colors">
                                    Post a Job
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            {mobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
                        <div className="flex flex-col gap-1">
                            {/* Mobile Jobs Accordion */}
                            <div>
                                <button
                                    onClick={() => setMobileJobsOpen(!mobileJobsOpen)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${mobileJobsOpen || isActive('/') ? 'bg-[#5CB800] text-white' : 'text-gray-700 hover:bg-[#5CB800]/10 hover:text-[#5CB800]'}`}
                                >
                                    <span>Jobs</span>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${mobileJobsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileJobsOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#5CB800]/20 pl-3">
                                        <p className="text-xs font-bold text-[#5CB800] uppercase tracking-wider px-3 pt-2">For Job Seekers</p>
                                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#5CB800]/10 hover:text-[#5CB800]">
                                            <Briefcase size={14} /> Latest Jobs
                                        </Link>
                                        <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#5CB800]/10 hover:text-[#5CB800]">
                                            <Search size={14} /> Advanced Search
                                        </Link>
                                        <Link href={user ? '/dashboard/profile' : '/login?redirect=/dashboard/profile'} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#5CB800]/10 hover:text-[#5CB800]">
                                            <FileText size={14} /> Add Resume
                                        </Link>
                                        <p className="text-xs font-bold text-[#4A9900] uppercase tracking-wider px-3 pt-2">For Employers</p>
                                        <Link href="/employer" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#4A9900]/10 hover:text-[#4A9900]">
                                            <Building2 size={14} /> Post a Job
                                        </Link>
                                        <Link href="/talent" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-[#4A9900]/10 hover:text-[#4A9900]">
                                            <Users size={14} /> Search Resumes
                                        </Link>
                                        <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                                            🎪 Job Fair
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {staticNavLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-lg font-medium transition-all ${isActive(link.href) ? 'bg-[#5CB800] text-white' : 'text-gray-700 hover:bg-[#5CB800]/10 hover:text-[#5CB800]'}`}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
