'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Building2, Link2, FileText, Save, Image as ImageIcon, Info } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function CreatePartnerPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website_url: ''
    });

    const [logoUrl, setLogoUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!logoUrl) {
            alert('Please upload a logo.');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('partners')
                .insert({
                    ...formData,
                    logo_url: logoUrl
                });

            if (error) throw error;

            router.push('/admin/partners');
            router.refresh();
        } catch (error: any) {
            console.error('Error creating partner:', error);
            alert(`Error creating partner: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/partners" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#C44536] transition-colors mb-4">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Partners</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#10B981]/10 rounded-xl">
                        <Building2 className="text-[#10B981]" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Add New Partner</h1>
                        <p className="text-gray-600 mt-1">Add a new organization to your partners network</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Partner Information */}
                <div className="card bg-white shadow-xl border-l-4 border-[#10B981]">
                    <div className="card-body">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Building2 size={20} className="text-[#10B981]" />
                            Partner Information
                        </h3>

                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Partner Name</span>
                                    <span className="label-text-alt text-red-500">Required</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered focus:border-[#10B981] focus:outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Google, Microsoft, UNICEF"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Website URL</span>
                                    <span className="label-text-alt text-gray-500">Optional</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        className="input input-bordered w-full pl-10 focus:border-[#10B981] focus:outline-none"
                                        value={formData.website_url}
                                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                        placeholder="https://partner-website.com"
                                    />
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Description</span>
                                    <span className="label-text-alt text-gray-500">Optional</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        className="textarea textarea-bordered h-24 w-full focus:border-[#10B981] focus:outline-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of the partnership and collaboration..."
                                    ></textarea>
                                </div>
                                <label className="label">
                                    <span className="label-text-alt text-gray-500">{formData.description.length} characters</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo Upload */}
                <div className="card bg-white shadow-xl border-t-4 border-[#F39C12]">
                    <div className="card-body">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon size={20} className="text-[#F39C12]" />
                            Partner Logo
                        </h3>

                        <CloudinaryUpload
                            onUploadComplete={(url) => setLogoUrl(url)}
                            currentImage={logoUrl}
                            folder="yena-partners"
                            label="Upload Logo"
                        />

                        <div className="alert alert-warning mt-3 py-2">
                            <Info size={16} />
                            <span className="text-xs">Logo is required. Please upload a clear, high-quality image.</span>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Link href="/admin/partners" className="btn btn-ghost">Cancel</Link>
                    <button 
                        type="submit" 
                        className="btn bg-[#10B981] hover:bg-[#059669] text-white border-none w-40 gap-2" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Add Partner
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
