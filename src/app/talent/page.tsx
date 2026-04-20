import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MapPin, Search, Users, Star, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Talent Directory | 1000Jobs - Find African Youth Talent',
    description: 'Browse a directory of talented African youth open to work. Discover skilled professionals in tech, business, healthcare and more.',
};

export const revalidate = 300;

export default async function TalentDirectoryPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const searchQuery = params.q || '';
    const skillFilter = params.skill || '';

    const supabase = await createClient();

    let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .not('username', 'is', null)
        .not('headline', 'is', null)
        .order('created_at', { ascending: false });

    if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,headline.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
    }
    if (skillFilter) {
        query = query.contains('skills', [skillFilter]);
    }

    const { data: talents } = await query.limit(48);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <div className="bg-gradient-to-br from-[#1976D2] via-[#1565C0] to-[#0D47A1] text-white py-20">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <Users size={16} />
                        Talent Directory
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                        Discover Africa's<br />
                        <span className="text-[#4CAF50]">Next Generation</span> Talent
                    </h1>
                    <p className="text-xl text-white/85 mb-10 max-w-2xl mx-auto">
                        Browse talented youth open to work across Africa. Connect directly with skilled professionals in tech, business, healthcare, and more.
                    </p>
                    {/* Search */}
                    <form method="GET" className="max-w-2xl mx-auto flex gap-3">
                        <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-2xl">
                            <Search size={20} className="text-gray-400 shrink-0" />
                            <input
                                name="q"
                                defaultValue={searchQuery}
                                type="text"
                                placeholder="Search by name, skill, or location..."
                                className="flex-1 outline-none text-gray-800 font-medium bg-transparent"
                            />
                        </div>
                        <button type="submit" className="btn bg-[#4CAF50] hover:bg-[#388E3C] text-white border-none px-8 rounded-2xl font-bold shadow-2xl">
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Stats bar */}
            <div className="bg-white border-b border-gray-100 py-4">
                <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between flex-wrap gap-4">
                    <p className="text-gray-600 font-medium">
                        <span className="font-black text-gray-900">{talents?.length || 0}</span> talented individuals found
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><CheckCircle size={14} className="text-[#4CAF50]" /> All verified members</span>
                        <span>•</span>
                        <Link href="/dashboard/profile" className="text-[#1976D2] font-semibold hover:underline">
                            Add your profile →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6 lg:px-12 py-12">
                {!talents || talents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow">
                        <Users size={64} className="text-gray-200 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Talent Found</h3>
                        <p className="text-gray-500 mb-6">Be the first to make your profile public!</p>
                        <Link href="/dashboard/profile" className="btn bg-[#1976D2] text-white border-none">
                            Create Your Public Profile
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {talents.map((talent) => {
                            const initials = talent.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
                            return (
                                <Link
                                    key={talent.id}
                                    href={`/talent/${talent.username}`}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 group flex flex-col"
                                >
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-br from-[#1976D2] to-[#1565C0] p-6 relative">
                                        <div className="flex justify-end mb-4">
                                            {talent.open_to_work && (
                                                <span className="bg-[#4CAF50] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                                    <CheckCircle size={10} /> Open to Work
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center">
                                            {talent.avatar_url ? (
                                                <img src={talent.avatar_url} alt={talent.full_name} className="w-20 h-20 rounded-full object-cover ring-4 ring-white/30" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                                                    <span className="text-2xl font-black text-white">{initials}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Card Body */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 text-center group-hover:text-[#1976D2] transition-colors">{talent.full_name}</h3>
                                        {talent.headline && (
                                            <p className="text-sm text-gray-500 text-center mt-1 line-clamp-2">{talent.headline}</p>
                                        )}
                                        {talent.location && (
                                            <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                                                <MapPin size={12} /> {talent.location}
                                            </p>
                                        )}
                                        {talent.skills && talent.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                                                {talent.skills.slice(0, 3).map((skill: string, i: number) => (
                                                    <span key={i} className="px-2.5 py-1 bg-[#1976D2]/10 text-[#1976D2] text-xs font-semibold rounded-lg">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {talent.skills.length > 3 && (
                                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg">
                                                        +{talent.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-auto pt-4">
                                            <div className="w-full py-2 text-center text-sm font-bold text-[#1976D2] border border-[#1976D2]/30 rounded-xl group-hover:bg-[#1976D2] group-hover:text-white transition-all">
                                                View Profile
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
