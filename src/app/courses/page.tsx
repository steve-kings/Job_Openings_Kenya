import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faClock, faGraduationCap, faStar, faBookOpen, faChartLine } from '@fortawesome/free-solid-svg-icons';
import CourseThumbnailFallback from '@/components/CourseThumbnailFallback';

export const revalidate = 3600; // Revalidate every hour

export default async function CoursesPage() {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
        .from('courses')
        .select(`
            *,
            enrollments(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
    }

    const totalStudents = courses?.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0) || 0;

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative min-h-[600px] text-white overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img 
                        src="/images/yena logo.jpeg" 
                        alt="Students learning"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#5D4037]/95 via-[#8D6E63]/90 to-[#5D4037]/80"></div>
                </div>
                
                <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20 lg:py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Best Education Platform For African Youth
                        </h1>
                        <p className="text-xl mb-8 text-white/90 leading-relaxed">
                            Empower yourself with skills that matter. All courses are free and designed to prepare you for real opportunities across Africa.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="#courses" className="btn bg-[#F39C12] text-white hover:bg-[#e08d0a] border-none btn-lg px-8 shadow-xl">
                                Browse Courses
                            </Link>
                            <Link href="/about" className="btn btn-outline border-2 border-white text-white hover:bg-white hover:text-[#5D4037] btn-lg px-8">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-[#F39C12] py-8">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
                        <div>
                            <div className="text-4xl font-bold mb-2">{courses?.length || 0}+</div>
                            <div className="text-sm opacity-90">Total Courses</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">{totalStudents}+</div>
                            <div className="text-sm opacity-90">Active Students</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">100%</div>
                            <div className="text-sm opacity-90">Free Access</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">24/7</div>
                            <div className="text-sm opacity-90">Learning Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why We Offer For Growth Your Study</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Quality education designed specifically for African youth to succeed in the global market
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-[#C44536] to-[#8B3A3A] text-white rounded-2xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="text-5xl mb-4">
                                <FontAwesomeIcon icon={faGraduationCap} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Expert Instructors</h3>
                            <p className="text-white/90">Learn from industry professionals with years of real-world experience</p>
                        </div>

                        <div className="bg-gradient-to-br from-[#F39C12] to-[#C44536] text-white rounded-2xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="text-5xl mb-4">
                                <FontAwesomeIcon icon={faBookOpen} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Practical Learning</h3>
                            <p className="text-white/90">Hands-on projects and real-world applications in every course</p>
                        </div>

                        <div className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-2xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="text-5xl mb-4">
                                <FontAwesomeIcon icon={faChartLine} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Career Growth</h3>
                            <p className="text-white/90">Skills that directly connect to job opportunities across Africa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Courses Section */}
            <div id="courses" className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Upcoming Courses</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose from our curated selection of courses designed to prepare you for success
                        </p>
                    </div>

                    {!courses || courses.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No courses available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course: any) => (
                                <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 group border border-gray-100">
                                    <div className="relative h-48 overflow-hidden">
                                        <img 
                                            src={course.thumbnail_url || '/images/img2.jpg'}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = document.createElement('div');
                                                fallback.className = 'w-full h-full';
                                                target.parentElement?.appendChild(fallback);
                                            }} 
                                            alt={course.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                        />
                                        <div className="absolute top-4 right-4 bg-[#F39C12] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            FREE
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-[#C44536]/10 text-[#C44536] rounded-full text-xs font-semibold">
                                                {course.category}
                                            </span>
                                            <span className="px-3 py-1 bg-[#F39C12]/10 text-[#F39C12] rounded-full text-xs font-semibold">
                                                {course.level}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#5D4037] transition-colors">
                                            {course.title}
                                        </h3>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {course.description}
                                        </p>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faClock} className="text-[#F39C12]" />
                                                <span>{course.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faUsers} className="text-[#F39C12]" />
                                                <span>{course.enrollments?.[0]?.count || 0} enrolled</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                                <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                                <span className="text-sm text-gray-600 ml-1">(5.0)</span>
                                            </div>
                                            <Link 
                                                href={`/courses/${course.slug}`} 
                                                className="text-[#5D4037] font-semibold hover:text-[#F39C12] transition-colors"
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#5D4037] to-[#8D6E63] py-20">
                <div className="container mx-auto px-6 lg:px-12 text-center text-white">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                        Let's Go Online Education
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                        Start your learning journey today and unlock opportunities across Africa
                    </p>
                    <Link href="/login" className="btn bg-[#F39C12] text-white hover:bg-[#e08d0a] border-none btn-lg px-10">
                        Get Started Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
