import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faClock, faStar } from '@fortawesome/free-solid-svg-icons';
import CoursesHeroSlider from '@/components/CoursesHeroSlider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CoursesPage() {
    let courses = null;
    let totalStudents = 0;

    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                enrollments(count)
            `)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching courses:', error);
        } else {
            courses = data;
            totalStudents = courses?.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0) || 0;
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }

    return (
        <div className="bg-white">
            {/* Hero Slider */}
            <CoursesHeroSlider />

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-[#C44536] to-[#F39C12] py-12">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
                        <div className="group">
                            <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">{courses?.length || 0}+</div>
                            <div className="text-base font-semibold opacity-90">Total Courses</div>
                            <div className="text-xs opacity-75 mt-1">Available Now</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">{totalStudents}+</div>
                            <div className="text-base font-semibold opacity-90">Active Students</div>
                            <div className="text-xs opacity-75 mt-1">Learning Today</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">100%</div>
                            <div className="text-base font-semibold opacity-90">Free Access</div>
                            <div className="text-xs opacity-75 mt-1">No Hidden Fees</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-black mb-2 group-hover:scale-110 transition-transform">24/7</div>
                            <div className="text-base font-semibold opacity-90">Learning Support</div>
                            <div className="text-xs opacity-75 mt-1">Always Available</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Why Learn With YENA?</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Quality education designed specifically for African youth to succeed in the global market
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="absolute inset-0">
                                <img src="/images/img5.jpg" alt="Expert Instructors" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#C44536]/95 to-[#8B3A3A]/95 group-hover:from-[#C44536]/90 group-hover:to-[#8B3A3A]/90 transition-all"></div>
                            </div>
                            <div className="relative p-8 text-white">
                                <div className="w-16 h-1 bg-white mb-6"></div>
                                <h3 className="text-3xl font-bold mb-4">Expert Instructors</h3>
                                <p className="text-white/95 text-lg leading-relaxed">Learn from industry professionals with years of real-world experience and proven track records</p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="absolute inset-0">
                                <img src="/images/img6 (2).jpg" alt="Practical Learning" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#F39C12]/95 to-[#C44536]/95 group-hover:from-[#F39C12]/90 group-hover:to-[#C44536]/90 transition-all"></div>
                            </div>
                            <div className="relative p-8 text-white">
                                <div className="w-16 h-1 bg-white mb-6"></div>
                                <h3 className="text-3xl font-bold mb-4">Practical Learning</h3>
                                <p className="text-white/95 text-lg leading-relaxed">Hands-on projects and real-world applications in every course to build your portfolio</p>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
                            <div className="absolute inset-0">
                                <img src="/images/img7.png" alt="Career Growth" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/95 to-[#059669]/95 group-hover:from-[#10B981]/90 group-hover:to-[#059669]/90 transition-all"></div>
                            </div>
                            <div className="relative p-8 text-white">
                                <div className="w-16 h-1 bg-white mb-6"></div>
                                <h3 className="text-3xl font-bold mb-4">Career Growth</h3>
                                <p className="text-white/95 text-lg leading-relaxed">Skills that directly connect to job opportunities and career advancement across Africa</p>
                            </div>
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
