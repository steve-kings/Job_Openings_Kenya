'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import {
    LogOut, LayoutDashboard, Settings, Menu, X, Bookmark,
    ChevronDown, Search, Briefcase, Building2, Zap,
    MessageCircle, TrendingUp, Compass, Newspaper, ExternalLink,
    CheckCircle2, Sparkles, ArrowRight, MapPin, BookOpen, CloudSun,
} from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';

interface Profile {
    id: string;
    avatar_url?: string;
    full_name?: string;
    role?: string;
}

export default function Navbar() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileSubOpen, setMobileSubOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [btnPulse, setBtnPulse] = useState(false);
    const { savedJobs, setDrawerOpen } = useBookmarks();
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<NodeJS.Timeout | null>(null);

    // Track scroll for transparent → solid transition
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
    }, []);

    // Pulse CTA button every 10s
    useEffect(() => {
        const i = setInterval(() => { setBtnPulse(true); setTimeout(() => setBtnPulse(false), 1200); }, 10000);
        return () => clearInterval(i);
    }, []);

    // Auth
    useEffect(() => {
        (async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);
            if (u) {
                const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single();
                setProfile(p);
            }
        })();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
            setUser(s?.user ?? null);
            if (!s?.user) setProfile(null);
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    // Close dropdown on click outside
    useEffect(() => {
        const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // Close mobile on route change
    useEffect(() => {
        setMobileOpen(false); setMobileSubOpen(false); setDropdownOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null); setProfile(null); setMobileOpen(false);
        router.push('/');
    };

    const isActive = (p: string) => pathname === p;
    const dashLink = profile?.role === 'employer' ? '/employer/dashboard' : profile?.role === 'admin' ? '/admin' : '/dashboard';

    // Nav links — clean and minimal
    const navLinks = [
        { href: '/community', label: 'Community' },
        { href: '/blog', label: 'Blog' },
        { href: '/resources', label: 'Resources' },
        { href: '/contact', label: 'Contact' },
    ];

    // Mega dropdown columns
    const navColumns = [
        {
            title: 'By Type',
            links: [
                { href: '/?type=Job', label: 'Jobs', desc: 'Full-time & contract', icon: Briefcase, c: 'emerald' },
                { href: 'https://kingslearn.co.ke', label: 'Training', desc: 'Courses & internships', icon: BookOpen, c: 'violet', ext: true },
            ],
        },
        {
            title: 'Discover',
            links: [
                { href: '/', label: 'Latest Listings', desc: 'Newest opportunities', icon: Zap, c: 'emerald' },
                { href: '/companies', label: 'Companies', desc: 'Employer profiles', icon: Building2, c: 'indigo' },
                { href: '/map', label: 'Job Map', desc: 'Find jobs near you', icon: MapPin, c: 'red' },
                { href: '/popular', label: 'Popular', desc: 'Trending this week', icon: TrendingUp, c: 'orange' },
                { href: '/discover', label: 'Discover', desc: 'Curated for you', icon: Compass, c: 'blue' },
                { href: '/weather', label: 'Weather', desc: 'Kenya weather forecast', icon: CloudSun, c: 'sky' },
            ],
        },
        {
            title: 'Stay Updated',
            links: [
                { href: '/blog', label: 'Blog', desc: 'Career tips & stories', icon: Newspaper, c: 'violet' },
                { href: '/resources', label: 'Resources', desc: 'CV guides & tools', icon: BookOpen, c: 'amber' },
                { href: 'https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C', label: 'WhatsApp', desc: 'Instant job alerts', icon: MessageCircle, c: 'green', ext: true },
            ],
        },
    ];

    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-500',
        amber: 'bg-amber-50 text-amber-600',
        violet: 'bg-violet-50 text-violet-600',
        orange: 'bg-orange-50 text-orange-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        sky: 'bg-sky-50 text-sky-600',
    };

    // Transparent on hero pages (home, about, employer, popular, companies), solid elsewhere
    // Mobile always stays solid for usability
    const isHeroPage = pathname === '/' || pathname === '/about' || pathname === '/employer' || pathname === '/popular' || pathname === '/companies';
    const transparent = !scrolled && isHeroPage;

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 bg-white/95 backdrop-blur-xl shadow-[0_1px_6px_rgba(0,0,0,0.06)] border-b border-gray-100/50 lg:${
            transparent
                ? 'lg:bg-transparent lg:shadow-none lg:border-transparent'
                : ''
        }`}>
            {/* Top accent */}
            <div className={`h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 transition-opacity duration-500 ${transparent ? 'opacity-0' : 'opacity-100'}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-[68px] gap-4">

                    {/* ── Logo ── */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <Image
                            src="/job_openings_kenya_logo.jpeg"
                            alt="Job Openings Kenya"
                            width={100} height={40}
                            className="h-9 lg:h-10 w-auto object-contain transition-all group-hover:scale-105"
                        />
                    </Link>

                    {/* ── Desktop Nav ── */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        {/* Opportunities mega dropdown */}
                        <div className="relative" ref={dropdownRef}
                            onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); setDropdownOpen(true); }}
                            onMouseLeave={() => { closeTimer.current = setTimeout(() => setDropdownOpen(false), 150); }}>
                            <div className="flex items-center">
                                <Link href="/"
                                    onClick={() => setDropdownOpen(false)}
                                    className={`flex items-center gap-1.5 pl-3.5 pr-1 py-2 rounded-l-xl text-sm font-semibold transition-all duration-200 ${
                                        dropdownOpen || pathname === '/' || pathname.startsWith('/jobs') || pathname.startsWith('/companies')
                                            ? transparent ? 'text-white bg-white/15' : 'text-emerald-700 bg-emerald-50'
                                            : transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                                    }`}>
                                    <Briefcase size={17} /> Jobs
                                </Link>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                                    className={`flex items-center pr-3.5 pl-1 py-2 rounded-r-xl text-sm transition-all duration-200 ${
                                        dropdownOpen || pathname === '/' || pathname.startsWith('/jobs') || pathname.startsWith('/companies')
                                            ? transparent ? 'text-white bg-white/15' : 'text-emerald-700 bg-emerald-50'
                                            : transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                                    }`}>
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            {dropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-[640px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100">
                                        {navColumns.map((col) => (
                                            <div key={col.title} className="p-3">
                                                <p className="px-3 py-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{col.title}</p>
                                                <div className="space-y-0.5">
                                                    {col.links.map(({ href, label, desc, icon: Icon, c, ext }) => {
                                                        const Comp = ext ? 'a' : Link;
                                                        const extraProps = ext ? { target: '_blank', rel: 'noopener noreferrer' } : {};
                                                        return (
                                                            <Comp key={href} href={href} {...extraProps as Record<string, string>} onClick={() => setDropdownOpen(false)}
                                                                className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorMap[c]}`}><Icon size={16} /></div>
                                                                <div className="min-w-0">
                                                                    <span className="block font-semibold text-sm text-slate-700 group-hover/item:text-emerald-700 leading-tight">{label}</span>
                                                                    <span className="block text-[11px] text-slate-400 mt-0.5">{desc}</span>
                                                                </div>
                                                                {ext && <ExternalLink size={11} className="text-slate-300 ml-auto shrink-0 mt-1.5" />}
                                                            </Comp>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Post a Job CTA in dropdown */}
                                    <div className="border-t border-gray-100 p-3 bg-amber-50/50">
                                        <Link href={user && profile?.role === 'employer' ? '/employer/post' : '/employer'} onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-amber-100/60 hover:bg-amber-100 transition-all group/item border border-amber-200/50">
                                            <div className="w-9 h-9 rounded-lg bg-amber-200 flex items-center justify-center shrink-0"><Sparkles size={17} className="text-amber-800" /></div>
                                            <div>
                                                <p className="font-semibold text-sm text-amber-900">Post a Job</p>
                                                <p className="text-[11px] text-amber-700">Reach thousands of Kenyan job seekers</p>
                                            </div>
                                            <ArrowRight size={16} className="text-amber-400 ml-auto" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Standard nav links */}
                        {navLinks.map(l => (
                            <Link key={l.href} href={l.href}
                                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    isActive(l.href)
                                        ? transparent ? 'text-white bg-white/15' : 'text-emerald-700 bg-emerald-50'
                                        : transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                                }`}>
                                {l.label}
                            </Link>
                        ))}

                    </div>

                    {/* ── Right Actions ── */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Saved jobs */}
                        <button onClick={() => setDrawerOpen(true)}
                            className={`relative p-2.5 rounded-xl transition-all group ${
                                transparent ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-50'
                            }`}>
                            <Bookmark size={19} className={`transition-colors ${savedJobs.length > 0 ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                            {savedJobs.length > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-extrabold text-white bg-red-500 rounded-full ring-2 ring-white">
                                    {savedJobs.length > 99 ? '99' : savedJobs.length}
                                </span>
                            )}
                        </button>

                        {/* User menu */}
                        {user ? (
                            <div className="relative group">
                                <button className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${
                                    transparent ? 'hover:bg-white/15' : 'hover:bg-slate-50'
                                }`}>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm ring-2 ring-emerald-100">
                                        {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <ChevronDown size={14} className={`hidden sm:block ${transparent ? 'text-white/60' : 'text-slate-400'}`} />
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1.5">
                                    <div className="px-4 py-3 border-b border-gray-50">
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{profile?.full_name || user.email}</p>
                                    </div>
                                    <Link href={dashLink} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"><LayoutDashboard size={16} /> Dashboard</Link>
                                    {profile?.role !== 'employer' && profile?.role !== 'admin' && (
                                        <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"><CheckCircle2 size={16} /> My Applications</Link>
                                    )}
                                    {profile?.role === 'admin' && <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"><Settings size={16} /> Admin</Link>}
                                    <div className="border-t border-gray-50 mt-1 pt-1">
                                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"><LogOut size={16} /> Sign Out</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login"
                                    className={`hidden sm:inline-flex px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        transparent ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                                    }`}>
                                    Sign In
                                </Link>
                                <Link href="/employer"
                                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] ${
                                        btnPulse ? 'animate-pulse bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50'
                                    }`}>
                                    <Sparkles size={15} /> Post a Job
                                </Link>
                            </div>
                        )}

                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileOpen(!mobileOpen)}
                            className={`lg:hidden p-2.5 rounded-xl transition-colors ml-0.5 ${
                                transparent ? 'text-white hover:bg-white/15' : 'text-slate-700 hover:bg-slate-100'
                            }`}>
                            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile Menu ── */}
                {mobileOpen && (
                    <div className="lg:hidden border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                        <div className="py-3 space-y-1.5 max-h-[calc(100vh-64px)] overflow-y-auto">
                            {/* Opportunities accordion */}
                            <div className="rounded-xl border border-gray-100 overflow-hidden">
                                <div className={`flex items-center ${mobileSubOpen ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
                                    <Link href="/" onClick={() => setMobileOpen(false)}
                                        className="flex-1 flex items-center gap-2 px-4 py-3 font-semibold text-sm">
                                        <Briefcase size={17} /> Jobs
                                    </Link>
                                    <button onClick={() => setMobileSubOpen(!mobileSubOpen)}
                                        className="px-4 py-3 font-semibold text-sm">
                                        <ChevronDown size={16} className={`transition-transform duration-200 ${mobileSubOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                                {mobileSubOpen && (
                                    <div className="p-2 space-y-1 bg-gray-50">
                                        {[
                                            { href: '/', label: 'Latest Jobs', icon: Zap },
                                            { href: '/jobs', label: 'Browse All', icon: Search },
                                            { href: '/companies', label: 'Companies', icon: Building2 },
                                            { href: '/map', label: 'Job Map', icon: MapPin },
                                            { href: '/popular', label: 'Popular', icon: TrendingUp },
                                            { href: '/discover', label: 'Discover', icon: Compass },
                                        ].map(({ href, label, icon: Icon }) => (
                                            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white shadow-sm text-sm font-medium text-slate-700 hover:text-emerald-700">
                                                <Icon size={16} /> {label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nav links */}
                            {[...navLinks, { href: '/about', label: 'About' }].map(l => (
                                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                                    className={`block px-4 py-3 rounded-xl font-semibold text-sm ${isActive(l.href) ? 'bg-emerald-500 text-white' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                                    {l.label}
                                </Link>
                            ))}

                            <a href="https://whatsapp.com/channel/0029VbC5ZsJ3WHTVFtB0TM3C" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-slate-700 hover:bg-green-50 hover:text-green-700">
                                <MessageCircle size={16} /> WhatsApp Alerts <ExternalLink size={12} className="ml-auto text-slate-300" />
                            </a>

                            {/* Account */}
                            {user ? (
                                <div className="rounded-xl border border-gray-100 overflow-hidden mt-2">
                                    <div className="px-4 py-3 bg-gray-50"><p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Account</p><p className="text-sm font-semibold text-gray-900 mt-0.5">{profile?.full_name || user.email}</p></div>
                                    <div className="p-2 space-y-1 bg-white">
                                        <Link href={dashLink} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"><LayoutDashboard size={16} /> Dashboard</Link>
                                        <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"><LogOut size={16} /> Sign Out</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 pt-2 px-1">
                                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 py-3 text-center rounded-xl border border-gray-200 text-sm font-bold text-slate-700 hover:bg-gray-50">Sign In</Link>
                                    <Link href="/employer" onClick={() => setMobileOpen(false)} className="flex-1 py-3 text-center rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">Post a Job</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
