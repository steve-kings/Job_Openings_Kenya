import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { FileText, TrendingUp, Briefcase, Eye, Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Popular | 1000Jobs',
    description: 'Discover the most viewed articles and opportunities on 1000Jobs.',
};

export const revalidate = 3600;

export default async function PopularPage() {
    const supabase = await createClient();

    // Fetch popular blog posts
    const { data: popularBlogs } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, created_at, cover_image, views')
        .order('views', { ascending: false, nullsFirst: false })
        .limit(9);

    // Fetch popular opportunities
    const { data: popularJobs } = await supabase
        .from('opportunities')
        .select('id, title, company, type, location, created_at, views')
        .order('views', { ascending: false, nullsFirst: false })
        .limit(6);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900 to-[#1565C0] text-white py-16">
                <div className="container mx-auto px-6 lg:px-12 text-center">
                    <TrendingUp className="mx-auto mb-4 text-orange-400" size={64} />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Trending Now</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Explore the most viewed articles, career advice, and opportunities ranked by popularity.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 lg:px-12 -mt-8 relative z-10">
                {/* Popular Articles Section */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-fit">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Most Read Articles</h2>
                            <p className="text-gray-500 text-sm">Ranked by highest views</p>
                        </div>
                    </div>

                    {(!popularBlogs || popularBlogs.length === 0) ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Articles Yet</h3>
                            <p className="text-gray-500">Check back later when articles gain traction.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {popularBlogs.map((post, index) => (
                                <Link href={`/blog/${post.slug}`} key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group flex flex-col hover:-translate-y-2 transition-transform relative">
                                    {/* Rank Badge */}
                                    <div className="absolute top-4 left-4 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg shadow-lg border-2 border-white">
                                        #{index + 1}
                                    </div>

                                    <div className="h-48 overflow-hidden bg-gray-100 relative">
                                        {post.cover_image ? (
                                            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                <FileText size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5">
                                            <Eye size={14} />
                                            {post.views || 0} views
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                            <span className="text-gray-400 text-xs flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="text-orange-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Read <ArrowRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Popular Opportunities Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-fit">
                        <div className="p-3 bg-blue-100 text-[#1976D2] rounded-xl">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Hot Opportunities</h2>
                            <p className="text-gray-500 text-sm">Jobs and grants getting the most attention</p>
                        </div>
                    </div>

                    {(!popularJobs || popularJobs.length === 0) ? (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Opportunities Yet</h3>
                            <p className="text-gray-500">Check back later.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {popularJobs.map((job, index) => {
                                const typeColors = {
                                    'Job': { text: 'text-[#1976D2]', bg: 'bg-[#1976D2]/10' },
                                    'Grant': { text: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10' },
                                    'Scholarship': { text: 'text-[#1565C0]', bg: 'bg-[#1565C0]/10' },
                                    'Training': { text: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10' },
                                };
                                const color = typeColors[job.type as keyof typeof typeColors] || typeColors['Job'];

                                return (
                                    <Link 
                                        href={`/jobs/${job.id}`} 
                                        key={job.id} 
                                        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all group relative"
                                    >
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#1976D2] to-[#1565C0] text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                                            #{index + 1}
                                        </div>
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-sm bg-gradient-to-br from-gray-700 to-gray-900">
                                                {job.company.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                                <Eye size={12} className="text-gray-400" />
                                                {job.views || 0}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#1976D2] transition-colors line-clamp-2">
                                            {job.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-1">{job.company}</p>
                                        
                                        <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-semibold">
                                            <span className={`${color.bg} ${color.text} px-2 py-1 rounded-md`}>
                                                {job.type}
                                            </span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md truncate max-w-[120px]">
                                                {job.location}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
