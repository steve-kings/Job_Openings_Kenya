'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Upload, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateCoursePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: 'Technology',
        level: 'Beginner',
        duration: '',
        instructor: '',
        status: 'draft'
    });

    const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
    const [learnItems, setLearnItems] = useState<string[]>(['']);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        });
    };



    const handleLearnItemChange = (index: number, value: string) => {
        const newItems = [...learnItems];
        newItems[index] = value;
        setLearnItems(newItems);
    };

    const addLearnItem = () => {
        setLearnItems([...learnItems, '']);
    };

    const removeLearnItem = (index: number) => {
        const newItems = learnItems.filter((_, i) => i !== index);
        setLearnItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('courses')
                .insert({
                    ...formData,
                    thumbnail_url: thumbnailUrl || null,
                    what_you_will_learn: learnItems.filter(item => item.trim() !== '')
                });

            if (error) throw error;

            router.push('/admin/courses');
            router.refresh();
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Error creating course. Please try again.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/admin/courses" className="btn btn-ghost gap-2 mb-2 pl-0">
                    <ArrowLeft size={20} />
                    Back to Courses
                </Link>
                <h1 className="text-3xl font-bold text-primary">Create New Course</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Basic Information</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Course Title</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="e.g. Full Stack Web Development"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Slug</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered bg-base-200"
                                    value={formData.slug}
                                    readOnly
                                />
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text font-medium">Description</span>
                                </label>
                                <textarea
                                    required
                                    className="textarea textarea-bordered h-32"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Course description..."
                                ></textarea>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Category</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option>Technology</option>
                                    <option>Business</option>
                                    <option>Marketing</option>
                                    <option>Design</option>
                                    <option>Data & Analytics</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Level</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                    <option>All Levels</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Duration</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g. 12 weeks"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Instructor</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered"
                                    value={formData.instructor}
                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                    placeholder="Instructor name"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media & Details */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Media & Details</h2>

                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-medium">Course Thumbnail URL</span>
                                <span className="label-text-alt text-xs">Use external URL (Unsplash, etc.) or /images/your-image.jpg</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="https://images.unsplash.com/... or /images/course.jpg"
                                value={thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                            />
                            {thumbnailUrl && (
                                <div className="mt-4 rounded-lg overflow-hidden border max-w-md">
                                    <img src={thumbnailUrl} alt="Preview" className="w-full h-48 object-cover" onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/images/yena logo.jpeg';
                                    }} />
                                </div>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">What You Will Learn</span>
                            </label>
                            <div className="space-y-2">
                                {learnItems.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            value={item}
                                            onChange={(e) => handleLearnItemChange(index, e.target.value)}
                                            placeholder="e.g. Build responsive websites"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-square btn-ghost text-error"
                                            onClick={() => removeLearnItem(index)}
                                            disabled={learnItems.length === 1}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm gap-2 mt-2"
                                    onClick={addLearnItem}
                                >
                                    <Plus size={16} />
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                </div>
            </form>
        </div>
    );
}
