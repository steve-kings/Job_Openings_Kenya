import { createClient } from '@/lib/supabase/server';
import PartnerLogo from './PartnerLogo';

// Helper function to convert Google Drive links
function convertGoogleDriveUrl(url: string | null): string {
    if (!url) return '/images/yena logo.jpeg';
    
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
        console.error('Error fetching partners:', error);
        return null;
    }

    if (!partners || partners.length === 0) return null;

    return (
        <div className="py-16 bg-base-100 border-t border-base-200">
            <div className="container mx-auto px-6 lg:px-12 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-10">Our Partners & Supporters</h2>

                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                    {partners.map((partner) => (
                        <a
                            key={partner.id}
                            href={partner.website_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group transition-all duration-300 hover:scale-110 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
                            title={partner.name}
                        >
                            <PartnerLogo 
                                src={convertGoogleDriveUrl(partner.logo_url)} 
                                alt={partner.name} 
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
