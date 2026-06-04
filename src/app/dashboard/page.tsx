'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Briefcase, FileText, User, Mail, Calendar, Award, TrendingUp, LogOut, Search } from 'lucide-react';

function getRoleDisplay(role: string) {
    if (role === 'admin') return 'Admin';
    if (role === 'employer') return 'Employer';
    return 'Job Seeker';
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ opportunities: 0, blogPosts: 0, partners: 0 });
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login?redirect=/dashboard');
                return;
            }

            setUser(user);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData?.role === 'admin') {
                router.push('/admin');
                return;
            }

            if (profileData?.role === 'employer') {
                router.push('/employer/dashboard');
                return;
            }

            setProfile(profileData);

            const [oppCount, postCount, partnerCount] = await Promise.all([
                supabase.from('opportunities').select('count').eq('status', 'active'),
                supabase.from('blog_posts').select('count').eq('status', 'published'),
                supabase.from('partners').select('count'),
            ]);

            setStats({
                opportunities: oppCount.data?.[0]?.count || 0,
                blogPosts: postCount.data?.[0]?.count || 0,
                partners: partnerCount.data?.[0]?.count || 0
            });

            setLoading(false);
        };

        init();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-[#5CB800]"></span>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#5CB800] via-[#5CB800] to-[#4A9900] text-white p-8 lg:p-12 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-y-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden shadow-inner cursor-pointer hover:bg-white/20 transition-colors"
                                onClick={() => router.push('/dashboard/profile')}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-white" size={36} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words">
                                    Welcome back, {userName}!
                                </h1>
                                <p className="text-white/80 text-base sm:text-lg mt-1 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <p className="text-white/80 flex items-center gap-2 font-medium bg-black/10 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                            <Calendar size={16} />
                            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-white shadow-xl border-t-4 border-[#5CB800]">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Active Job Openings</p>
                                <p className="text-4xl font-black text-gray-900 mt-1">{stats.opportunities}</p>
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    <TrendingUp size={14} /> Available now
                                </p>
                            </div>
                            <div className="p-4 bg-[#5CB800]/10 rounded-xl">
                                <Briefcase className="text-[#5CB800]" size={32} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-white shadow-xl border-t-4 border-[#4A9900]">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Blog Articles</p>
                                <p className="text-4xl font-black text-gray-900 mt-1">{stats.blogPosts}</p>
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    <TrendingUp size={14} /> Published
                                </p>
                            </div>
                            <div className="p-4 bg-[#4A9900]/10 rounded-xl">
                                <FileText className="text-[#4A9900]" size={32} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-white shadow-xl border-t-4 border-[#5CB800]">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Our Partners</p>
                                <p className="text-4xl font-black text-gray-900 mt-1">{stats.partners}</p>
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                    <TrendingUp size={14} /> Active
                                </p>
                            </div>
                            <div className="p-4 bg-[#5CB800]/10 rounded-xl">
                                <Award className="text-[#5CB800]" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/" className="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-[#5CB800]">
                        <div className="card-body">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-[#5CB800] rounded-xl">
                                    <Briefcase className="text-white" size={32} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">Find Jobs</h3>
                                    <p className="text-gray-600 text-sm mt-1">Browse latest openings in Kenya</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/jobs" className="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-[#4A9900]">
                        <div className="card-body">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-[#4A9900] rounded-xl">
                                    <Search className="text-white" size={32} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">Advanced Search</h3>
                                    <p className="text-gray-600 text-sm mt-1">Filter by type & location</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/blog" className="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-[#5CB800]">
                        <div className="card-body">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-[#5CB800] rounded-xl">
                                    <FileText className="text-white" size={32} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">Blog & Stories</h3>
                                    <p className="text-gray-600 text-sm mt-1">Career tips & success stories</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/profile" className="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-l-4 border-[#5CB800]">
                        <div className="card-body">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-[#5CB800] rounded-xl">
                                    <User className="text-white" size={32} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">My Public Profile</h3>
                                    <p className="text-gray-600 text-sm mt-1">Build your job seeker profile</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Profile Card */}
            <div className="card bg-white shadow-xl">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="card-title text-2xl">Your Profile</h2>
                        <div className="badge badge-lg bg-[#5CB800] text-white border-none">
                            {getRoleDisplay(profile?.role || 'student')}
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg"><User className="text-gray-600" size={20} /></div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Full Name</label>
                                    <p className="text-lg text-gray-900 mt-1">{profile?.full_name || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg"><Mail className="text-gray-600" size={20} /></div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Email Address</label>
                                    <p className="text-lg text-gray-900 mt-1">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg"><Award className="text-gray-600" size={20} /></div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Account Type</label>
                                    <p className="text-lg text-gray-900 mt-1">{getRoleDisplay(profile?.role || 'student')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg"><Calendar className="text-gray-600" size={20} /></div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Member Since</label>
                                    <p className="text-lg text-gray-900 mt-1">
                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <button onClick={handleSignOut} className="btn btn-outline border-[#5CB800] text-[#5CB800] hover:bg-[#5CB800] hover:text-white gap-2 w-fit">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
