'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Video, FileText, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function EditCoursePage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);

    // Form states for Course Details
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: 'Technology',
        level: 'Beginner',
        duration: '',
        instructor: '',
        status: 'draft',
        what_you_will_learn: [] as string[]
    });

    useEffect(() => {
        fetchCourseData();
    }, []);

    const fetchCourseData = async () => {
        try {
            // Fetch Course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', params.id)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData);
            setFormData({
                title: courseData.title,
                slug: courseData.slug,
                description: courseData.description,
                category: courseData.category,
                level: courseData.level,
                duration: courseData.duration,
                instructor: courseData.instructor || '',
                status: courseData.status,
                what_you_will_learn: courseData.what_you_will_learn || []
            });

            // Fetch Modules & Lessons
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select('*, lessons(*)')
                .eq('course_id', params.id)
                .order('order_index');

            if (modulesError) throw modulesError;

            // Sort lessons by order_index
            const sortedModules = modulesData?.map(m => ({
                ...m,
                lessons: m.lessons?.sort((a: any, b: any) => a.order_index - b.order_index)
            })) || [];

            setModules(sortedModules);

        } catch (error) {
            console.error('Error fetching course data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('courses')
                .update(formData)
                .eq('id', params.id);

            if (error) throw error;
            alert('Course updated successfully!');
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Error updating course');
        } finally {
            setSaving(false);
        }
    };

    // --- Module Management ---
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [isAddingModule, setIsAddingModule] = useState(false);

    const handleAddModule = async () => {
        if (!newModuleTitle.trim()) return;
        try {
            const orderIndex = modules.length + 1;
            const { data, error } = await supabase
                .from('modules')
                .insert({
                    course_id: params.id,
                    title: newModuleTitle,
                    order_index: orderIndex
                })
                .select()
                .single();

            if (error) throw error;
            setModules([...modules, { ...data, lessons: [] }]);
            setNewModuleTitle('');
            setIsAddingModule(false);
        } catch (error) {
            console.error('Error adding module:', error);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Are you sure? This will delete all lessons in this module.')) return;
        try {
            const { error } = await supabase
                .from('modules')
                .delete()
                .eq('id', moduleId);

            if (error) throw error;
            setModules(modules.filter(m => m.id !== moduleId));
        } catch (error) {
            console.error('Error deleting module:', error);
        }
    };

    // --- Lesson Management ---
    // For simplicity, we'll just show a list and a button to add/edit lessons which navigates to a lesson editor
    // OR we can do a simple inline add for now.

    // Let's do a simple inline add for Lesson Title, then Edit for details.
    const [addingLessonToModule, setAddingLessonToModule] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState('');

    const handleAddLesson = async (moduleId: string) => {
        if (!newLessonTitle.trim()) return;
        try {
            const module = modules.find(m => m.id === moduleId);
            const orderIndex = (module?.lessons?.length || 0) + 1;

            const { data, error } = await supabase
                .from('lessons')
                .insert({
                    module_id: moduleId,
                    title: newLessonTitle,
                    order_index: orderIndex
                })
                .select()
                .single();

            if (error) throw error;

            // Update local state
            const updatedModules = modules.map(m => {
                if (m.id === moduleId) {
                    return { ...m, lessons: [...(m.lessons || []), data] };
                }
                return m;
            });
            setModules(updatedModules);
            setNewLessonTitle('');
            setAddingLessonToModule(null);
        } catch (error) {
            console.error('Error adding lesson:', error);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <Link href="/admin/courses" className="btn btn-ghost gap-2 mb-2 pl-0">
                        <ArrowLeft size={20} />
                        Back to Courses
                    </Link>
                    <h1 className="text-3xl font-bold text-primary">{course?.title}</h1>
                </div>
                <div className="flex gap-2">
                    <a href={`/courses/${course?.slug}`} target="_blank" className="btn btn-outline">
                        View Public Page
                    </a>
                </div>
            </div>

            <div className="tabs tabs-boxed mb-6">
                <a
                    className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Course Details
                </a>
                <a
                    className={`tab ${activeTab === 'curriculum' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('curriculum')}
                >
                    Curriculum (Modules & Lessons)
                </a>
            </div>

            {activeTab === 'details' && (
                <form onSubmit={handleUpdateCourse} className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">Title</label>
                                <input
                                    type="text" className="input input-bordered"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">Slug</label>
                                <input
                                    type="text" className="input input-bordered bg-base-200"
                                    value={formData.slug}
                                    readOnly
                                />
                            </div>
                            <div className="form-control md:col-span-2">
                                <label className="label">Description</label>
                                <textarea
                                    className="textarea textarea-bordered h-32"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-control">
                                <label className="label">Category</label>
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
                                <label className="label">Status</label>
                                <select
                                    className="select select-bordered"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                        <div className="card-actions justify-end mt-6">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {activeTab === 'curriculum' && (
                <div className="space-y-6">
                    {modules.map((module, mIndex) => (
                        <div key={module.id} className="collapse collapse-arrow bg-base-100 shadow-md border border-base-200">
                            <input type="checkbox" defaultChecked={mIndex === 0} />
                            <div className="collapse-title text-xl font-medium flex justify-between items-center pr-12">
                                <div className="flex items-center gap-2">
                                    <span className="badge badge-neutral">Module {mIndex + 1}</span>
                                    {module.title}
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm text-error z-10"
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent collapse toggle
                                        handleDeleteModule(module.id);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="collapse-content">
                                <div className="py-4 space-y-2">
                                    {module.lessons && module.lessons.length > 0 ? (
                                        module.lessons.map((lesson: any, lIndex: number) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg group">
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{lesson.title}</span>
                                                        <span className="text-xs text-gray-500 flex gap-2">
                                                            {lesson.video_url && <span className="flex items-center gap-1"><Video size={10} /> Video</span>}
                                                            {lesson.content && <span className="flex items-center gap-1"><FileText size={10} /> Text</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/admin/courses/${params.id}/lessons/${lesson.id}`}
                                                        className="btn btn-xs btn-outline"
                                                    >
                                                        Edit Content
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No lessons in this module yet.</p>
                                    )}

                                    {/* Add Lesson Input */}
                                    {addingLessonToModule === module.id ? (
                                        <div className="flex gap-2 mt-4">
                                            <input
                                                type="text"
                                                className="input input-bordered input-sm w-full"
                                                placeholder="Lesson Title"
                                                value={newLessonTitle}
                                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                                autoFocus
                                            />
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleAddLesson(module.id)}
                                            >
                                                Add
                                            </button>
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => setAddingLessonToModule(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-sm btn-ghost gap-2 mt-2 w-full border-dashed border-2 border-base-300"
                                            onClick={() => setAddingLessonToModule(module.id)}
                                        >
                                            <Plus size={16} /> Add Lesson
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Module Section */}
                    {isAddingModule ? (
                        <div className="card bg-base-100 shadow-md p-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    placeholder="New Module Title"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={handleAddModule}>Add Module</button>
                                <button className="btn btn-ghost" onClick={() => setIsAddingModule(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="btn btn-outline btn-block border-dashed"
                            onClick={() => setIsAddingModule(true)}
                        >
                            <Plus size={20} /> Add New Module
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
