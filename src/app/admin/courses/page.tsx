'use client'

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Course {
    id: string;
    title: string;
    category: string;
    status: string;
    created_at: string;
    // We'll need to join or count these separately if not in the main table, 
    // but for now let's assume we can get counts or just show placeholders if expensive
    // The schema doesn't have student count directly on course, so we might need a separate query or view.
    // For MVP, we can just show 0 or fetch counts if needed.
}

export default function AdminCoursesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error deleting course');
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">Manage Courses</h1>
                    <p className="text-gray-600">Create, edit, and organize your learning programs</p>
                </div>
                <Link href="/admin/courses/create" className="btn btn-primary gap-2">
                    <Plus size={20} />
                    Create New Course
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
                                placeholder="Search courses..."
                                className="input input-bordered w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
                <div className="text-center py-12">Loading courses...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                            <div className="card-body">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="badge badge-secondary">{course.category}</div>
                                    <div className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                                        {course.status}
                                    </div>
                                </div>

                                <h2 className="card-title text-lg mb-3">{course.title}</h2>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-semibold">{new Date(course.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="card-actions justify-end mt-4">
                                    <Link href={`/admin/courses/${course.id}`} className="btn btn-sm btn-outline gap-2">
                                        <Edit size={16} />
                                        Edit & Modules
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="btn btn-sm btn-outline btn-error gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredCourses.length === 0 && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body text-center py-12">
                        <p className="text-gray-500">No courses found matching your search.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
