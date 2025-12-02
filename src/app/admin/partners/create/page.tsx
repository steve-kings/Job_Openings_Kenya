'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CreatePartnerPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website_url: ''
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logoFile) {
            alert('Please upload a logo.');
            return;
        }

        setLoading(true);

        try {
            setUploading(true);
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'partners' bucket
            const { error: uploadError } = await supabase.storage
                .from('partners')
                .upload(filePath, logoFile);

            if (uploadError) {
                // Fallback to 'public' or 'images' if 'partners' doesn't exist? 
                // For now, throw error to alert user.
                throw new Error(`Upload failed: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('partners')
                .getPublicUrl(filePath);

            setUploading(false);

            const { error } = await supabase
                .from('partners')
                .insert({
                    ...formData,
                    logo_url: publicUrl
                });

            if (error) throw error;

            router.push('/admin/partners');
            router.refresh();
        } catch (error: any) {
            console.error('Error creating partner:', error);
            alert(`Error creating partner: ${error.message}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/admin/partners" className="btn btn-ghost gap-2 mb-2 pl-0">
                    <ArrowLeft size={20} />
                    Back to Partners
                </Link>
                <h1 className="text-3xl font-bold text-primary">Add New Partner</h1>
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
                            placeholder="e.g. Google, Microsoft"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Website URL</label>
                        <input
                            type="url"
                            className="input input-bordered"
                            value={formData.website_url}
                            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Description</label>
                        <textarea
                            className="textarea textarea-bordered h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the partnership..."
                        ></textarea>
                    </div>

                    <div className="form-control">
                        <label className="label font-medium">Logo Upload</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                required
                                className="file-input file-input-bordered w-full"
                                onChange={handleLogoChange}
                            />
                        </div>
                        {logoPreview && (
                            <div className="mt-4 p-4 border rounded-lg bg-base-200 flex justify-center">
                                <img src={logoPreview} alt="Preview" className="h-20 object-contain" />
                            </div>
                        )}
                    </div>

                    <div className="divider"></div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading || uploading}>
                        {loading ? 'Saving...' : 'Add Partner'}
                    </button>
                </div>
            </form>
        </div>
    );
}
