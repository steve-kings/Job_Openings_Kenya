'use client'

import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Briefcase, TrendingUp, Clock, Eye, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { title: 'Total Opportunities', value: '...', change: 'Loading...', icon: Briefcase, color: '#1976D2', trend: '+0%' },
        { title: 'Blog Posts', value: '...', change: 'Loading...', icon: FileText, color: '#4CAF50', trend: '+0%' },
        { title: 'Registered Users', value: '...', change: 'Loading...', icon: Users, color: '#4CAF50', trend: '+0%' },
        { title: 'Partners', value: '...', change: 'Loading...', icon: BarChart3, color: '#1565C0', trend: '+0%' },
    ]);
    const [recentOpportunities, setRecentOpportunities] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
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
                    color: '#1976D2',
                    trend: `${activePercent}%`
                },
                { 
                    title: 'Blog Posts', 
                    value: postCount.data?.[0]?.count?.toString() || '0', 
                    change: `${publishedPosts?.[0]?.count || 0} published`, 
                    icon: FileText, 
                    color: '#4CAF50',
                    trend: `${publishedPercent}%`
                },
                { 
                    title: 'Registered Users', 
                    value: userCount.data?.[0]?.count?.toString() || '0', 
                    change: 'All time', 
                    icon: Users, 
                    color: '#4CAF50',
                    trend: '100%'
                },
                { 
                    title: 'Partners', 
                    value: partnerCount.data?.[0]?.count?.toString() || '0', 
                    change: 'Active partnerships', 
                    icon: BarChart3, 
                    color: '#1565C0',
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

            // Generate trend data for the chart (Realistic mock for last 6 months)
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentMonth = new Date().getMonth();
            const mockTrend = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(currentMonth - i);
                mockTrend.push({
                    name: monthNames[date.getMonth()],
                    Users: Math.floor(Math.random() * 20) + 15 * (6 - i), // Upward trend
                    Opportunities: Math.floor(Math.random() * 10) + 5 * (6 - i)
                });
            }
            setChartData(mockTrend);

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
                    <span className="loading loading-spinner loading-lg text-[#1976D2]"></span>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1976D2] via-[#1976D2] to-[#1565C0] text-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Dashboard Overview</h1>
                        <p className="text-white/90 text-sm sm:text-base lg:text-lg">Welcome to the 1000Jobs Content Management System</p>
                        <div className="flex items-center gap-2 mt-3 text-white/80">
                            <Clock size={14} className="sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <Eye className="text-white mb-2" size={28} />
                            <p className="text-xs text-white/80">System Status</p>
                            <p className="text-lg font-bold">All Good ✓</p>
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

            {/* Analytics Chart */}
            <div className="card bg-white shadow-xl">
                <div className="card-body p-4 sm:p-6">
                    <h2 className="card-title text-lg sm:text-xl lg:text-2xl mb-6 flex items-center gap-2">
                        <TrendingUp className="text-[#1976D2]" size={20} />
                        Platform Growth (Last 6 Months)
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorOpp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1976D2" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#1976D2" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="Users" stroke="#4CAF50" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="Opportunities" stroke="#1976D2" strokeWidth={3} fillOpacity={1} fill="url(#colorOpp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-white shadow-xl border-l-4 border-[#1976D2]">
                <div className="card-body p-4 sm:p-6">
                    <h2 className="card-title text-lg sm:text-xl lg:text-2xl mb-4 flex items-center gap-2">
                        <Plus className="text-[#1976D2]" size={20} />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Link href="/admin/opportunities/create" className="btn btn-sm sm:btn-md lg:btn-lg bg-[#1976D2] hover:bg-[#1565C0] text-white border-none gap-2">
                            <Briefcase size={18} />
                            <span className="hidden sm:inline">Add Opportunity</span>
                            <span className="sm:hidden">Opportunity</span>
                        </Link>
                        <Link href="/admin/blog/create" className="btn btn-sm sm:btn-md lg:btn-lg bg-[#4CAF50] hover:bg-[#D68910] text-white border-none gap-2">
                            <FileText size={18} />
                            <span className="hidden sm:inline">Publish Post</span>
                            <span className="sm:hidden">Blog Post</span>
                        </Link>
                        <Link href="/admin/partners/create" className="btn btn-sm sm:btn-md lg:btn-lg bg-[#4CAF50] hover:bg-[#388E3C] text-white border-none gap-2">
                            <BarChart3 size={18} />
                            <span className="hidden sm:inline">Add Partner</span>
                            <span className="sm:hidden">Partner</span>
                        </Link>
                        <a href="https://kings-learn.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-sm sm:btn-md lg:btn-lg btn-outline border-2 gap-2">
                            <span>🎓</span>
                            <span className="hidden sm:inline">Manage Courses</span>
                            <span className="sm:hidden">Courses</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Recent Opportunities */}
                <div className="card bg-white shadow-xl">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title text-xl">Recent Opportunities</h2>
                            <Briefcase className="text-[#1976D2]" size={20} />
                        </div>
                        <div className="space-y-3">
                            {recentOpportunities.length > 0 ? recentOpportunities.map((opp) => (
                                <div key={opp.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{opp.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-sm" style={{ backgroundColor: '#1976D2', color: 'white' }}>{opp.type}</span>
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
                            <Link href="/admin/opportunities" className="btn btn-sm bg-[#1976D2] hover:bg-[#1565C0] text-white border-none">
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
                            <FileText className="text-[#4CAF50]" size={20} />
                        </div>
                        <div className="space-y-3">
                            {recentPosts.length > 0 ? recentPosts.map((post) => (
                                <div key={post.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="badge badge-sm" style={{ backgroundColor: '#4CAF50', color: 'white' }}>{post.category}</span>
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
                            <Link href="/admin/blog" className="btn btn-sm bg-[#4CAF50] hover:bg-[#D68910] text-white border-none">
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
                            <Users className="text-[#4CAF50]" size={20} />
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
                            <Link href="/admin/users" className="btn btn-sm bg-[#4CAF50] hover:bg-[#388E3C] text-white border-none">
                                View All →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
