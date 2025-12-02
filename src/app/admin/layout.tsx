'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, BookOpen, FileText, Users, LogOut, Settings } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Opportunities', href: '/admin/opportunities', icon: Briefcase },
        { name: 'Courses', href: '/admin/courses', icon: BookOpen },
        { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
        { name: 'Partners', href: '/admin/partners', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="drawer lg:drawer-open">
            <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col">
                {/* Navbar for mobile */}
                <div className="navbar bg-gradient-to-r from-[#C44536] to-[#F39C12] text-white shadow-md lg:hidden">
                    <div className="flex-none">
                        <label htmlFor="admin-drawer" className="btn btn-square btn-ghost text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </label>
                    </div>
                    <div className="flex-1">
                        <span className="text-xl font-bold">YENA Admin</span>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-6 bg-base-200 min-h-screen">
                    {children}
                </div>
            </div>

            <div className="drawer-side">
                <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="menu p-4 w-80 min-h-full bg-gradient-to-b from-gray-900 via-[#8B3A3A] to-gray-900 text-white">
                    {/* Sidebar content */}
                    <div className="mb-8 text-center">
                        <img 
                            src="/images/yena logo.jpeg" 
                            alt="YENA Logo" 
                            className="h-16 w-auto object-contain mx-auto mb-4"
                        />
                        <h1 className="text-2xl font-bold text-white mb-2">YENA Admin</h1>
                        <p className="text-sm text-white/70">Content Management System</p>
                    </div>

                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-[#C44536] to-[#F39C12] text-white shadow-lg'
                                            : 'hover:bg-white/10 text-white/90 hover:text-white'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="divider before:bg-white/20 after:bg-white/20"></div>

                    <Link href="/" className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-[#C44536]">
                        ← Back to Website
                    </Link>

                    <div className="mt-auto pt-6">
                        <button className="btn bg-red-600 hover:bg-red-700 text-white btn-sm w-full gap-2 border-none">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
