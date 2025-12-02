'use client'

import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, Briefcase } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
    const [stats, setStats] = useState([
        { title: 'Total Opportunities', value: '...', change: 'Loading...', icon: Briefcase, color: 'text-primary' },
        { title: 'Total Courses', value: '...', change: 'Loading...', icon: BookOpen, color: 'text-secondary' },
        { title: 'Registered Users', value: '...', change: 'Loading...', icon: Users, color: 'text-accent' },
        { title: 'Blog Posts', value: '...', change: 'Loading...', icon: BarChart3, color: 'text-success' },
    ]);
    const [recentOpportunities, setRecentOpportunities] = useState<any[]>([]);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch counts
            const [oppCount, courseCount, userCount, postCount] = await Promise.all([
                supabase.from('opportunities').select('count'),
                supabase.from('courses').select('count'),
                supabase.from('profiles').select('count'),
                supabase.from('blog_posts').select('count'),
            ]);

            setStats([
                { title: 'Total Opportunities', value: oppCount.data?.[0]?.count?.toString() || '0', change: 'All time', icon: Briefcase, color: 'text-primary' },
                { title: 'Total Courses', value: courseCount.data?.[0]?.count?.toString() || '0', change: 'All time', icon: BookOpen, color: 'text-secondary' },
                { title: 'Registered Users', value: userCount.data?.[0]?.count?.toString() || '0', change: 'All time', icon: Users, color: 'text-accent' },
                { title: 'Blog Posts', value: postCount.data?.[0]?.count?.toString() || '0', change: 'All time', icon: BarChart3, color: 'text-success' },
            ]);

            // Fetch recent opportunities
            const { data: opportunities } = await supabase
                .from('opportunities')
                .select('id, title, type, status, created_at')
                .order('created_at', { ascending: false })
                .limit(3);

            if (opportunities) {
                setRecentOpportunities(opportunities.map(opp => ({
                    ...opp,
                    date: new Date(opp.created_at).toLocaleDateString()
                })));
            }

            // Fetch recent users
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, created_at')
                .order('created_at', { ascending: false })
                .limit(3);

            if (profiles) {
                setRecentUsers(profiles.map(profile => ({
                    id: profile.id,
                    name: profile.full_name || 'Anonymous',
                    email: 'user@example.com',
                    joined: new Date(profile.created_at).toLocaleDateString()
                })));
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome to the YENA Content Management System</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-success mt-1">{stat.change}</p>
                                    </div>
                                    <Icon className={`${stat.color} w-10 h-10`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Opportunities */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Recent Opportunities</h2>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Posted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOpportunities.length > 0 ? recentOpportunities.map((opp) => (
                                        <tr key={opp.id}>
                                            <td className="font-medium">{opp.title}</td>
                                            <td><span className="badge badge-primary badge-sm">{opp.type}</span></td>
                                            <td>
                                                <span className={`badge badge-sm ${opp.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                                                    {opp.status}
                                                </span>
                                            </td>
                                            <td className="text-sm text-gray-500">{opp.date}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center text-gray-500">No opportunities yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <a href="/admin/opportunities" className="btn btn-primary btn-sm">View All</a>
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Recent User Registrations</h2>
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.length > 0 ? recentUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-medium">{user.name}</td>
                                            <td className="text-sm">{user.email}</td>
                                            <td className="text-sm text-gray-500">{user.joined}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="text-center text-gray-500">No users yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <a href="/admin/users" className="btn btn-primary btn-sm">View All</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body">
                    <h2 className="card-title mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <a href="/admin/opportunities" className="btn btn-primary">+ Add Opportunity</a>
                        <a href="/admin/courses" className="btn btn-secondary">+ Create Course</a>
                        <a href="/admin/blog" className="btn btn-accent">+ Publish Blog Post</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
