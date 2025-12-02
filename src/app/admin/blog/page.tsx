'use client'

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminBlogPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Error deleting post');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Manage Blog Posts</h1>
                    <p className="text-gray-600">Create and manage success stories, insights, and organizational news</p>
                </div>
                <Link href="/admin/blog/create" className="btn btn-primary gap-2">
                    <Plus size={20} />
                    Create New Post
                </Link>
            </div>

            {/* Search */}
            <div className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                    <div className="form-control">
                        <div className="input-group">
                            <span className="bg-base-200">
                                <Search size={20} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search blog posts..."
                                className="input input-bordered w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Posts Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-8">Loading posts...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Author</th>
                                        <th>Status</th>
                                        <th>Views</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.map((post) => (
                                        <tr key={post.id}>
                                            <td className="font-medium max-w-xs truncate" title={post.title}>{post.title}</td>
                                            <td>
                                                <span className="badge badge-primary badge-sm">{post.category}</span>
                                            </td>
                                            <td className="text-sm">{post.author_name}</td>
                                            <td>
                                                <span className={`badge badge-sm ${post.status === 'published' ? 'badge-success' : 'badge-warning'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="text-sm flex items-center gap-1">
                                                <Eye size={14} className="text-gray-500" />
                                                {post.views?.toLocaleString() || 0}
                                            </td>
                                            <td className="text-sm text-gray-600">{new Date(post.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/blog/${post.id}`} className="btn btn-ghost btn-xs" title="Edit">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="btn btn-ghost btn-xs text-error"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filteredPosts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No blog posts found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
