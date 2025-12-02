'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, TrendingUp, Clock, Play, CheckCircle, Target } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faTrophy, faChartLine } from '@fortawesome/free-solid-svg-icons';
import CourseThumbnailFallback from '@/components/CourseThumbnailFallback';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push('/login?redirect=/dashboard');
                return;
            }

            setUser(user);

            // Get profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            setProfile(profileData);

            // Get enrolled courses with progress
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select(`
                    *,
                    courses (
                        id,
                        slug,
                        title,
                        thumbnail_url,
                        modules (
                            id,
                            lessons (
                                id
                            )
                        )
                    )
                `)
                .eq('user_id', user.id);

            if (enrollments) {
                const coursesWithProgress = await Promise.all(
                    enrollments.map(async (enrollment: any) => {
                        const course = enrollment.courses;
                        
                        // Calculate total lessons
                        const totalLessons = course.modules?.reduce(
                            (sum: number, module: any) => sum + (module.lessons?.length || 0),
                            0
                        ) || 0;

                        // Get completed lessons from database
                        // Get all lesson IDs for this course
                        const lessonIds = course.modules?.flatMap((m: any) => 
                            m.lessons?.map((l: any) => l.id) || []
                        ) || [];
                        
                        const { data: progressData } = await supabase
                            .from('progress')
                            .select('lesson_id')
                            .eq('user_id', user.id)
                            .in('lesson_id', lessonIds);

                        const completedCount = progressData?.length || 0;
                        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                        return {
                            ...course,
                            progress,
                            enrolled_at: enrollment.enrolled_at
                        };
                    })
                );

                setEnrolledCourses(coursesWithProgress);
            }

            // Get user certificates
            const { data: certificatesData } = await supabase
                .from('certificates')
                .select('*')
                .eq('user_id', user.id)
                .order('issued_at', { ascending: false });
            
            if (certificatesData) {
                setCertificates(certificatesData);
            }

            setLoading(false);
        };

        init();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-[#C44536]"></span>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
    const completedCourses = enrolledCourses.filter(c => c.progress === 100).length;
    const inProgressCourses = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length;
    const avgProgress = enrolledCourses.length > 0 
        ? Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)
        : 0;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#C44536] to-[#8B3A3A] text-white py-12">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                                Welcome back, {userName}!
                            </h1>
                            <p className="text-white/90 text-lg">{user?.email}</p>
                            <p className="text-white/80 mt-2">Continue your learning journey</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/courses" className="btn bg-[#F39C12] text-white hover:bg-[#e08d0a] border-none">
                                <BookOpen size={20} />
                                Browse Courses
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-6 lg:px-12 -mt-8 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat 1 */}
                    <div className="stats shadow-xl bg-white">
                        <div className="stat">
                            <div className="stat-figure text-[#C44536]">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-4xl" />
                            </div>
                            <div className="stat-title text-gray-600">Enrolled Courses</div>
                            <div className="stat-value text-[#C44536]">{enrolledCourses.length}</div>
                            <div className="stat-desc text-gray-500">Total courses</div>
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="stats shadow-xl bg-white">
                        <div className="stat">
                            <div className="stat-figure text-[#F39C12]">
                                <FontAwesomeIcon icon={faChartLine} className="text-4xl" />
                            </div>
                            <div className="stat-title text-gray-600">In Progress</div>
                            <div className="stat-value text-[#F39C12]">{inProgressCourses}</div>
                            <div className="stat-desc text-gray-500">Active learning</div>
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="stats shadow-xl bg-white">
                        <div className="stat">
                            <div className="stat-figure text-[#10B981]">
                                <FontAwesomeIcon icon={faTrophy} className="text-4xl" />
                            </div>
                            <div className="stat-title text-gray-600">Completed</div>
                            <div className="stat-value text-[#10B981]">{completedCourses}</div>
                            <div className="stat-desc text-gray-500">Certificates earned</div>
                        </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="stats shadow-xl bg-white">
                        <div className="stat">
                            <div className="stat-figure text-[#8B3A3A]">
                                <Target size={40} />
                            </div>
                            <div className="stat-title text-gray-600">Avg Progress</div>
                            <div className="stat-value text-[#8B3A3A]">{avgProgress}%</div>
                            <div className="stat-desc text-gray-500">Overall completion</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 lg:px-12 pb-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Courses Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
                            {enrolledCourses.length > 0 && (
                                <div className="tabs tabs-boxed bg-white shadow">
                                    <a className="tab tab-active">All</a>
                                    <a className="tab">In Progress</a>
                                    <a className="tab">Completed</a>
                                </div>
                            )}
                        </div>

                        {enrolledCourses.length > 0 ? (
                            <div className="space-y-6">
                                {enrolledCourses.map((course) => (
                                    <div key={course.id} className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-[#C44536]">
                                        <div className="grid md:grid-cols-3 gap-0">
                                            <figure className="h-full min-h-[200px] relative overflow-hidden">
                                                <img 
                                                    src={course.thumbnail_url || '/images/img3.jpg'}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }} 
                                                    alt={course.title} 
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                                                />
                                                {course.progress === 100 && (
                                                    <div className="absolute top-4 right-4 bg-[#10B981] text-white p-2 rounded-full">
                                                        <CheckCircle size={24} />
                                                    </div>
                                                )}
                                            </figure>
                                            <div className="md:col-span-2 card-body">
                                                <h3 className="card-title text-2xl text-gray-900">{course.title}</h3>
                                                
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={16} />
                                                        Enrolled {new Date(course.enrolled_at).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="font-semibold text-gray-700">Progress</span>
                                                        <span className="font-bold text-[#C44536]">{course.progress}%</span>
                                                    </div>
                                                    <progress 
                                                        className={`progress w-full ${
                                                            course.progress === 100 ? 'progress-success' : 
                                                            course.progress > 50 ? 'progress-warning' : 
                                                            'progress-error'
                                                        }`} 
                                                        value={course.progress} 
                                                        max="100"
                                                    ></progress>
                                                </div>

                                                <div className="card-actions justify-between items-center">
                                                    <div className="flex gap-2">
                                                        {course.progress === 100 ? (
                                                            <div className="badge badge-success gap-2">
                                                                <CheckCircle size={14} />
                                                                Completed
                                                            </div>
                                                        ) : course.progress > 0 ? (
                                                            <div className="badge badge-warning gap-2">
                                                                <Play size={14} />
                                                                In Progress
                                                            </div>
                                                        ) : (
                                                            <div className="badge badge-ghost">Not Started</div>
                                                        )}
                                                        {course.progress === 100 && certificates.find(c => c.course_id === course.id) && (
                                                            <Link 
                                                                href={`/certificates/${certificates.find(c => c.course_id === course.id)?.certificate_id}`}
                                                                className="badge bg-[#F39C12] text-white gap-2 hover:bg-[#e08d0a] cursor-pointer"
                                                            >
                                                                <Award size={14} />
                                                                Certificate
                                                            </Link>
                                                        )}
                                                    </div>
                                                    <Link 
                                                        href={`/courses/${course.slug}`} 
                                                        className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none"
                                                    >
                                                        {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card bg-white shadow-xl">
                                <div className="card-body text-center py-16">
                                    <div className="text-6xl mb-4 text-gray-300">
                                        <BookOpen className="mx-auto" size={80} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Yet</h3>
                                    <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                                    <Link href="/courses" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none btn-lg">
                                        Browse Courses
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="card bg-white shadow-xl">
                            <div className="card-body">
                                <h3 className="card-title text-lg mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link href="/courses" className="btn btn-outline w-full justify-start gap-2">
                                        <BookOpen size={18} />
                                        Browse All Courses
                                    </Link>
                                    <Link href="/jobs" className="btn btn-outline w-full justify-start gap-2">
                                        <TrendingUp size={18} />
                                        Find Opportunities
                                    </Link>
                                    <Link href="/blog" className="btn btn-outline w-full justify-start gap-2">
                                        <Award size={18} />
                                        Read Success Stories
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Learning Goals */}
                        <div className="card bg-gradient-to-br from-[#F39C12] to-[#C44536] text-white shadow-xl">
                            <div className="card-body">
                                <h3 className="card-title text-lg mb-4">Your Learning Goal</h3>
                                <div className="text-center py-4">
                                    <div className="text-5xl font-bold mb-2">{avgProgress}%</div>
                                    <p className="text-white/90">Average Completion</p>
                                </div>
                                <div className="divider before:bg-white/20 after:bg-white/20"></div>
                                <p className="text-sm text-white/90">
                                    {avgProgress < 50 
                                        ? "Keep going! You're making great progress." 
                                        : avgProgress < 100 
                                        ? "Almost there! Finish strong!" 
                                        : "Amazing! You've completed all your courses!"}
                                </p>
                            </div>
                        </div>

                        {/* Certificates */}
                        {certificates.length > 0 && (
                            <div className="card bg-white shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4 flex items-center gap-2">
                                        <Award className="text-[#F39C12]" size={24} />
                                        My Certificates
                                    </h3>
                                    <div className="space-y-3">
                                        {certificates.map((cert) => (
                                            <Link
                                                key={cert.id}
                                                href={`/certificates/${cert.certificate_id}`}
                                                className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#C44536]/10 to-[#F39C12]/10 rounded-lg hover:from-[#C44536]/20 hover:to-[#F39C12]/20 transition-all"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C44536] to-[#F39C12] flex items-center justify-center text-white">
                                                    <Award size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm">{cert.course_name}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {new Date(cert.completion_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        {completedCourses > 0 && (
                            <div className="card bg-white shadow-xl">
                                <div className="card-body">
                                    <h3 className="card-title text-lg mb-4">Achievements</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-[#10B981]/10 rounded-lg">
                                            <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white">
                                                <Award size={24} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Course Completer</p>
                                                <p className="text-sm text-gray-600">{completedCourses} course{completedCourses > 1 ? 's' : ''} completed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
