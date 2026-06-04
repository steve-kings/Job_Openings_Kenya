'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Briefcase, FileText, Users, LogOut, Settings, Home, Menu, X, UserCheck, Mail, Quote, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    // Fetch pending job submissions count
    useEffect(() => {
        const fetchPending = async () => {
            const { count } = await supabase
                .from('employer_job_submissions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            setPendingCount(count || 0);
        };
        fetchPending().catch(() => {});
    }, [pathname]);

    const menuItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Members', href: '/admin/members', icon: UserCheck },
        { name: 'Opportunities', href: '/admin/opportunities', icon: Briefcase },
        { name: 'Job Submissions', href: '/admin/job-submissions', icon: ClipboardList, badge: pendingCount },
        { name: 'Testimonials', href: '/admin/testimonials', icon: Quote },
        { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
        { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
        { name: 'Partners', href: '/admin/partners', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-50 bg-[#5CB800] text-white shadow-lg">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img src="/job_openings_kenya_logo.jpeg" alt="Job Openings Kenya Logo" className="h-10 w-10 object-cover rounded-lg" />
                        <div>
                            <h1 className="text-lg font-bold">Job Openings Kenya Admin</h1>
                            <p className="text-xs text-white/80">CMS Dashboard</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="btn btn-ghost btn-square text-white" aria-label="Toggle menu">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <img src="/job_openings_kenya_logo.jpeg" alt="Job Openings Kenya Logo" className="h-12 w-12 object-cover rounded-lg" />
                            <div>
                                <h2 className="text-xl font-bold">Job Openings Kenya Admin</h2>
                                <p className="text-xs text-white/70">Content Management</p>
                            </div>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="btn btn-ghost btn-sm btn-circle text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${isActive ? 'bg-[#5CB800] text-white shadow-lg scale-105' : 'hover:bg-white/10 text-white/90 hover:text-white active:scale-95'}`}
                                >
                                    <Icon size={22} />
                                    <span className="font-medium text-base flex-1">{item.name}</span>
                                    {item.badge ? (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="space-y-3 pt-6 border-t border-white/20">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-[#5CB800] w-full gap-2">
                            <Home size={16} /> Back to Website
                        </Link>
                        <button onClick={handleLogout} className="btn bg-red-600 hover:bg-red-700 text-white btn-sm w-full gap-2 border-none">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-72 bg-gray-900 text-white min-h-screen sticky top-0 h-screen overflow-y-auto">
                    <div className="flex flex-col h-full p-6">
                        <div className="mb-8 text-center">
                            <img src="/job_openings_kenya_logo.jpeg" alt="Job Openings Kenya Logo" className="h-16 w-16 object-cover rounded-xl mx-auto mb-4 shadow-lg" />
                            <h1 className="text-2xl font-bold text-white mb-1">Job Openings Kenya Admin</h1>
                            <p className="text-sm text-white/70">Content Management System</p>
                        </div>

                        <nav className="flex-1 space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
                                return (
                                    <Link key={item.href} href={item.href}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-[#5CB800] text-white shadow-lg' : 'hover:bg-white/10 text-white/90 hover:text-white'}`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium flex-1">{item.name}</span>
                                        {item.badge ? (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="space-y-3 pt-6 border-t border-white/20">
                            <Link href="/" className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-[#5CB800] w-full gap-2">
                                <Home size={16} /> Back to Website
                            </Link>
                            <button onClick={handleLogout} className="btn bg-red-600 hover:bg-red-700 text-white btn-sm w-full gap-2 border-none">
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-h-screen min-w-0 flex flex-col overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
