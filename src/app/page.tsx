import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Calendar, Building, Briefcase, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import JobsFilter from '@/components/JobsFilter';
import JobsHeroSlider from '@/components/JobsHeroSlider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BookmarkButton from '@/components/BookmarkButton';
import { faBriefcase, faHandHoldingDollar, faGraduationCap, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '1000Jobs | Discover Jobs, Grants, Scholarships & Training for African Youth',
    description: 'Discover verified opportunities for African youth - jobs, grants, scholarships, and training programs. Updated daily with new opportunities across Africa.',
    openGraph: {
        title: '1000Jobs | Discover Jobs, Grants, Scholarships & Training',
        description: 'Discover verified opportunities for African youth - jobs, grants, scholarships, and training programs updated daily.',
        images: ['/images/img2.jpg'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '1000Jobs | African Youth Opportunities',
        description: 'Discover verified opportunities for African youth - jobs, grants, scholarships, and training programs.',
        images: ['/images/img2.jpg'],
    },
};

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    const params = await searchParams;
    const filterType = typeof params.type === 'string' ? params.type : 'All';
    const filterQuery = typeof params.q === 'string' ? params.q : '';
    const isUrgent = params.urgent === 'true';

    const { data: bannersData } = await supabase
        .from('opportunities')
        .select('*')
        .eq('type', 'Banner')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    let query = supabase
        .from('opportunities')
        .select('*')
        .neq('type', 'Banner')
        .or(`deadline.gte.${today},deadline.is.null`) // Show active/future deadlines or rolling basis
        .eq('status', 'active');

    if (isUrgent) {
        const threeDaysDate = new Date();
        threeDaysDate.setDate(threeDaysDate.getDate() + 3);
        const maxDate = threeDaysDate.toISOString().split('T')[0];
        query = query.lte('deadline', maxDate).order('deadline', { ascending: true });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    if (filterType !== 'All') {
        query = query.eq('type', filterType);
    }
    
    if (filterQuery) {
        query = query.or(`title.ilike.%${filterQuery}%,company.ilike.%${filterQuery}%,location.ilike.%${filterQuery}%`);
    }

    const { data: opportunities, error } = await query;

    if (error) {
        console.warn('Could not fetch opportunities (database tables might not be set up):', error.message || error);
    }

    // Count by type
    const jobsCount = opportunities?.filter(o => o.type === 'Job').length || 0;
    const grantsCount = opportunities?.filter(o => o.type === 'Grant').length || 0;
    const scholarshipsCount = opportunities?.filter(o => o.type === 'Scholarship').length || 0;
    const trainingsCount = opportunities?.filter(o => o.type === 'Training').length || 0;

    const uniqueCompanies = Array.from(new Set(opportunities?.map((o: any) => o.company))).filter(Boolean).slice(0, 12);

    return (
        <div className="bg-white">
            {/* Hero Slider */}
            <JobsHeroSlider customSlides={bannersData || undefined} />

            {/* Expiring Soon Alert */}
            {isUrgent && (
                <div className="bg-red-50 py-4 border-b border-red-100">
                    <div className="container mx-auto px-6 lg:px-12 flex items-start sm:items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-bold text-lg">Urgent Opportunities</h3>
                            <p className="text-red-700 text-sm">These selected opportunities are expiring in the next 3 days! Apply immediately.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats — horizontal scroll on mobile, grid on desktop */}
            <div className="py-8 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                    {/* Mobile: scrollable row */}
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide lg:hidden">
                        {[
                            { icon: faBriefcase,        count: jobsCount,        label: 'Active Jobs',        bg: 'from-[#1976D2]/10 to-[#1976D2]/5', border: 'border-[#1976D2]/20', color: 'text-[#1976D2]' },
                            { icon: faHandHoldingDollar, count: grantsCount,      label: 'Grants',             bg: 'from-[#4CAF50]/10 to-[#4CAF50]/5', border: 'border-[#4CAF50]/20', color: 'text-[#4CAF50]' },
                            { icon: faGraduationCap,    count: scholarshipsCount, label: 'Scholarships',       bg: 'from-[#1565C0]/10 to-[#1565C0]/5', border: 'border-[#1565C0]/20', color: 'text-[#1565C0]' },
                            { icon: faChalkboardTeacher, count: trainingsCount,   label: 'Training',           bg: 'from-[#4CAF50]/10 to-[#4CAF50]/5', border: 'border-[#4CAF50]/20', color: 'text-[#4CAF50]' },
                        ].map(({ icon, count, label, bg, border, color }) => (
                            <div key={label} className={`snap-start shrink-0 w-32 text-center p-4 bg-gradient-to-br ${bg} rounded-2xl border-2 ${border}`}>
                                <div className={`text-2xl mb-2 ${color}`}>
                                    <FontAwesomeIcon icon={icon} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-0.5">{count}</div>
                                <div className="text-xs text-gray-600 leading-tight">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: 4-col grid */}
                    <div className="hidden lg:grid grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-[#1976D2]/10 to-[#1976D2]/5 rounded-2xl border-2 border-[#1976D2]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#1976D2]"><FontAwesomeIcon icon={faBriefcase} /></div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{jobsCount}</div>
                            <div className="text-sm text-gray-600">Active Jobs</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-[#4CAF50]/10 to-[#4CAF50]/5 rounded-2xl border-2 border-[#4CAF50]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#4CAF50]"><FontAwesomeIcon icon={faHandHoldingDollar} /></div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{grantsCount}</div>
                            <div className="text-sm text-gray-600">Grants Available</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-[#1565C0]/10 to-[#1565C0]/5 rounded-2xl border-2 border-[#1565C0]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#1565C0]"><FontAwesomeIcon icon={faGraduationCap} /></div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{scholarshipsCount}</div>
                            <div className="text-sm text-gray-600">Scholarships</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-[#4CAF50]/10 to-[#4CAF50]/5 rounded-2xl border-2 border-[#4CAF50]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#4CAF50]"><FontAwesomeIcon icon={faChalkboardTeacher} /></div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{trainingsCount}</div>
                            <div className="text-sm text-gray-600">Training Programs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hiring Now Companies */}
            {uniqueCompanies && uniqueCompanies.length > 0 && (
                <div className="py-12 bg-gray-50 border-t border-gray-200">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hiring Now</h2>
                            <p className="text-gray-600">Top companies actively recruiting on 1000Jobs</p>
                        </div>
                        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:justify-center">
                            {uniqueCompanies.map((company, idx) => (
                                <Link 
                                    key={idx} 
                                    href={`/?q=${encodeURIComponent(company as string)}`}
                                    className="snap-start shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 min-w-[160px] max-w-[160px] group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                                        <Building className="text-gray-400 group-hover:text-[#1976D2] transition-colors" size={28} />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-center text-sm line-clamp-1 w-full" title={company as string}>{company as string}</h3>
                                    <p className="text-xs text-[#1976D2] mt-1 font-semibold">View Jobs</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Latest Jobs Slider */}
            {!isUrgent && filterType === 'All' && !filterQuery && opportunities && opportunities.length > 0 && (
                <div className="py-12 bg-white border-t border-gray-200">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Jobs in Kenya 2026</h2>
                                <p className="text-gray-600">Swipe to discover the newest opportunities</p>
                            </div>
                        </div>
                        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-hide">
                            {opportunities.slice(0, 8).map((job) => {
                                const typeColors = {
                                    'Job': { badge: 'bg-[#1976D2]', gradient: 'from-[#1976D2] to-[#1565C0]' },
                                    'Grant': { badge: 'bg-[#4CAF50]', gradient: 'from-[#4CAF50] to-[#388E3C]' },
                                    'Scholarship': { badge: 'bg-[#1565C0]', gradient: 'from-[#1565C0] to-[#5D4037]' },
                                    'Training': { badge: 'bg-[#4CAF50]', gradient: 'from-[#4CAF50] to-[#e08d0a]' },
                                };
                                const colors = typeColors[job.type as keyof typeof typeColors] || typeColors['Job'];
                                const daysLeft = job.deadline ? Math.max(0, Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null;

                                return (
                                    <Link 
                                        key={job.id} 
                                        href={`/jobs/${job.id}`}
                                        className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-[#1976D2]/30 transition-all hover:-translate-y-1 block group"
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-sm bg-gradient-to-br ${colors.gradient}`}>
                                                    {job.company.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${daysLeft === 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'} flex items-center gap-1`}>
                                                    <Clock size={12} />
                                                    {daysLeft === null ? 'Rolling' : daysLeft === 0 ? 'Expired' : `${daysLeft}d left`}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#1976D2] transition-colors line-clamp-2 md:h-14">
                                                {job.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-1">{job.company}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium pt-4 border-t border-gray-50">
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Building size={12} className="text-gray-400" />
                                                    {job.type}
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <MapPin size={12} className="text-gray-400" />
                                                    <span className="truncate max-w-[100px]">{job.location}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div id="opportunities" className="py-8 bg-gray-50 border-y border-gray-200">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {filterType === 'All' ? 'All Opportunities' : `${filterType}s`}
                            </h2>
                            <p className="text-gray-600">
                                {opportunities?.length || 0} active opportunities available
                            </p>
                        </div>
                        <JobsFilter />
                    </div>
                </div>
            </div>

            {/* Opportunities Grid */}
            <div className="py-12 bg-gray-50">
                <div className="container mx-auto px-6 lg:px-12">
                    {!opportunities || opportunities.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                            <div className="text-6xl mb-4 text-gray-300">
                                <Briefcase className="mx-auto" size={80} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Opportunities Found</h3>
                            <p className="text-gray-500 mb-6">Check back soon for new opportunities!</p>
                            <Link href="/" className="btn bg-[#1976D2] text-white hover:bg-[#1565C0] border-none">
                                View All Opportunities
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {opportunities.map((job) => {
                                const typeColors = {
                                    'Job': { bg: 'bg-[#1976D2]/10', border: 'border-[#1976D2]/30', text: 'text-[#1976D2]', badge: 'bg-[#1976D2]' },
                                    'Grant': { bg: 'bg-[#4CAF50]/10', border: 'border-[#4CAF50]/30', text: 'text-[#4CAF50]', badge: 'bg-[#4CAF50]' },
                                    'Scholarship': { bg: 'bg-[#1565C0]/10', border: 'border-[#1565C0]/30', text: 'text-[#1565C0]', badge: 'bg-[#1565C0]' },
                                    'Training': { bg: 'bg-[#4CAF50]/10', border: 'border-[#4CAF50]/30', text: 'text-[#4CAF50]', badge: 'bg-[#4CAF50]' },
                                };
                                const colors = typeColors[job.type as keyof typeof typeColors] || typeColors['Job'];

                                return (
                                    <div 
                                        key={job.id} 
                                        className={`bg-white rounded-2xl flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${colors.border} group hover:-translate-y-1`}
                                    >
                                        {job.thumbnail_url ? (
                                            <div className="w-full h-48 overflow-hidden relative shrink-0">
                                                <div className={`absolute top-0 inset-x-0 h-1 ${colors.badge} z-10`}></div>
                                                <img src={job.thumbnail_url} alt={job.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ) : (
                                            <div className={`h-2 ${colors.badge} shrink-0`}></div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2 min-w-0">
                                                        <div className="flex items-center gap-2 min-w-0 flex-shrink">
                                                            <span className={`${colors.badge} text-white px-2 py-1 rounded-full text-xs font-semibold shrink-0`}>
                                                                {job.type}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                                                <Clock size={12} className="shrink-0" />
                                                                {job.deadline ? `${Math.max(0, Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days left` : 'Rolling Basis'}
                                                            </span>
                                                        </div>
                                                        <BookmarkButton 
                                                            job={{
                                                                id: job.id,
                                                                title: job.title,
                                                                company: job.company,
                                                                type: job.type,
                                                                location: job.location
                                                            }}
                                                            className="p-1 z-20 bg-white/80 rounded-full hover:bg-white"
                                                        />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1976D2] transition-colors line-clamp-2">
                                                        {job.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building size={16} className={colors.text} />
                                                    <span className="font-medium">{job.company}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin size={16} className={colors.text} />
                                                    <span>{job.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar size={16} className={colors.text} />
                                                    <span>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Rolling Basis'}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                                {job.short_description}
                                            </p>

                                            <div className="mt-auto pt-4">
                                                <Link 
                                                    href={`/jobs/${job.id}`} 
                                                    className={`btn ${colors.badge} text-white hover:opacity-90 w-full border-none gap-2 group/btn`}
                                                >
                                                    View Full Details
                                                    <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-[#1976D2] to-[#1565C0] text-white">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold mb-6">Don't Miss Out on New Opportunities</h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join our WhatsApp channel to get instant notifications when new opportunities are posted. Be the first to apply!
                        </p>
                        <a 
                            href="https://whatsapp.com/channel/0029VbCAOUzDuMRgzkuhZe1e"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn bg-[#4CAF50] text-white hover:bg-[#388E3C] btn-lg border-none w-full sm:w-auto px-6 sm:px-10 gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            Join WhatsApp Channel
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
