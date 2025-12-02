'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPostPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Success Story',
        author_name: 'YENA Team',
        status: 'draft'
    });

    const [imageUrl, setImageUrl] = useState('');

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('blog_posts')
                .insert({
                    ...formData,
                    featured_image: imageUrl || null, // Use null if no URL provided
                    published_at: formData.status === 'published' ? new Date().toISOString() : null
                });

            if (error) throw error;

            router.push('/admin/blog');
            router.refresh();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/admin/blog" className="btn btn-ghost gap-2 mb-2 pl-0">
                    <ArrowLeft size={20} />
                    Back to Blog Posts
                </Link>
                <h1 className="text-3xl font-bold text-primary">Create New Post</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="form-control">
                                    <label className="label font-medium">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="input input-bordered text-lg font-medium"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        placeholder="Enter post title"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label font-medium">Slug</label>
                                    <input
                                        type="text"
                                        required
                                        className="input input-bordered bg-base-200 text-sm"
                                        value={formData.slug}
                                        readOnly
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label font-medium">Excerpt</label>
                                    <textarea
                                        required
                                        className="textarea textarea-bordered h-24"
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="Short summary for cards and SEO..."
                                    ></textarea>
                                </div>

                                <div className="form-control">
                                    <label className="label font-medium">Content (Markdown/HTML)</label>
                                    <textarea
                                        required
                                        className="textarea textarea-bordered h-96 font-mono text-sm"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="# Heading&#10;&#10;Write your content here..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="font-bold text-lg mb-4">Publishing</h3>

                                <div className="form-control mb-4">
                                    <label className="label font-medium">Status</label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label font-medium">Category</label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Success Story</option>
                                        <option>Career Insights</option>
                                        <option>Organization News</option>
                                        <option>How-To</option>
                                        <option>Events</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label font-medium">Author Name</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={formData.author_name}
                                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                    />
                                </div>

                                <div className="divider"></div>

                                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Post'}
                                </button>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="font-bold text-lg mb-4">Featured Image</h3>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Image URL (Optional)</span>
                                        <span className="label-text-alt text-xs">Use /images/your-image.jpg or external URL</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        placeholder="/images/your-image.jpg or external URL"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                    />
                                    {imageUrl && (
                                        <div className="mt-4 rounded-lg overflow-hidden border relative">
                                            <img src={imageUrl} alt="Preview" className="w-full h-auto" />
                                            {/* YENA Watermark Preview - Bright & Creative */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="relative">
                                                    <span className="text-white font-black text-5xl rotate-[-15deg] uppercase tracking-[0.3em] opacity-30 drop-shadow-[0_0_20px_rgba(243,156,18,0.5)]" style={{ textShadow: '0 0 30px rgba(243,156,18,0.6), 0 0 60px rgba(196,69,54,0.4)' }}>
                                                        YENA
                                                    </span>
                                                    <div className="absolute -top-2 -left-2 w-12 h-0.5 bg-[#F39C12] opacity-50 rotate-[-15deg]"></div>
                                                    <div className="absolute -bottom-2 -right-2 w-12 h-0.5 bg-[#C44536] opacity-50 rotate-[-15deg]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!imageUrl && (
                                        <div className="mt-4 rounded-lg overflow-hidden border relative bg-gradient-to-br from-[#C44536] to-[#8B3A3A] h-48 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                                <p className="font-bold text-2xl">YENA</p>
                                                <p className="text-sm opacity-75">Default watermark will be used</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Leave empty to use YENA branded placeholder. All images will have YENA watermark overlay.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
