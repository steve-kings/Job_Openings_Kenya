'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Video, FileText, Lock, CheckCircle, PlayCircle } from 'lucide-react';

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [slug, setSlug] = useState<string>('');
    const [selectedLesson, setSelectedLesson] = useState<any>(null);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [allLessons, setAllLessons] = useState<any[]>([]);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [certificateId, setCertificateId] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            // Await params
            const resolvedParams = await params;
            setSlug(resolvedParams.slug);

            // Get User
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Get Course
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('slug', resolvedParams.slug)
                .single();

            if (courseError) {
                console.error('Error fetching course:', courseError);
                setLoading(false);
                return;
            }
            setCourse(courseData);

            // Get Modules & Lessons
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select('*, lessons(*)')
                .eq('course_id', courseData.id)
                .order('order_index');

            if (modulesError) {
                console.error('Error fetching modules:', modulesError);
            } else {
                console.log('Modules fetched:', modulesData?.length);
                console.log('Sample module:', modulesData?.[0]);
            }

            // Sort lessons
            const sortedModules = modulesData?.map(m => ({
                ...m,
                lessons: m.lessons?.sort((a: any, b: any) => a.order_index - b.order_index)
            })) || [];

            console.log('Sorted modules:', sortedModules.length);
            console.log('First module lessons:', sortedModules[0]?.lessons?.length);

            setModules(sortedModules);

            // Create flat list of all lessons for navigation
            const flatLessons = sortedModules.flatMap(m => m.lessons || []);
            setAllLessons(flatLessons);

            // Load completed lessons from database
            if (user && flatLessons.length > 0) {
                // Get all lesson IDs for this course
                const lessonIds = flatLessons.map(l => l.id);
                
                const { data: progressData } = await supabase
                    .from('progress')
                    .select('lesson_id')
                    .eq('user_id', user.id)
                    .in('lesson_id', lessonIds);
                
                if (progressData) {
                    const completedIds = progressData.map(p => p.lesson_id);
                    setCompletedLessons(new Set(completedIds));
                }
            }

            // Check Enrollment
            if (user) {
                const { data: enrollment } = await supabase
                    .from('enrollments')
                    .select('*')
                    .eq('course_id', courseData.id)
                    .eq('user_id', user.id)
                    .single();

                if (enrollment) setEnrolled(true);
            }

            setLoading(false);
        };

        init();
    }, []);

    const handleEnroll = async () => {
        if (!user) {
            router.push(`/login?redirect=/courses/${slug}`);
            return;
        }

        setEnrolling(true);
        try {
            const { error } = await supabase
                .from('enrollments')
                .insert({
                    course_id: course.id,
                    user_id: user.id
                });

            if (error) throw error;
            setEnrolled(true);
            alert('Successfully enrolled!');
        } catch (error) {
            console.error('Error enrolling:', error);
            alert('Error enrolling in course.');
        } finally {
            setEnrolling(false);
        }
    };

    // Navigation functions
    const getCurrentLessonIndex = () => {
        return allLessons.findIndex(l => l.id === selectedLesson?.id);
    };

    const getPreviousLesson = () => {
        const currentIndex = getCurrentLessonIndex();
        return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    };

    const getNextLesson = () => {
        const currentIndex = getCurrentLessonIndex();
        return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    };

    const goToPreviousLesson = () => {
        const prevLesson = getPreviousLesson();
        if (prevLesson) {
            setSelectedLesson(prevLesson);
        }
    };

    const goToNextLesson = () => {
        const nextLesson = getNextLesson();
        if (nextLesson) {
            setSelectedLesson(nextLesson);
        }
    };

    // Check if course is completed
    const checkCourseCompletion = async (newCompletedSet: Set<string>) => {
        if (!course || !user || !allLessons.length) return;
        
        // Check if all lessons are completed
        const allCompleted = allLessons.every(lesson => newCompletedSet.has(lesson.id));
        
        if (allCompleted) {
            // Import certificate utilities
            const { issueCertificate } = await import('@/lib/certificateUtils');
            
            // Get user name
            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            
            const userName = profileData?.full_name || user.email?.split('@')[0] || 'Student';
            
            // Issue certificate
            const result = await issueCertificate(
                user.id,
                course.id,
                userName,
                course.title
            );
            
            if (result.success && result.certificateId) {
                setCertificateId(result.certificateId);
                setShowCertificateModal(true);
            }
        }
    };

    // Progress tracking
    const toggleLessonComplete = async () => {
        if (!course || !user) return;
        
        const isCompleted = completedLessons.has(selectedLesson.id);
        
        if (isCompleted) {
            // Remove from database
            const { error } = await supabase
                .from('progress')
                .delete()
                .eq('user_id', user.id)
                .eq('lesson_id', selectedLesson.id);
            
            if (!error) {
                const newCompleted = new Set(completedLessons);
                newCompleted.delete(selectedLesson.id);
                setCompletedLessons(newCompleted);
            } else {
                console.error('Error removing progress:', error);
                alert('Error updating progress. Please try again.');
            }
        } else {
            // Add to database (only user_id and lesson_id, no course_id)
            const { error } = await supabase
                .from('progress')
                .insert({
                    user_id: user.id,
                    lesson_id: selectedLesson.id
                });
            
            if (!error) {
                const newCompleted = new Set(completedLessons);
                newCompleted.add(selectedLesson.id);
                setCompletedLessons(newCompleted);
                
                // Check if course is now complete
                await checkCourseCompletion(newCompleted);
            } else {
                console.error('Error saving progress:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                alert(`Error updating progress: ${error.message || 'Please try again.'}`);
            }
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (!course) return <div className="p-10 text-center">Course not found</div>;

    return (
        <div className="container-custom py-10">
            <Link href="/courses" className="btn btn-ghost mb-6 pl-0">← Back to Courses</Link>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="card bg-base-100 shadow-xl mb-6 overflow-hidden">
                        <figure className="h-64 relative">
                            <img src={course.thumbnail_url || 'https://via.placeholder.com/800x400'} alt={course.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <div className="badge badge-secondary border-none">{course.category}</div>
                                        <div className="badge badge-outline text-white border-white">{course.level}</div>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                                    <p className="text-gray-200">Instructor: {course.instructor}</p>
                                </div>
                            </div>
                        </figure>
                        <div className="card-body">
                            <p className="text-lg leading-relaxed mb-6">{course.description}</p>

                            <div className="divider"></div>

                            <h2 className="text-2xl font-bold mb-4">What You Will Learn</h2>
                            <ul className="space-y-2 mb-6">
                                {course.what_you_will_learn?.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="text-success shrink-0" size={20} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="divider"></div>

                            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                            <div className="space-y-3">
                                {modules.map((module, idx) => (
                                    <div key={module.id} className="collapse collapse-arrow bg-base-200">
                                        <input type="radio" name="modules" defaultChecked={idx === 0} />
                                        <div className="collapse-title text-lg font-medium">
                                            Module {idx + 1}: {module.title}
                                            <span className="text-sm text-gray-500 ml-2">({module.lessons?.length || 0} lessons)</span>
                                        </div>
                                        <div className="collapse-content">
                                            <div className="space-y-2 pt-2">
                                                {module.lessons?.map((lesson: any) => (
                                                    <div 
                                                        key={lesson.id} 
                                                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                                                            enrolled 
                                                                ? completedLessons.has(lesson.id)
                                                                    ? 'bg-[#10B981]/10 border border-[#10B981]/30 hover:bg-[#10B981]/20 cursor-pointer'
                                                                    : 'bg-base-100 hover:bg-[#C44536]/10 cursor-pointer'
                                                                : 'bg-base-100 opacity-70 cursor-not-allowed'
                                                        }`}
                                                        onClick={() => {
                                                            if (enrolled) {
                                                                setSelectedLesson(lesson);
                                                                setShowLessonModal(true);
                                                            } else {
                                                                alert('Please enroll in this course to access lessons');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {completedLessons.has(lesson.id) ? (
                                                                <CheckCircle size={18} className="text-[#10B981]" />
                                                            ) : lesson.video_url ? (
                                                                <Video size={16} className="text-[#C44536]" />
                                                            ) : (
                                                                <FileText size={16} className="text-[#F39C12]" />
                                                            )}
                                                            <span className={`font-medium ${completedLessons.has(lesson.id) ? 'text-[#10B981]' : ''}`}>
                                                                {lesson.title}
                                                            </span>
                                                            {lesson.duration && <span className="text-sm text-gray-500">({lesson.duration} min)</span>}
                                                        </div>
                                                        {enrolled ? (
                                                            completedLessons.has(lesson.id) ? (
                                                                <span className="badge bg-[#10B981] text-white border-none badge-sm">✓ Done</span>
                                                            ) : (
                                                                <PlayCircle size={18} className="text-[#C44536]" />
                                                            )
                                                        ) : (
                                                            <Lock size={16} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                ))}
                                                {(!module.lessons || module.lessons.length === 0) && (
                                                    <p className="text-sm text-gray-500 italic">No lessons yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="card bg-base-100 shadow-xl sticky top-24">
                        <div className="card-body">
                            <h3 className="text-xl font-bold mb-4">Course Info</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-semibold">{course.duration}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Level</p>
                                    <p className="font-semibold">{course.level}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Price</p>
                                    <p className="font-semibold text-success text-xl">FREE</p>
                                </div>
                            </div>
                            <div className="divider"></div>

                            {enrolled ? (
                                <Link href="/dashboard" className="btn btn-success btn-lg w-full text-white">
                                    Continue Learning
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEnroll}
                                        className="btn btn-primary btn-lg w-full"
                                        disabled={enrolling}
                                    >
                                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                    {!user && (
                                        <p className="text-xs text-center text-gray-500 mt-2">Login required to enroll</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lesson Modal */}
            {showLessonModal && selectedLesson && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-5xl max-h-[90vh] overflow-y-auto p-0">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6 z-10">
                            <button 
                                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                                onClick={() => setShowLessonModal(false)}
                            >
                                ✕
                            </button>
                            <h3 className="font-bold text-2xl pr-10">{selectedLesson.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                {selectedLesson.duration && (
                                    <div className="flex items-center gap-2">
                                        <Video size={16} />
                                        <span>{selectedLesson.duration} minutes</span>
                                    </div>
                                )}
                                {selectedLesson.video_url && (
                                    <div className="badge badge-primary badge-sm">Has Video</div>
                                )}
                                {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                                    <div className="badge badge-secondary badge-sm">{selectedLesson.resources.length} Resources</div>
                                )}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {/* Video Section */}
                            {selectedLesson.video_url && selectedLesson.video_url.trim() !== '' && !selectedLesson.video_url.includes('example') && (
                                <div className="mb-8">
                                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <Video size={20} className="text-primary" />
                                        Video Lesson
                                    </h4>
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl relative">
                                        <iframe
                                            src={(() => {
                                                const url = selectedLesson.video_url.trim();
                                                // Extract video ID from any YouTube URL format
                                                const patterns = [
                                                    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                                                    /^([a-zA-Z0-9_-]{11})$/
                                                ];
                                                for (const pattern of patterns) {
                                                    const match = url.match(pattern);
                                                    if (match && match[1]) {
                                                        return `https://www.youtube.com/embed/${match[1]}`;
                                                    }
                                                }
                                                return url.includes('embed') ? url : `https://www.youtube.com/embed/${url}`;
                                            })()}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            title={selectedLesson.title}
                                            loading="lazy"
                                        ></iframe>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <a 
                                            href={(() => {
                                                const url = selectedLesson.video_url.trim();
                                                const patterns = [
                                                    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                                                    /^([a-zA-Z0-9_-]{11})$/
                                                ];
                                                for (const pattern of patterns) {
                                                    const match = url.match(pattern);
                                                    if (match && match[1]) {
                                                        return `https://www.youtube.com/watch?v=${match[1]}`;
                                                    }
                                                }
                                                return url;
                                            })()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline gap-2"
                                        >
                                            <Video size={16} />
                                            Watch on YouTube
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Lesson Content */}
                            {selectedLesson.content && selectedLesson.content.trim() !== '' && (
                                <div className="mb-8">
                                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <FileText size={20} className="text-primary" />
                                        Lesson Content
                                    </h4>
                                    <div className="bg-base-200 rounded-lg p-6">
                                        <div className="prose max-w-none">
                                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                                {selectedLesson.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resources */}
                            {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <FileText size={20} className="text-primary" />
                                        Downloadable Resources
                                    </h4>
                                    <div className="grid gap-3">
                                        {selectedLesson.resources.map((resource: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <FileText size={20} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium group-hover:text-primary transition-colors">
                                                            {resource.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {resource.type || 'Download'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!selectedLesson.video_url && !selectedLesson.content && (!selectedLesson.resources || selectedLesson.resources.length === 0) && (
                                <div className="text-center py-12">
                                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No content available for this lesson yet.</p>
                                    <p className="text-sm text-gray-400 mt-2">The instructor will add content soon.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gradient-to-r from-[#C44536] via-[#F39C12] to-[#8B3A3A] border-t border-base-300 p-6 shadow-lg">
                            <div className="flex justify-between items-center gap-4">
                                <button 
                                    className="btn btn-ghost text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={goToPreviousLesson}
                                    disabled={!getPreviousLesson()}
                                >
                                    ← Previous
                                </button>
                                
                                <div className="flex items-center gap-3">
                                    <button 
                                        className={`btn gap-2 ${
                                            completedLessons.has(selectedLesson.id) 
                                                ? 'bg-[#10B981] hover:bg-[#059669] text-white border-none' 
                                                : 'btn-outline border-white text-white hover:bg-white hover:text-[#C44536]'
                                        }`}
                                        onClick={toggleLessonComplete}
                                    >
                                        <CheckCircle size={18} />
                                        {completedLessons.has(selectedLesson.id) ? 'Completed ✓' : 'Mark Complete'}
                                    </button>
                                    <button className="btn btn-ghost text-white hover:bg-white/20" onClick={() => setShowLessonModal(false)}>
                                        Close
                                    </button>
                                </div>
                                
                                <button 
                                    className="btn btn-ghost text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={goToNextLesson}
                                    disabled={!getNextLesson()}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/50" onClick={() => setShowLessonModal(false)}></div>
                </div>
            )}

            {/* Certificate Completion Modal */}
            {showCertificateModal && certificateId && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <div className="text-center py-8">
                            {/* Celebration Icon */}
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-[#C44536] to-[#F39C12] animate-bounce">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Congratulations Message */}
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Congratulations!
                            </h2>
                            <p className="text-xl text-gray-700 mb-2">
                                You've completed <span className="font-bold text-[#C44536]">{course.title}</span>!
                            </p>
                            <p className="text-gray-600 mb-8">
                                Your certificate has been generated and is ready to download.
                            </p>

                            {/* Certificate Preview */}
                            <div className="bg-gradient-to-r from-[#C44536]/10 via-[#F39C12]/10 to-[#10B981]/10 rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <svg className="w-16 h-16 text-[#C44536]" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Certificate ID</p>
                                <p className="font-mono text-lg font-bold text-gray-900">{certificateId}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href={`/certificates/${certificateId}`}
                                    className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none btn-lg"
                                    onClick={() => setShowCertificateModal(false)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    View Certificate
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="btn btn-outline btn-lg"
                                    onClick={() => setShowCertificateModal(false)}
                                >
                                    Go to Dashboard
                                </Link>
                            </div>

                            {/* Close Button */}
                            <button
                                className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                                onClick={() => setShowCertificateModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop bg-black/50" onClick={() => setShowCertificateModal(false)}></div>
                </div>
            )}
        </div>
    );
}
