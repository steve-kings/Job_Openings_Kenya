'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Image as ImageIcon, FileText, Edit3, Type, Settings, User, Save, Link2, Info } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function CreateBlogPostPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

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
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#C44536] transition-colors mb-4">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Blog Posts</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#F39C12]/10 rounded-xl">
                        <FileText className="text-[#F39C12]" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Create New Post</h1>
                        <p className="text-gray-600 mt-1">Share stories and insights with the YENA community</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info Card */}
                        <div className="card bg-white shadow-xl border-l-4 border-[#F39C12]">
                            <div className="card-body">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Edit3 size={20} className="text-[#F39C12]" />
                                    Post Details
                                </h3>

                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Title</span>
                                            <span className="label-text-alt text-red-500">Required</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="input input-bordered text-lg font-medium focus:border-[#F39C12] focus:outline-none"
                                            value={formData.title}
                                            onChange={handleTitleChange}
                                            placeholder="Enter an engaging post title..."
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">URL Slug</span>
                                            <span className="label-text-alt text-gray-500">Auto-generated</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                className="input input-bordered bg-gray-50 text-sm w-full pr-10"
                                                value={formData.slug}
                                                readOnly
                                            />
                                            <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Excerpt</span>
                                            <span className="label-text-alt text-red-500">Required</span>
                                        </label>
                                        <textarea
                                            required
                                            className="textarea textarea-bordered h-24 focus:border-[#F39C12] focus:outline-none"
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            placeholder="Write a compelling summary (150-200 characters)..."
                                        ></textarea>
                                        <label className="label">
                                            <span className="label-text-alt text-gray-500">{formData.excerpt.length} characters</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="card bg-white shadow-xl border-l-4 border-[#10B981]">
                            <div className="card-body">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Type size={20} className="text-[#10B981]" />
                                    Content
                                </h3>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700">Post Content (Markdown/HTML)</span>
                                        <span className="label-text-alt text-red-500">Required</span>
                                    </label>
                                    <textarea
                                        required
                                        className="textarea textarea-bordered h-96 font-mono text-sm focus:border-[#10B981] focus:outline-none"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="# Heading&#10;&#10;Write your content here using Markdown or HTML..."
                                    ></textarea>
                                    <label className="label">
                                        <span className="label-text-alt text-gray-500">Supports Markdown and HTML formatting</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publishing Card */}
                        <div className="card bg-white shadow-xl border-t-4 border-[#C44536]">
                            <div className="card-body">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Settings size={18} className="text-[#C44536]" />
                                    Publishing
                                </h3>

                                <div className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Status</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full focus:border-[#C44536] focus:outline-none"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="draft">📝 Draft</option>
                                            <option value="published">✅ Published</option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Category</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full focus:border-[#C44536] focus:outline-none"
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
                                        <label className="label">
                                            <span className="label-text font-semibold text-gray-700">Author Name</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="input input-bordered w-full pl-10 focus:border-[#C44536] focus:outline-none"
                                                value={formData.author_name}
                                                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                            />
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="divider my-4"></div>

                                <button 
                                    type="submit" 
                                    className="btn bg-[#C44536] hover:bg-[#8B3A3A] text-white border-none w-full gap-2" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Post
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Featured Image Card */}
                        <div className="card bg-white shadow-xl border-t-4 border-[#F39C12]">
                            <div className="card-body">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ImageIcon size={18} className="text-[#F39C12]" />
                                    Featured Image
                                </h3>

                                <CloudinaryUpload
                                    onUploadComplete={(url) => setImageUrl(url)}
                                    currentImage={imageUrl}
                                    folder="yena-blog"
                                    label="Upload Image"
                                />

                                {!imageUrl && (
                                    <div className="mt-4 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 h-48 flex items-center justify-center">
                                        <div className="text-center text-gray-500">
                                            <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                                            <p className="font-semibold text-sm">No image uploaded</p>
                                            <p className="text-xs mt-1">YENA placeholder will be used</p>
                                        </div>
                                    </div>
                                )}

                                <div className="alert alert-info mt-3 py-2">
                                    <Info size={16} />
                                    <span className="text-xs">Optional. Leave empty for default YENA branding.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
