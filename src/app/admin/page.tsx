'use client'

import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Briefcase, TrendingUp, Clock, Eye, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { title: 'Total Opportunities', value: '...', change: 'Loading...', icon: Briefcase, color: '#C44536', trend: '+0%' },
        { title: 'Blog Posts', value: '...', change: 'Loading...', icon: FileText, color: '#F39C12', trend: '+0%' },
        { title: 'Registered Users', value: '...', change: 'Loading...', icon: Users, color: '#10B981', trend: '+0%' },
        { title: 'Partners', value: '...', change: 'Loading...', icon: BarChart3, color: '#8B3A3A', trend: '+0%' },
    ]);
    const [recentOpportunities, setRecentOpportunities] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch counts
            const [oppCount, postCount, userCount, partnerCount] = await Promise.all([
                supabase.from('opportunities').select('count'),
                supabase.from('blog_posts').select('count'),
                supabase.from('profiles').select('count'),
                supabase.from('partners').select('count'),
            ]);

            // Fetch active opportunities count for trend
            const { data: activeOpp } = await supabase
                .from('opportunities')
                .select('count')
                .eq('status', 'active');

            const activePercent = oppCount.data?.[0]?.count 
                ? Math.round((activeOpp?.[0]?.count || 0) / oppCount.data[0].count * 100)
                : 0;

            // Fetch published posts count for trend
            const { data: publishedPosts } = await supabase
                .from('blog_posts')
                .select('count')
                .eq('status', 'published');

            const publishedPercent = postCount.data?.[0]?.count
                ? Math.round((publishedPosts?.[0]?.count || 0) / postCount.data[0].count * 100)
                : 0;

            setStats([
                { 
                    title: 'Total Opportunities', 
                    value: oppCount.data?.[0]?.count?.toString() || '0', 
                    change: `${activeOpp?.[0]?.count || 0} active`, 
                    icon: Briefcase, 
                    color: '#C44536',
                    trend: `${activePercent}%`
                },
                { 
                    title: 'Blog Posts', 
                    value: postCount.data?.[0]?.count?.toString() || '0', 
                    change: `${publishedPosts?.[0]?.count || 0} published`, 
                    icon: FileText, 
                    color: '#F39C12',
                    trend: `${publishedPercent}%`
                },
                { 
                    title: 'Registered Users', 
                    value: userCount.data?.[0]?.count?.toString() || '0', 
                    change: 'All time', 
                    icon: Users, 
                    color: '#10B981',
                    trend: '100%'
                },
                { 
                    title: 'Partners', 
                    value: partnerCount.data?.[0]?.count?.toString() || '0', 
                    change: 'Active partnerships', 
                    icon: BarChart3, 
                    color: '#8B3A3A',
                    trend: '100%'
                },
            ]);

            // Fetch recent opportunities
            const { data: opportunities } = await supabase
                .from('opportunities')
                .select('id, title, type, status, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            if (opportunities) {
                setRecentOpportunities(opportunities.map(opp => ({
                    ...opp,
                    date: new Date(opp.created_at).toLocaleDateString(),
                    timeAgo: getTimeAgo(new Date(opp.created_at))
                })));
            }

            // Fetch recent users
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            if (profiles) {
                setRecentUsers(profiles.map(profile => ({
                    id: profile.id,
                    name: profile.full_name || 'Anonymous',
                    email: profile.email || 'No email',
                    joined: new Date(profile.created_at).toLocaleDateString(),
                    timeAgo: getTimeAgo(new Date(profile.created_at))
                })));
            }

            // Fetch recent blog posts
            const { data: posts } = await supabase
                .from('blog_posts')
                .select('id, title, status, category, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            if (posts) {
                setRecentPosts(posts.map(post => ({
                    ...post,
                    date: new Date(post.created_at).toLocaleDateString(),
                    timeAgo: getTimeAgo(new Date(post.created_at))
                })));
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-[#C44536]"></span>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#C44536] via-[#C44536] to-[#8B3A3A] text-white p-8 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
                        <p className="text-white/90 text-lg">Welcome to the YENA Content Management System</p>
                        <div className="flex items-center gap-2 mt-3 text-white/80">
                            <Clock size={16} />
                            <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <Eye className="text-white mb-2" size={32} />
                            <p className="text-sm text-white/80">System Status</p>
                            <p className="text-xl font-bold">All Good ✓</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="card bg-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4" style={{ borderTopColor: stat.color }}>
                            <div className="card-body">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}15` }}>
                                        <Icon style={{ color: stat.color }} size={28} />
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-semibold">
                                        <TrendingUp size={12} />
                                        {stat.trend}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 font-medium">{stat.title}</p>
                                    <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500 mt-2">{stat.change}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="card bg-white shadow-xl border-l-4 border-[#C44536]">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
                        <Plus className="text-[#C44536]" size={24} />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link href="/admin/opportunities/create" className="btn btn-lg bg-[#C44536] hover:bg-[#8B3A3A] text-white border-none">
                            <Briefcase size={20} />
                            Add Opportunity
                        </Link>
                        <Link href="/admin/blog/create" className="btn btn-lg bg-[#F39C12] hover:bg-[#D68910] text-white border-none">
                            <FileText size={20} />
                            Publish Post
                        </Link>
                        <Link href="/admin/partners/create" className="btn btn-lg bg-[#10B981] hover:bg-[#059669] text-white border-none">
                            <BarChart3 size={20} />
                            Add Partner
                        </Link>
                        <a href="https://kings-learn.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-lg btn-outline border-2">
                            🎓 Manage Courses
                        </a>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Opportunities */}
                <div className="card bg-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title text-xl">Recent Opportunities</h2>
                            <Briefcase className="text-[#C44536]" size={20} />
                        </div>
                        <div className="space-y-3">
                            {recentOpportunities.length > 0 ? recentOpportunities.map((opp) => (
                                <div key={opp.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{opp.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-sm" style={{ backgroundColor: '#C44536', color: 'white' }}>{opp.type}</span>
                                                <span className={`badge badge-sm ${opp.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                                    {opp.status}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{opp.timeAgo}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Briefcase className="mx-auto mb-2 opacity-30" size={40} />
                                    <p className="text-sm">No opportunities yet</p>
                                </div>
                            )}
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <Link href="/admin/opportunities" className="btn btn-sm bg-[#C44536] hover:bg-[#8B3A3A] text-white border-none">
                                View All →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Blog Posts */}
                <div className="card bg-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title text-xl">Recent Blog Posts</h2>
                            <FileText className="text-[#F39C12]" size={20} />
                        </div>
                        <div className="space-y-3">
                            {recentPosts.length > 0 ? recentPosts.map((post) => (
                                <div key={post.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-sm" style={{ backgroundColor: '#F39C12', color: 'white' }}>{post.category}</span>
                                                <span className={`badge badge-sm ${post.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                                                    {post.status}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{post.timeAgo}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="mx-auto mb-2 opacity-30" size={40} />
                                    <p className="text-sm">No blog posts yet</p>
                                </div>
                            )}
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <Link href="/admin/blog" className="btn btn-sm bg-[#F39C12] hover:bg-[#D68910] text-white border-none">
                                View All →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="card bg-white shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title text-xl">New Users</h2>
                            <Users className="text-[#10B981]" size={20} />
                        </div>
                        <div className="space-y-3">
                            {recentUsers.length > 0 ? recentUsers.map((user) => (
                                <div key={user.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{user.timeAgo}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="mx-auto mb-2 opacity-30" size={40} />
                                    <p className="text-sm">No users yet</p>
                                </div>
                            )}
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <Link href="/admin/users" className="btn btn-sm bg-[#10B981] hover:bg-[#059669] text-white border-none">
                                View All →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
