'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, User, Bookmark, FileText, Users, Home, Menu, X, LogOut, MessageSquare, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useBookmarks } from '@/contexts/BookmarkContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { setDrawerOpen } = useBookmarks();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', href: '/dashboard/profile', icon: User },
        { name: 'Saved Jobs', href: '/dashboard/saved', icon: Bookmark },
        { name: 'Community', href: '/community', icon: MessageSquare },
        { name: 'Success Stories', href: '/dashboard/feedback', icon: Sparkles },
        { name: 'Opportunities', href: '/', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-50 bg-[#1976D2] text-white shadow-lg">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img 
                            src="/1000jobs_logo.jpeg" 
                            alt="1000Jobs Logo" 
                            className="h-10 w-10 object-cover rounded-lg"
                        />
                        <div>
                            <h1 className="text-lg font-bold">1000Jobs</h1>
                            <p className="text-xs text-white/80">Student Portal</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="btn btn-ghost btn-square text-white"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar (Desktop & Mobile) */}
            <div className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full p-6 overflow-y-auto">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/1000jobs_logo.jpeg" 
                                alt="1000Jobs Logo" 
                                className="h-12 w-12 object-cover rounded-lg"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Student Portal</h2>
                                <p className="text-xs text-gray-500">1000Jobs Africa</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="btn btn-ghost btn-sm btn-circle lg:hidden text-gray-500"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</p>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 p-4 rounded-xl transition-all font-medium ${
                                        isActive
                                            ? 'bg-[#1976D2]/10 text-[#1976D2]'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon size={22} className={isActive ? "text-[#1976D2]" : "text-gray-400"} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                        

                    </nav>

                    {/* Sidebar Footer */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <Link 
                            href="/" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="btn btn-outline border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 w-full gap-2"
                        >
                            <Home size={16} />
                            Back to Home
                        </Link>
                        <button onClick={handleLogout} className="btn bg-red-50 text-red-600 hover:bg-red-100 border-none w-full gap-2">
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
