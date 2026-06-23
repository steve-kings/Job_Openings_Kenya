import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Briefcase, MapPin, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import CompanySearch from '@/components/CompanySearch';
import HeroSlider from '@/components/HeroSlider';

export const metadata: Metadata = {
    title: 'Companies Hiring in Kenya | Job Openings Kenya',
    description: 'Browse companies actively hiring in Kenya. See open positions, company profiles, and reviews.',
};

export const revalidate = 3600;

export default async function CompaniesPage() {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get all distinct companies with active job counts
    const { data: opportunities } = await supabase
        .from('opportunities')
        .select('company, title, location')
        .eq('status', 'active')
        .or(`deadline.gte.${today},deadline.is.null`)
        .order('created_at', { ascending: false });

    // Group by company
    const companyMap = new Map<string, { titles: string[]; locations: string[]; count: number }>();
    for (const opp of (opportunities || [])) {
        const name = opp.company;
        if (!companyMap.has(name)) {
            companyMap.set(name, { titles: [], locations: [], count: 0 });
        }
        const entry = companyMap.get(name)!;
        entry.count++;
        if (!entry.locations.includes(opp.location)) entry.locations.push(opp.location);
        if (entry.titles.length < 3) entry.titles.push(opp.title);
    }

    const companies = Array.from(companyMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero with slider */}
            <section className="relative overflow-hidden min-h-[280px] sm:min-h-[340px] flex items-center text-white">
                <div className="absolute inset-0"><HeroSlider /></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-lg">
                        Companies Hiring in Kenya
                    </h1>
                    <p className="mt-3 text-lg text-white/70 max-w-2xl">
                        Browse {companies.length} organizations actively recruiting. Find open positions, learn about company culture, and apply directly.
                    </p>
                </div>
            </section>

            {/* Companies Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {companies.length === 0 ? (
                    <div className="text-center py-16">
                        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900">No companies found</h2>
                        <p className="text-gray-500 mt-2">Check back soon for new hiring organizations.</p>
                    </div>
                ) : (
                    <>
                        {/* Search */}
                        <div className="mb-8 max-w-md">
                            <CompanySearch />
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {companies.map((company) => (
                                <Link
                                    key={company.name}
                                    href={`/companies/${encodeURIComponent(company.name.toLowerCase().replace(/\s+/g, '-'))}`}
                                    data-company-card
                                    data-company-name={company.name}
                                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all p-6 flex flex-col"
                                >
                                    {/* Avatar */}
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-extrabold text-xl shadow-sm mb-4 group-hover:scale-105 transition-transform">
                                        {company.name.charAt(0).toUpperCase()}
                                    </div>

                                    <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">
                                        {company.name}
                                    </h3>

                                    <div className="mt-3 space-y-2 text-sm text-gray-500 flex-1">
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={14} className="text-emerald-500 shrink-0" />
                                            <span className="font-semibold text-gray-700">{company.count} open {company.count === 1 ? 'position' : 'positions'}</span>
                                        </div>
                                        {company.locations.length > 0 && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-gray-400 shrink-0" />
                                                <span>{company.locations.slice(0, 2).join(', ')}{company.locations.length > 2 ? ` +${company.locations.length - 2} more` : ''}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent roles */}
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Recent Roles</p>
                                        <div className="space-y-1">
                                            {company.titles.slice(0, 2).map((title) => (
                                                <p key={title} className="text-sm text-gray-600 truncate">{title}</p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-1 text-sm font-bold text-emerald-600 group-hover:text-emerald-700">
                                        View Company <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
