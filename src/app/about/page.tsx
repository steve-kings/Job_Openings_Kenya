import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faUsers, faHandshake, faTrophy, faRocket } from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from 'next';
import PartnersSection from '@/components/PartnersSection';

export const metadata: Metadata = {
    title: 'About Us - YENA | Youth Empowerment Network Africa',
    description: 'Learn about YENA - a Community Based Organization dedicated to bridging the gap between young Africans and life-changing opportunities through education and skills training.',
    openGraph: {
        title: 'About YENA - Youth Empowerment Network Africa',
        description: 'Empowering Africa\'s youth through education, opportunities, and community support. Join 5,000+ youth across Africa.',
        images: ['/images/img1.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About YENA - Youth Empowerment Network Africa',
        description: 'Empowering Africa\'s youth through education, opportunities, and community support.',
        images: ['/images/img1.jpg'],
    },
};

export default function About() {
    return (
        <div className="bg-white">
            {/* Hero Section - Who We Are */}
            <div className="relative min-h-[500px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img 
                        src="/images/yena logo.jpeg" 
                        alt="YENA Team"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-800/80"></div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20 lg:py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Who we are?
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            We are a Community Based Organization dedicated to bridging the gap between young Africans and life-changing opportunities. Founded with a vision to empower the next generation, YENA started as a small initiative to share verified job listings. Today, we have grown into a platform that not only connects youth with opportunities but also provides the skills needed to seize them.
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Impact at a Glance */}
            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Impact at a Glance</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {/* Impact Card 1 */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 group">
                            <img 
                                src="/images/img1.jpg" 
                                alt="Youth Empowerment"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#C44536]/95 to-[#C44536]/60 flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold mb-2">5,000+ Youth</h3>
                                    <p className="text-white/90">Empowered across Africa with verified opportunities</p>
                                </div>
                            </div>
                        </div>

                        {/* Impact Card 2 */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 group">
                            <img 
                                src="/images/img2.jpg" 
                                alt="Partnerships"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F39C12]/95 to-[#F39C12]/60 flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold mb-2">50+ Partners</h3>
                                    <p className="text-white/90">Building bridges with organizations across Africa</p>
                                </div>
                            </div>
                        </div>

                        {/* Impact Card 3 */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 group">
                            <img 
                                src="/images/img3.jpg" 
                                alt="Training Programs"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/95 to-[#10B981]/60 flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold mb-2">850+ Students</h3>
                                    <p className="text-white/90">Trained in high-demand skills and entrepreneurship</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* What We Offer - Opportunities Section */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Access verified opportunities across multiple categories to help you achieve your dreams
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Jobs Card */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-50 to-pink-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-red-100 hover:border-[#C44536]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C44536]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-[#C44536] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Jobs</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    Verified job opportunities for young professionals across Africa
                                </p>
                                <p className="text-[#C44536] font-bold text-lg">1,200+ opportunities</p>
                            </div>
                        </div>

                        {/* Grants Card */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-teal-100 hover:border-[#10B981]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Grants</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    Funding opportunities for entrepreneurs and startups
                                </p>
                                <p className="text-[#10B981] font-bold text-lg">200+ opportunities</p>
                            </div>
                        </div>

                        {/* Scholarships Card */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-purple-100 hover:border-[#8B3A3A]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B3A3A]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-[#8B3A3A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Scholarships</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    Educational opportunities to advance your career
                                </p>
                                <p className="text-[#8B3A3A] font-bold text-lg">500+ opportunities</p>
                            </div>
                        </div>

                        {/* Trainings Card */}
                        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-amber-100 hover:border-[#F39C12]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F39C12]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-[#F39C12] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Trainings</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    Entrepreneurship programs & online skill development
                                </p>
                                <p className="text-[#F39C12] font-bold text-lg">850+ opportunities</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Goals */}
            <div className="py-16 bg-gradient-to-r from-[#8B3A3A] to-[#C44536]">
                <div className="container mx-auto px-6 lg:px-12">
                    <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Goals</h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                        {/* Goal 1 */}
                        <div className="text-center text-white">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <FontAwesomeIcon icon={faLightbulb} className="text-4xl" />
                            </div>
                            <h3 className="font-bold mb-2">Empower</h3>
                            <p className="text-sm text-white/90">Youth with knowledge</p>
                        </div>

                        {/* Goal 2 */}
                        <div className="text-center text-white">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <FontAwesomeIcon icon={faUsers} className="text-4xl" />
                            </div>
                            <h3 className="font-bold mb-2">Bridge</h3>
                            <p className="text-sm text-white/90">The opportunity gap</p>
                        </div>

                        {/* Goal 3 */}
                        <div className="text-center text-white">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <FontAwesomeIcon icon={faHandshake} className="text-4xl" />
                            </div>
                            <h3 className="font-bold mb-2">Connect</h3>
                            <p className="text-sm text-white/90">Youth with partners</p>
                        </div>

                        {/* Goal 4 */}
                        <div className="text-center text-white">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <FontAwesomeIcon icon={faTrophy} className="text-4xl" />
                            </div>
                            <h3 className="font-bold mb-2">Innovate</h3>
                            <p className="text-sm text-white/90">Solutions for Africa</p>
                        </div>

                        {/* Goal 5 */}
                        <div className="text-center text-white">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <FontAwesomeIcon icon={faRocket} className="text-4xl" />
                            </div>
                            <h3 className="font-bold mb-2">Transform</h3>
                            <p className="text-sm text-white/90">Lives and communities</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16 bg-[#10B981]">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
                        <div>
                            <div className="text-5xl font-bold mb-2">1 Million</div>
                            <div className="text-xl">Youth Reached</div>
                            <div className="text-sm text-white/80 mt-1">Across Africa</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">1 Million</div>
                            <div className="text-xl">Opportunities Shared</div>
                            <div className="text-sm text-white/80 mt-1">Since inception</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">$10 Billion</div>
                            <div className="text-xl">Economic Impact</div>
                            <div className="text-sm text-white/80 mt-1">Generated for youth</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            The Team shaping the <span className="text-[#C44536]">future of technology</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            in the continent
                        </p>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            We believe that talent is evenly distributed, but opportunity is not. Our mission is to fix that imbalance through dedicated leadership and innovative solutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {/* Team Member 1 - Brian Bright */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/img1.jpg" 
                                    alt="Brian Bright - Chairperson"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#C44536]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Brian Bright</h3>
                            <p className="text-[#C44536] font-medium">Chairperson</p>
                        </div>

                        {/* Team Member 2 - Caroline Njambi */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/img2.jpg" 
                                    alt="Caroline Njambi - Vice Chair"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#F39C12]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Caroline Njambi</h3>
                            <p className="text-[#F39C12] font-medium">Vice Chairperson</p>
                        </div>

                        {/* Team Member 3 - Derick Shadiara */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/dennis.jpeg" 
                                    alt="Derick Shadiara - Treasurer"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Derick Shadiara</h3>
                            <p className="text-[#10B981] font-medium">Treasurer</p>
                        </div>

                        {/* Team Member 4 - Stephen King'ori */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/steve.jpeg" 
                                    alt="Stephen King'ori - Organization Editor"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#8B3A3A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Stephen King'ori</h3>
                            <p className="text-[#8B3A3A] font-medium">Organization Editor</p>
                        </div>

                        {/* Team Member 5 - Franklyne Shikokoti */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/img5.jpg" 
                                    alt="Franklyne Shikokoti - Organizing Secretary"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#C44536]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Franklyne Shikokoti</h3>
                            <p className="text-[#C44536] font-medium">Organizing Secretary</p>
                        </div>

                        {/* Team Member 6 - Lydia Lahma */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/img6 (2).jpg" 
                                    alt="Lydia Lahma - Assistant Treasurer"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#F39C12]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Lydia Lahma</h3>
                            <p className="text-[#F39C12] font-medium">Assistant Treasurer</p>
                        </div>

                        {/* Team Member 7 - Dennis Luttah */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/img7.jpg" 
                                    alt="Dennis Luttah - Organizing Secretary"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#10B981]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Dennis Luttah</h3>
                            <p className="text-[#10B981] font-medium">Organizing Secretary</p>
                        </div>

                        {/* Team Member 8 - Mary Muema */}
                        <div className="text-center group">
                            <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg">
                                <img 
                                    src="/images/img8.jpg" 
                                    alt="Mary Muema - Organizing Secretary"
                                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#8B3A3A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Mary Muema</h3>
                            <p className="text-[#8B3A3A] font-medium">Organizing Secretary</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission, Vision, Values */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-[#C44536] to-[#8B3A3A] text-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                            <p className="text-white/90 leading-relaxed">
                                To bridge the gap between young Africans and life-changing opportunities through verified information and skills training.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-[#F39C12] to-[#C44536] text-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                            <p className="text-white/90 leading-relaxed">
                                A continent where every young person has access to the resources they need to build a dignified and prosperous future.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-[#10B981] to-[#059669] text-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                            <ul className="space-y-2 text-white/90">
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    Excellence
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    Integrity
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    Empowerment
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    Collaboration
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    Innovation
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners Section */}
            <PartnersSection />

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-4xl font-bold mb-6">Join Us in Empowering African Youth</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Whether you're looking for opportunities or want to partner with us, we'd love to hear from you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/jobs" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] btn-lg border-none px-10">
                            Explore Opportunities
                        </a>
                        <a href="mailto:contact@yena.org" className="btn bg-[#F39C12] text-white hover:bg-[#e08d0a] btn-lg border-none px-10">
                            Partner With Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
