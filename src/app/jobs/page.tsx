import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MapPin, Calendar, Building, Briefcase, Clock, ExternalLink } from 'lucide-react';
import JobsFilter from '@/components/JobsFilter';
import JobsHeroSlider from '@/components/JobsHeroSlider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faHandHoldingDollar, faGraduationCap, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';

export const revalidate = 3600; // Revalidate every hour

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    const params = await searchParams;
    const filterType = typeof params.type === 'string' ? params.type : 'All';

    let query = supabase
        .from('opportunities')
        .select('*')
        .gte('deadline', today) // Only show active/future deadlines
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (filterType !== 'All') {
        query = query.eq('type', filterType);
    }

    const { data: opportunities, error } = await query;

    if (error) {
        console.error('Error fetching opportunities:', error);
    }

    // Count by type
    const jobsCount = opportunities?.filter(o => o.type === 'Job').length || 0;
    const grantsCount = opportunities?.filter(o => o.type === 'Grant').length || 0;
    const scholarshipsCount = opportunities?.filter(o => o.type === 'Scholarship').length || 0;
    const trainingsCount = opportunities?.filter(o => o.type === 'Training').length || 0;

    return (
        <div className="bg-white">
            {/* Hero Slider */}
            <JobsHeroSlider />

            {/* Quick Stats */}
            <div className="py-12 bg-white">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-[#C44536]/10 to-[#C44536]/5 rounded-2xl border-2 border-[#C44536]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#C44536]">
                                <FontAwesomeIcon icon={faBriefcase} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{jobsCount}</div>
                            <div className="text-sm text-gray-600">Active Jobs</div>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-[#10B981]/10 to-[#10B981]/5 rounded-2xl border-2 border-[#10B981]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#10B981]">
                                <FontAwesomeIcon icon={faHandHoldingDollar} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{grantsCount}</div>
                            <div className="text-sm text-gray-600">Grants Available</div>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-[#8B3A3A]/10 to-[#8B3A3A]/5 rounded-2xl border-2 border-[#8B3A3A]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#8B3A3A]">
                                <FontAwesomeIcon icon={faGraduationCap} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{scholarshipsCount}</div>
                            <div className="text-sm text-gray-600">Scholarships</div>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-[#F39C12]/10 to-[#F39C12]/5 rounded-2xl border-2 border-[#F39C12]/20 hover:shadow-lg transition-all">
                            <div className="text-4xl mb-3 text-[#F39C12]">
                                <FontAwesomeIcon icon={faChalkboardTeacher} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{trainingsCount}</div>
                            <div className="text-sm text-gray-600">Training Programs</div>
                        </div>
                    </div>
                </div>
            </div>

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
                            <Link href="/jobs" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none">
                                View All Opportunities
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {opportunities.map((job) => {
                                const typeColors = {
                                    'Job': { bg: 'bg-[#C44536]/10', border: 'border-[#C44536]/30', text: 'text-[#C44536]', badge: 'bg-[#C44536]' },
                                    'Grant': { bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', text: 'text-[#10B981]', badge: 'bg-[#10B981]' },
                                    'Scholarship': { bg: 'bg-[#8B3A3A]/10', border: 'border-[#8B3A3A]/30', text: 'text-[#8B3A3A]', badge: 'bg-[#8B3A3A]' },
                                    'Training': { bg: 'bg-[#F39C12]/10', border: 'border-[#F39C12]/30', text: 'text-[#F39C12]', badge: 'bg-[#F39C12]' },
                                };
                                const colors = typeColors[job.type as keyof typeof typeColors] || typeColors['Job'];

                                return (
                                    <div 
                                        key={job.id} 
                                        className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${colors.border} group hover:-translate-y-1`}
                                    >
                                        <div className={`h-2 ${colors.badge}`}></div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                                            {job.type}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Clock size={12} />
                                                            {Math.ceil((new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#C44536] transition-colors line-clamp-2">
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
                                                    <span>Deadline: {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                                {job.short_description}
                                            </p>

                                            <Link 
                                                href={`/jobs/${job.id}`} 
                                                className={`btn ${colors.badge} text-white hover:opacity-90 w-full border-none gap-2 group`}
                                            >
                                                View Full Details
                                                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 bg-gradient-to-r from-[#C44536] to-[#8B3A3A] text-white">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold mb-6">Don't Miss Out on New Opportunities</h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join our WhatsApp channel to get instant notifications when new opportunities are posted. Be the first to apply!
                        </p>
                        <a 
                            href="https://whatsapp.com/channel/0029Vb5tFTSK0IBb2oi04V2b"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn bg-[#10B981] text-white hover:bg-[#059669] btn-lg border-none px-10 gap-2"
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
