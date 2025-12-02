'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Trash2, FileText, Video, Link as LinkIcon, File } from 'lucide-react';
import Link from 'next/link';

interface Resource {
    name: string;
    url: string;
    type: string;
}

export default function EditLessonPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [lesson, setLesson] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        video_url: '',
        duration: 0,
        content: '',
        resources: [] as Resource[]
    });



    useEffect(() => {
        fetchLesson();
    }, []);

    const fetchLesson = async () => {
        try {
            const { data, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', params.lessonId)
                .single();

            if (error) throw error;
            setLesson(data);
            setFormData({
                title: data.title,
                video_url: data.video_url || '',
                duration: data.duration || 0,
                content: data.content || '',
                resources: data.resources || []
            });
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract video ID from any YouTube URL format
    const extractVideoId = (input: string): string => {
        if (!input || input.trim() === '') return '';
        
        const trimmedInput = input.trim();
        
        // Match various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/ // Just the ID
        ];
        
        for (const pattern of patterns) {
            const match = trimmedInput.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return trimmedInput; // Return as-is if no match
    };

    // Generate YouTube watch URL from video ID
    const extractYouTubeUrl = (input: string): string => {
        const videoId = extractVideoId(input);
        if (!videoId) return '';
        return `https://www.youtube.com/watch?v=${videoId}`;
    };

    const handleUpdateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Save the complete URL as entered
            const { error } = await supabase
                .from('lessons')
                .update(formData)
                .eq('id', params.lessonId);

            if (error) throw error;
            
            alert('Lesson updated successfully!');
        } catch (error) {
            console.error('Error updating lesson:', error);
            alert('Error updating lesson');
        } finally {
            setSaving(false);
        }
    };

    const addResourceManually = async () => {
        const resourceName = prompt('Enter resource name (e.g., "Lesson Notes.pdf"):');
        if (!resourceName) return;

        const resourceUrl = prompt('Enter resource URL (Google Drive, Dropbox, etc.):');
        if (!resourceUrl) return;

        const resourceType = prompt('Enter resource type (e.g., "PDF", "Document", "Video"):', 'PDF');

        try {
            const newResource: Resource = {
                name: resourceName,
                url: resourceUrl,
                type: resourceType || 'file'
            };

            const updatedResources = [...formData.resources, newResource];
            setFormData({ ...formData, resources: updatedResources });

            // Auto-save
            await supabase
                .from('lessons')
                .update({ resources: updatedResources })
                .eq('id', params.lessonId);

            alert('Resource added successfully!');
        } catch (error) {
            console.error('Error adding resource:', error);
            alert('Error adding resource');
        }
    };

    const removeResource = async (index: number) => {
        if (!confirm('Remove this resource?')) return;

        const updatedResources = formData.resources.filter((_, i) => i !== index);
        setFormData({ ...formData, resources: updatedResources });

        // Auto-save
        await supabase
            .from('lessons')
            .update({ resources: updatedResources })
            .eq('id', params.lessonId);
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-6">
                <Link href={`/admin/courses/${params.id}`} className="btn btn-ghost gap-2 mb-2 pl-0">
                    <ArrowLeft size={20} />
                    Back to Course
                </Link>
                <h1 className="text-3xl font-bold text-primary">Edit Lesson</h1>
            </div>

            <form onSubmit={handleUpdateLesson} className="space-y-8">
                {/* Main Content */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="form-control mb-4">
                            <label className="label font-medium">Lesson Title</label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control col-span-2">
                            <label className="label font-medium">
                                <span className="flex items-center gap-2"><Video size={16} /> YouTube Video (Optional)</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered font-mono"
                                placeholder="Paste YouTube URL (e.g., https://youtu.be/hvwVj8p39dc) - Leave empty if no video"
                                value={formData.video_url}
                                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            />
                            <label className="label">
                                <span className="label-text-alt text-gray-500">
                                    Paste any YouTube URL format - it will be automatically converted. Students get a "Watch on YouTube" button.
                                </span>
                            </label>
                            {formData.video_url && formData.video_url.trim() && (
                                <div className="mt-2 p-3 bg-success/10 border border-success rounded-lg">
                                    <div className="flex items-center gap-2 text-success mb-1">
                                        <Video size={16} />
                                        <span className="text-sm font-semibold">Video Link Preview</span>
                                    </div>
                                    <a 
                                        href={extractYouTubeUrl(formData.video_url.trim())}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm link link-primary"
                                    >
                                        {extractYouTubeUrl(formData.video_url.trim())}
                                    </a>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Video ID: {extractVideoId(formData.video_url.trim())}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="form-control">
                                <label className="label font-medium">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label font-medium">
                                <span className="flex items-center gap-2"><FileText size={16} /> Text Content</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-64 font-mono text-sm"
                                placeholder="Write your lesson content here (Markdown supported)..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            ></textarea>
                            <label className="label">
                                <span className="label-text-alt text-gray-500">Supports basic HTML/Markdown</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Resources */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">
                            <LinkIcon size={20} /> Resources
                        </h2>

                        <div className="space-y-3 mb-6">
                            {formData.resources.length === 0 && (
                                <p className="text-gray-500 italic text-sm">No resources attached.</p>
                            )}
                            {formData.resources.map((resource, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <File size={18} className="text-primary" />
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="link link-hover font-medium">
                                            {resource.name}
                                        </a>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={() => removeResource(index)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Add Resource</span>
                            </label>
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    className="btn btn-outline btn-primary gap-2"
                                    onClick={addResourceManually}
                                >
                                    <LinkIcon size={18} />
                                    Add Resource Link
                                </button>
                                <p className="text-sm text-gray-500">
                                    Add links to resources hosted on Google Drive, Dropbox, or any other platform
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
                    <button type="submit" className="btn btn-primary gap-2" disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
