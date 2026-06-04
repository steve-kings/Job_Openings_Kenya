import { createClient } from '@/lib/supabase/server';
import PartnerLogo from './PartnerLogo';

// Helper function to convert Google Drive links
function convertGoogleDriveUrl(url: string | null): string {
    if (!url) return '/job_openings_kenya_logo.jpeg';
    
    if (url.includes('drive.google.com')) {
        const fileIdMatch = url.match(/\/d\/([^/]+)/);
        if (fileIdMatch) {
            return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
        }
    }
    return url;
}

export default async function PartnersSection() {
    const supabase = await createClient();

    const { data: partners, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.warn('Could not fetch partners (database might be paused):', error.message || error);
        return null;
    }

    if (!partners || partners.length === 0) return null;

    return (
        <div className="py-24 bg-white border-t-4 border-[#5CB800]">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Our Trusted 
                        <span className="relative inline-block mx-2">
                            <span className="relative z-10">Partners</span>
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-[#5CB800] -z-0"></span>
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Working together to empower Kenyan job seekers with opportunities and resources
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {partners.map((partner) => (
                        <a
                            key={partner.id}
                            href={partner.website_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                            title={partner.description || partner.name}
                        >
                            <div className="flex flex-col items-center gap-4">
                                {/* Logo Container */}
                                <div className="w-full h-32 flex items-center justify-center p-4 bg-gray-50 rounded-xl group-hover:bg-[#5CB800]/5 transition-colors">
                                    <PartnerLogo 
                                        src={convertGoogleDriveUrl(partner.logo_url)} 
                                        alt={partner.name}
                                        className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                    />
                                </div>
                                
                                {/* Partner Name */}
                                <div className="text-center">
                                    <h3 className="font-bold text-gray-900 group-hover:text-[#5CB800] transition-colors">
                                        {partner.name}
                                    </h3>
                                    {partner.description && (
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {partner.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* View All Partners Link */}
                {partners.length > 8 && (
                    <div className="text-center mt-12">
                        <a 
                            href="/partner" 
                            className="btn bg-[#5CB800] text-white hover:bg-[#4A9900] border-none px-8"
                        >
                            View All Partners
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
