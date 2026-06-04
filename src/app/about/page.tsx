import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faUsers, faHandshake, faTrophy, faRocket } from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from 'next';
import PartnersSection from '@/components/PartnersSection';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
    title: 'About Us | Job Openings Kenya',
    description: 'Learn about Job Openings Kenya — your trusted portal for verified job openings, grants, scholarships, and training programs across Kenya.',
    openGraph: {
        title: 'About Job Openings Kenya',
        description: 'Your trusted portal for the latest job openings in Kenya. Verified listings, updated daily.',
        images: ['/images/img1.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Job Openings Kenya',
        description: 'Your trusted portal for the latest job openings in Kenya.',
        images: ['/images/img1.jpg'],
    },
};

export const revalidate = 3600;

export default async function About() {
    const supabase = await createClient();

    const [
        { count: userCount },
        { count: opportunityCount },
        { count: partnerCount }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true })
    ]);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative min-h-[500px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/job_openings_kenya_logo.jpeg"
                        alt="Job Openings Kenya"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-gray-800/80"></div>
                </div>
                <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20 lg:py-32">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-[#5CB800]/20 border border-[#5CB800]/40 text-[#5CB800] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                            🇰🇪 Kenya&apos;s Jobs Portal
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Who We Are
                        </h1>
                        <p className="text-xl text-white/90 leading-relaxed">
                            Job Openings Kenya is your go-to portal for the latest, verified job openings across Kenya. We started as a simple initiative to share genuine job listings and have grown into a comprehensive platform connecting Kenyan job seekers with jobs, grants, scholarships, and training programs — all in one place, always free.
                        </p>
                    </div>
                </div>
            </div>

            {/* Impact at a Glance */}
            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Impact at a Glance</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 group">
                            <img src="/images/img1.jpg" alt="Job Seekers" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#5CB800]/95 to-[#5CB800]/60 flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold mb-2">{userCount || 0}+ Job Seekers</h3>
                                    <p className="text-white/90">Registered on our platform across Kenya</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 group">
                            <img src="/images/img2.jpg" alt="Partnerships" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#4A9900]/95 to-[#4A9900]/60 flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold mb-2">{partnerCount || 0}+ Partners</h3>
                                    <p className="text-white/90">Employers and organisations we work with</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 group sm:col-span-2 lg:col-span-1">
                            <img src="/images/img3.jpg" alt="Opportunities" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#5CB800]/95 to-[#5CB800]/60 flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold mb-2">{opportunityCount || 0}+ Opportunities</h3>
                                    <p className="text-white/90">Verified jobs, grants & scholarships posted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* What We Offer */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Everything a Kenyan job seeker needs — in one free platform
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'Jobs',
                                desc: 'Verified job openings from top Kenyan employers, updated daily.',
                                count: '1,200+',
                                bg: 'from-green-50 to-lime-50',
                                border: 'border-green-100 hover:border-[#5CB800]',
                                color: '#5CB800',
                                icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                            },
                            {
                                title: 'Grants',
                                desc: 'Funding opportunities for Kenyan entrepreneurs and startups.',
                                count: '200+',
                                bg: 'from-teal-50 to-cyan-50',
                                border: 'border-teal-100 hover:border-[#5CB800]',
                                color: '#5CB800',
                                icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                            },
                            {
                                title: 'Scholarships',
                                desc: 'Local and international scholarships for Kenyan students.',
                                count: '500+',
                                bg: 'from-purple-50 to-pink-50',
                                border: 'border-purple-100 hover:border-[#4A9900]',
                                color: '#4A9900',
                                icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
                            },
                            {
                                title: 'Training',
                                desc: 'Skill-building programs and courses for career growth.',
                                count: '850+',
                                bg: 'from-amber-50 to-orange-50',
                                border: 'border-amber-100 hover:border-[#5CB800]',
                                color: '#5CB800',
                                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                            },
                        ].map(({ title, desc, count, bg, border, color, icon }) => (
                            <div key={title} className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${bg} p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${border}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: `${color}15` }}></div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: color }}>
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed">{desc}</p>
                                    <p className="font-bold text-lg" style={{ color }}>{count} opportunities</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Goals */}
            <div className="py-16 bg-gradient-to-r from-[#4A9900] to-[#5CB800]">
                <div className="container mx-auto px-6 lg:px-12">
                    <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Goals</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
                        {[
                            { icon: faLightbulb, title: 'Inform', sub: 'Verified listings daily' },
                            { icon: faUsers, title: 'Connect', sub: 'Seekers with employers' },
                            { icon: faHandshake, title: 'Partner', sub: 'With top organisations' },
                            { icon: faTrophy, title: 'Empower', sub: 'Careers across Kenya' },
                            { icon: faRocket, title: 'Transform', sub: 'Lives through opportunity' },
                        ].map(({ icon, title, sub }) => (
                            <div key={title} className={`text-center text-white ${title === 'Transform' ? 'col-span-2 sm:col-span-1' : ''}`}>
                                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <FontAwesomeIcon icon={icon} className="text-3xl sm:text-4xl" />
                                </div>
                                <h3 className="font-bold mb-1 text-sm sm:text-base">{title}</h3>
                                <p className="text-xs sm:text-sm text-white/90">{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="py-16 bg-[#5CB800]">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
                        <div>
                            <div className="text-5xl font-bold mb-2">{userCount || 0}</div>
                            <div className="text-xl">Job Seekers Registered</div>
                            <div className="text-sm text-white/80 mt-1">Across Kenya</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">{opportunityCount || 0}</div>
                            <div className="text-xl">Opportunities Posted</div>
                            <div className="text-sm text-white/80 mt-1">Verified & scam-free</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">{partnerCount || 0}</div>
                            <div className="text-xl">Active Partners</div>
                            <div className="text-sm text-white/80 mt-1">Supporting our mission</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission, Vision, Values */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] text-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                            <p className="text-white/90 leading-relaxed">
                                To be Kenya&apos;s most trusted portal for job seekers — providing verified, scam-free listings and connecting talent with opportunity every single day.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-[#4A9900] to-[#5CB800] text-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                            <p className="text-white/90 leading-relaxed">
                                A Kenya where every job seeker has instant access to genuine, up-to-date opportunities — no gatekeeping, no scams, always free.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-[#5CB800] to-[#4A9900] text-white rounded-2xl p-8 shadow-xl">
                            <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                            <ul className="space-y-2 text-white/90">
                                {['Transparency', 'Accuracy', 'Accessibility', 'Integrity', 'Community'].map(v => (
                                    <li key={v} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full shrink-0"></span>
                                        {v}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Partners */}
            <PartnersSection />

            {/* CTA */}
            <div className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Find Your Next Opportunity?</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Browse the latest verified job openings in Kenya or partner with us to reach thousands of qualified job seekers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/" className="btn bg-[#5CB800] text-white hover:bg-[#4A9900] btn-lg border-none w-full sm:w-auto px-10">
                            Browse Job Openings
                        </a>
                        <a href="mailto:info@jobopeningskenya.co.ke" className="btn btn-outline border-white text-white hover:bg-white hover:text-gray-900 btn-lg w-full sm:w-auto px-10">
                            Partner With Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
