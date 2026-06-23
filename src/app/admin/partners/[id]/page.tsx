'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function EditPartnerPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website_url: ''
    });

    const [logoUrl, setLogoUrl] = useState('');

    const fetchPartner = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;

            setFormData({
                name: data.name,
                description: data.description || '',
                website_url: data.website_url || ''
            });
            setLogoUrl(data.logo_url);
        } catch (error) {
            console.error('Error fetching partner:', error);
        } finally {
            setLoading(false);
        }
    }, [params.id, supabase]);

    useEffect(() => {
        fetchPartner();
    }, [fetchPartner]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!logoUrl) {
            alert('Please upload a logo.');
            return;
        }

        setSaving(true);

        try {
            const { error } = await supabase
                .from('partners')
                .update({
                    ...formData,
                    logo_url: logoUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', params.id);

            if (error) throw error;

            alert('Partner updated successfully!');
            router.push('/admin/partners');
        } catch (error: unknown) {
            console.error('Error updating partner:', error);
            alert(`Error updating partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/admin/partners" className="inline-flex items-center gap-2 mb-2 pl-0 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg font-medium">
                    <ArrowLeft size={20} />
                    Back to Partners
                </Link>
                <h1 className="text-3xl font-bold text-primary">Edit Partner</h1>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
                <div className="card-body space-y-4">
                    <div className="form-control">
                        <label className="label font-medium">Partner Name</label>
                        <input
                            type="text"
                            required
                            className="input input-bordered"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Website URL</label>
                        <input
                            type="url"
                            className="input input-bordered"
                            value={formData.website_url}
                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Description</label>
                        <textarea
                            className="textarea textarea-bordered h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <CloudinaryUpload
                        onUploadComplete={(url) => setLogoUrl(url)}
                        currentImage={logoUrl}
                        folder="Job Openings Kenya-partners"
                        label="Partner Logo (Required)"
                    />

                    <div className="divider"></div>

                    <button type="submit" className="inline-flex items-center justify-center w-full bg-[#5CB800] hover:bg-[#4A9900] text-white px-4 py-2.5 rounded-lg font-medium disabled:opacity-50" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Partner'}
                    </button>
                </div>
            </form>
        </div>
    );
}
