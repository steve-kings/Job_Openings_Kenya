'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditOpportunityPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
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
        status: 'active',
        salary_min: '',
        salary_max: '',
        salary_currency: 'KES',
    });

    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [requirements, setRequirements] = useState<string[]>(['']);
    const [responsibilities, setResponsibilities] = useState<string[]>(['']);
    const [benefits, setBenefits] = useState<string[]>(['']);

    const fetchOpportunity = useCallback(async () => {
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
                status: data.status,
                salary_min: data.salary_min ? String(data.salary_min) : '',
                salary_max: data.salary_max ? String(data.salary_max) : '',
                salary_currency: data.salary_currency || 'KES',
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
    }, [supabase, params.id]);

    useEffect(() => {
        fetchOpportunity();
    }, [fetchOpportunity]);

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
                    salary_min: formData.salary_min ? parseInt(formData.salary_min, 10) : null,
                    salary_max: formData.salary_max ? parseInt(formData.salary_max, 10) : null,
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
                <Link href="/admin/opportunities" className="inline-flex items-center gap-2 mb-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Opportunities
                </Link>
                <h1 className="text-3xl font-bold text-emerald-600">Edit Opportunity</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">Basic Information</h3>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Job</option>
                                    <option>Training</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Company / Organization</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Application Link (URL)</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    value={formData.apply_url}
                                    onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                                />
                            </div>
                        </div>

                        {formData.type === 'Job' && (
                            <div className="grid md:grid-cols-3 gap-6 mb-4">
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Salary Min (Monthly)</label>
                                    <input type="number" min={0} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={formData.salary_min} onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })} placeholder="e.g. 50000" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Salary Max (Monthly)</label>
                                    <input type="number" min={0} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={formData.salary_max} onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })} placeholder="e.g. 100000" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                                    <select className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={formData.salary_currency} onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}>
                                        <option value="KES">KES</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 mb-4">
                            <label className="block text-sm font-medium text-gray-700">Short Description</label>
                            <textarea
                                required
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 h-20 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                value={formData.short_description}
                                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="space-y-1 mb-4">
                            <label className="block text-sm font-medium text-gray-700">Full Description</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(content) => setFormData({ ...formData, description: content })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                className="w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">Thumbnail Image</h3>
                        <CloudinaryUpload
                            onUploadComplete={(url) => setThumbnailUrl(url)}
                            currentImage={thumbnailUrl}
                            folder="Job Openings Kenya-opportunities"
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
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Requirements</h3>
                                <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => addArrayItem(setRequirements, requirements)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={req}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setRequirements, requirements)}
                                        />
                                        <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => removeArrayItem(idx, setRequirements, requirements)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Responsibilities */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Responsibilities</h3>
                                <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => addArrayItem(setResponsibilities, responsibilities)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {responsibilities.map((res, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={res}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setResponsibilities, responsibilities)}
                                        />
                                        <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => removeArrayItem(idx, setResponsibilities, responsibilities)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Benefits</h3>
                                <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => addArrayItem(setBenefits, benefits)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {benefits.map((ben, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            value={ben}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setBenefits, benefits)}
                                        />
                                        <button type="button" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors" onClick={() => removeArrayItem(idx, setBenefits, benefits)}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link href="/admin/opportunities" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">Cancel</Link>
                    <button type="submit" className="inline-flex items-center justify-center w-40 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50" disabled={saving}>
                        {saving ? 'Saving...' : 'Update Opportunity'}
                    </button>
                </div>
            </form>
        </div>
    );
}
