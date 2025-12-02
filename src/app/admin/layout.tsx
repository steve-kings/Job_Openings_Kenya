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
                <div className="navbar bg-base-100 shadow-md lg:hidden">
                    <div className="flex-none">
                        <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </label>
                    </div>
                    <div className="flex-1">
                        <span className="text-xl font-bold text-primary">YENA Admin</span>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-6 bg-base-200 min-h-screen">
                    {children}
                </div>
            </div>

            <div className="drawer-side">
                <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="menu p-4 w-80 min-h-full bg-neutral text-neutral-content">
                    {/* Sidebar content */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">YENA Admin</h1>
                        <p className="text-sm opacity-70">Content Management System</p>
                    </div>

                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary text-white'
                                            : 'hover:bg-base-100 hover:text-primary'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="divider"></div>

                    <Link href="/" className="btn btn-outline btn-sm text-white border-white hover:bg-white hover:text-neutral">
                        ← Back to Website
                    </Link>

                    <div className="mt-auto pt-6">
                        <button className="btn btn-error btn-sm w-full gap-2">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
