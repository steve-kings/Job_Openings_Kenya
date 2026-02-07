'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function EditOpportunityPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        type: 'Job',
        company: '',
        location: '',
        deadline: '',
        apply_url: '',
        short_description: '',
        description: '',
        status: 'active'
    });

    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [responsibilities, setResponsibilities] = useState<string[]>(['']);
    const [benefits, setBenefits] = useState<string[]>(['']);

    useEffect(() => {
        fetchOpportunity();
    }, []);

    const fetchOpportunity = async () => {
        try {
            const { data, error } = await supabase
                .from('opportunities')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) throw error;

            setFormData({
                title: data.title,
                type: data.type,
                company: data.company,
                location: data.location,
                deadline: data.deadline,
                apply_url: data.apply_url,
                short_description: data.short_description || '',
                description: data.description,
                status: data.status
            });

            setThumbnailUrl(data.thumbnail_url || '');
            setRequirements(data.requirements && data.requirements.length > 0 ? data.requirements : ['']);
            setResponsibilities(data.responsibilities && data.responsibilities.length > 0 ? data.responsibilities : ['']);
            setBenefits(data.benefits && data.benefits.length > 0 ? data.benefits : ['']);

        } catch (error) {
            console.error('Error fetching opportunity:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArrayChange = (
        index: number,
        value: string,
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        currentArray: string[]
    ) => {
        const newArray = [...currentArray];
        newArray[index] = value;
        setter(newArray);
    };

    const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, currentArray: string[]) => {
        setter([...currentArray, '']);
    };

    const removeArrayItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>, currentArray: string[]) => {
        const newArray = currentArray.filter((_, i) => i !== index);
        setter(newArray);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Filter out empty strings
            const cleanRequirements = requirements.filter(r => r.trim() !== '');
            const cleanResponsibilities = responsibilities.filter(r => r.trim() !== '');
            const cleanBenefits = benefits.filter(r => r.trim() !== '');

            const { error } = await supabase
                .from('opportunities')
                .update({
                    ...formData,
                    thumbnail_url: thumbnailUrl || null,
                    requirements: cleanRequirements,
                    responsibilities: cleanResponsibilities,
                    benefits: cleanBenefits,
                    updated_at: new Date().toISOString()
                })
                .eq('id', params.id);

            if (error) throw error;

            alert('Opportunity updated successfully!');
            router.push('/admin/opportunities');
        } catch (error) {
            console.error('Error updating opportunity:', error);
            alert('Error updating opportunity. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-6">
                <Link href="/admin/opportunities" className="btn btn-ghost gap-2 mb-2 pl-0">
                    <ArrowLeft size={20} />
                    Back to Opportunities
                </Link>
                <h1 className="text-3xl font-bold text-primary">Edit Opportunity</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Basic Information</h3>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="form-control">
                                <label className="label font-medium">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label font-medium">Type</label>
                                <select
                                    className="select select-bordered"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Job</option>
                                    <option>Grant</option>
                                    <option>Scholarship</option>
                                    <option>Training</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="form-control">
                                <label className="label font-medium">Company / Organization</label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label font-medium">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="form-control">
                                <label className="label font-medium">Application Deadline</label>
                                <input
                                    type="date"
                                    required
                                    className="input input-bordered"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label font-medium">Application Link (URL)</label>
                                <input
                                    type="url"
                                    required
                                    className="input input-bordered"
                                    value={formData.apply_url}
                                    onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-control mb-4">
                            <label className="label font-medium">Short Description</label>
                            <textarea
                                required
                                className="textarea textarea-bordered h-20"
                                value={formData.short_description}
                                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="form-control mb-4">
                            <label className="label font-medium">Full Description</label>
                            <textarea
                                required
                                className="textarea textarea-bordered h-40 font-mono text-sm"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="form-control">
                            <label className="label font-medium">Status</label>
                            <select
                                className="select select-bordered w-full max-w-xs"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Thumbnail Image</h3>
                        <CloudinaryUpload
                            onUploadComplete={(url) => setThumbnailUrl(url)}
                            currentImage={thumbnailUrl}
                            folder="yena-opportunities"
                            label="Opportunity Thumbnail (Optional)"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Upload a thumbnail image for this opportunity. Leave empty to use default placeholder.
                        </p>
                    </div>
                </div>

                {/* Dynamic Lists */}
                <div className="grid md:grid-cols-1 gap-6">
                    {/* Requirements */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Requirements</h3>
                                <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => addArrayItem(setRequirements, requirements)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered w-full input-sm"
                                            value={req}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setRequirements, requirements)}
                                        />
                                        <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeArrayItem(idx, setRequirements, requirements)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Responsibilities */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Responsibilities</h3>
                                <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => addArrayItem(setResponsibilities, responsibilities)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {responsibilities.map((res, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered w-full input-sm"
                                            value={res}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setResponsibilities, responsibilities)}
                                        />
                                        <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeArrayItem(idx, setResponsibilities, responsibilities)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Benefits</h3>
                                <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => addArrayItem(setBenefits, benefits)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {benefits.map((ben, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered w-full input-sm"
                                            value={ben}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setBenefits, benefits)}
                                        />
                                        <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeArrayItem(idx, setBenefits, benefits)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link href="/admin/opportunities" className="btn btn-ghost">Cancel</Link>
                    <button type="submit" className="btn btn-primary w-40" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Opportunity'}
                    </button>
                </div>
            </form>
        </div>
    );
}
