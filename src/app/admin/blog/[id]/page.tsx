'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function EditBlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {
        fetchPost();
    }, []);

    const fetchPost = async () => {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;

            setFormData({
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                category: data.category,
                author_name: data.author_name || '',
                status: data.status
            });
            setImageUrl(data.featured_image || '');
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

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
        setSaving(true);

        try {
            const { error } = await supabase
                .from('blog_posts')
                .update({
                    ...formData,
                    featured_image: imageUrl || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', params.id);

            if (error) throw error;

            alert('Post updated successfully!');
            router.push('/admin/blog');
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Error updating post. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/admin/blog" className="btn btn-ghost gap-2 mb-2 pl-0">
                    <ArrowLeft size={20} />
                    Back to Blog Posts
                </Link>
                <h1 className="text-3xl font-bold text-primary">Edit Post</h1>
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
                                    ></textarea>
                                </div>

                                <div className="form-control">
                                    <label className="label font-medium">Content (Markdown/HTML)</label>
                                    <textarea
                                        required
                                        className="textarea textarea-bordered h-96 font-mono text-sm"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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

                                <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                                    {saving ? 'Saving...' : 'Update Post'}
                                </button>
                            </div>
                        </div>

                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="font-bold text-lg mb-4">Featured Image</h3>

                                <CloudinaryUpload
                                    onUploadComplete={(url) => setImageUrl(url)}
                                    currentImage={imageUrl}
                                    folder="yena-blog"
                                    label="Featured Image (Optional)"
                                />

                                {!imageUrl && (
                                    <div className="mt-4 rounded-lg overflow-hidden border relative bg-[#C44536] h-48 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                            <p className="font-bold text-2xl">YENA</p>
                                            <p className="text-sm opacity-75">Default placeholder will be used</p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-2">
                                    Upload an image or leave empty to use YENA branded placeholder.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
