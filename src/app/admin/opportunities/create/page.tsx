'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Plus, X, Briefcase, Building2, MapPin, Calendar, Link2, FileText, Save, Image as ImageIcon, Info } from 'lucide-react';
import Link from 'next/link';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function CreateOpportunityPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        try {
            // Filter out empty strings
            const cleanRequirements = requirements.filter(r => r.trim() !== '');
            const cleanResponsibilities = responsibilities.filter(r => r.trim() !== '');
            const cleanBenefits = benefits.filter(r => r.trim() !== '');

            const { error } = await supabase
                .from('opportunities')
                .insert({
                    ...formData,
                    thumbnail_url: thumbnailUrl || null,
                    requirements: cleanRequirements,
                    responsibilities: cleanResponsibilities,
                    benefits: cleanBenefits
                });

            if (error) throw error;

            router.push('/admin/opportunities');
            router.refresh();
        } catch (error) {
            console.error('Error creating opportunity:', error);
            alert('Error creating opportunity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin/opportunities" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#C44536] transition-colors mb-4">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Opportunities</span>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#C44536]/10 rounded-xl">
                        <Briefcase className="text-[#C44536]" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Add New Opportunity</h1>
                        <p className="text-gray-600 mt-1">Create a new job, scholarship, grant, or training opportunity</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="card bg-white shadow-xl border-l-4 border-[#C44536]">
                    <div className="card-body">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-[#C44536]" />
                            Basic Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Title</span>
                                    <span className="label-text-alt text-red-500">Required</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered focus:border-[#C44536] focus:outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Senior Frontend Developer"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Type</span>
                                    <span className="label-text-alt text-red-500">Required</span>
                                </label>
                                <select
                                    className="select select-bordered focus:border-[#C44536] focus:outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Job</option>
                                    <option>Grant</option>
                                    <option>Scholarship</option>
                                    <option>Training</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Company / Organization</span>
                                    <span className="label-text-alt text-red-500">Required</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="input input-bordered w-full pl-10 focus:border-[#C44536] focus:outline-none"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder="e.g. Google, Microsoft"
                                    />
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Location</span>
                                    <span className="label-text-alt text-red-500">Required</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="input input-bordered w-full pl-10 focus:border-[#C44536] focus:outline-none"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. Nairobi, Kenya (Remote)"
                                    />
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Application Deadline</span>
                                    <span className="label-text-alt text-red-500">Required</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        className="input input-bordered w-full pl-10 focus:border-[#C44536] focus:outline-none"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-gray-700">Application Link (URL)</span>
                                    <span className="label-text-alt text-red-500">Required</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        required
                                        className="input input-bordered w-full pl-10 focus:border-[#C44536] focus:outline-none"
                                        value={formData.apply_url}
                                        onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text font-semibold text-gray-700">Short Description</span>
                                <span className="label-text-alt text-red-500">Required</span>
                            </label>
                            <textarea
                                required
                                className="textarea textarea-bordered h-20 focus:border-[#C44536] focus:outline-none"
                                value={formData.short_description}
                                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                placeholder="Brief summary for the card view (150-200 characters)..."
                            ></textarea>
                            <label className="label">
                                <span className="label-text-alt text-gray-500">{formData.short_description.length} characters</span>
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold text-gray-700">Full Description</span>
                                <span className="label-text-alt text-red-500">Required</span>
                            </label>
                            <textarea
                                required
                                className="textarea textarea-bordered h-40 font-mono text-sm focus:border-[#C44536] focus:outline-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed description (Markdown supported)..."
                            ></textarea>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold text-gray-700">Status</span>
                            </label>
                            <select
                                className="select select-bordered w-full max-w-xs focus:border-[#C44536] focus:outline-none"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">✅ Active</option>
                                <option value="draft">📝 Draft</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="card bg-white shadow-xl border-t-4 border-[#F39C12]">
                    <div className="card-body">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon size={20} className="text-[#F39C12]" />
                            Thumbnail Image
                        </h3>
                        <CloudinaryUpload
                            onUploadComplete={(url) => setThumbnailUrl(url)}
                            currentImage={thumbnailUrl}
                            folder="yena-opportunities"
                            label="Upload Thumbnail"
                        />
                        <div className="alert alert-info mt-3 py-2">
                            <Info size={16} />
                            <span className="text-xs">Optional. Leave empty to use default placeholder.</span>
                        </div>
                    </div>
                </div>

                {/* Dynamic Lists */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Requirements */}
                    <div className="card bg-white shadow-xl border-t-4 border-[#10B981]">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900">Requirements</h3>
                                <button type="button" className="btn btn-sm bg-[#10B981] hover:bg-[#059669] text-white border-none gap-1" onClick={() => addArrayItem(setRequirements, requirements)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm w-full focus:border-[#10B981] focus:outline-none"
                                            value={req}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setRequirements, requirements)}
                                            placeholder="e.g. 3+ years of experience..."
                                        />
                                        {requirements.length > 1 && (
                                            <button type="button" className="btn btn-ghost btn-sm text-error hover:bg-red-50" onClick={() => removeArrayItem(idx, setRequirements, requirements)}>
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Responsibilities */}
                    <div className="card bg-white shadow-xl border-t-4 border-[#F39C12]">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900">Responsibilities</h3>
                                <button type="button" className="btn btn-sm bg-[#F39C12] hover:bg-[#D68910] text-white border-none gap-1" onClick={() => addArrayItem(setResponsibilities, responsibilities)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {responsibilities.map((res, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm w-full focus:border-[#F39C12] focus:outline-none"
                                            value={res}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setResponsibilities, responsibilities)}
                                            placeholder="e.g. Lead the development team..."
                                        />
                                        {responsibilities.length > 1 && (
                                            <button type="button" className="btn btn-ghost btn-sm text-error hover:bg-red-50" onClick={() => removeArrayItem(idx, setResponsibilities, responsibilities)}>
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="card bg-white shadow-xl border-t-4 border-[#8B3A3A]">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg text-gray-900">Benefits</h3>
                                <button type="button" className="btn btn-sm bg-[#8B3A3A] hover:bg-[#6B2A2A] text-white border-none gap-1" onClick={() => addArrayItem(setBenefits, benefits)}>
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {benefits.map((ben, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm w-full focus:border-[#8B3A3A] focus:outline-none"
                                            value={ben}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, setBenefits, benefits)}
                                            placeholder="e.g. Health insurance..."
                                        />
                                        {benefits.length > 1 && (
                                            <button type="button" className="btn btn-ghost btn-sm text-error hover:bg-red-50" onClick={() => removeArrayItem(idx, setBenefits, benefits)}>
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Link href="/admin/opportunities" className="btn btn-ghost">Cancel</Link>
                    <button 
                        type="submit" 
                        className="btn bg-[#C44536] hover:bg-[#8B3A3A] text-white border-none w-48 gap-2" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Create Opportunity
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
