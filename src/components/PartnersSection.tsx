import { createClient } from '@/lib/supabase/server';

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
            <div className="container-custom text-center">
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
                            <img
                                src={partner.logo_url}
                                alt={partner.name}
                                className="h-12 md:h-16 object-contain max-w-[150px]"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
