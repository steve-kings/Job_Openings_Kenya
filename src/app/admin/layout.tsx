'use client'

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Briefcase, FileText, Users, LogOut, Settings,
    Home, Menu, UserCheck, Mail, Quote, ClipboardList, Sparkles,
    Star,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [user, setUser] = useState<{ email?: string } | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
        supabase.from('employer_job_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
            .then(({ count }) => setPendingCount(count || 0));
    }, [pathname, supabase]);

    const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

    const menuItems = [
        { section: 'Main', items: [
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        ]},
        { section: 'Content', items: [
            { name: 'Opportunities', href: '/admin/opportunities', icon: Briefcase },
            { name: 'Job Submissions', href: '/admin/job-submissions', icon: ClipboardList, badge: pendingCount },
            { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
            { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
            { name: 'Partners', href: '/admin/partners', icon: Users },
        ]},
        { section: 'Community', items: [
            { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
            { name: 'Members', href: '/admin/members', icon: UserCheck },
            { name: 'Settings', href: '/admin/settings', icon: Settings },
        ]},
    ];

    const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-4 py-5 border-b border-slate-100">
                        <Link href="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                            <Image src="/job_openings_kenya_logo.jpeg" alt="Logo" width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                            <div>
                                <p className="font-extrabold text-sm text-slate-900">Job Openings Kenya</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin</p>
                            </div>
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                        {menuItems.map(({ section, items }) => (
                            <div key={section}>
                                <p className="px-3 mb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{section}</p>
                                <div className="space-y-0.5">
                                    {items.map(({ name, href, icon: Icon, badge }) => (
                                        <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                                isActive(href)
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                            }`}>
                                            <Icon size={18} className={isActive(href) ? 'text-emerald-600' : 'text-slate-400'} />
                                            <span className="flex-1">{name}</span>
                                            {badge ? <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">{badge}</span> : null}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-slate-100 space-y-1">
                        <Link href="/" className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
                            <Home size={16} /> Back to Website
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main */}
            <main className="flex-1 min-w-0">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <Menu size={20} className="text-slate-600" />
                    </button>
                    <div className="hidden sm:flex items-center gap-2">
                        <Sparkles size={14} className="text-emerald-500" />
                        <span className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/opportunities/create"
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm">
                            <Sparkles size={13} /> New Listing
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xs ring-2 ring-emerald-100">
                            {user?.email?.[0]?.toUpperCase() || 'A'}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
