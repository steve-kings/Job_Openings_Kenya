'use client'

import { useState, useId } from 'react';
import { X, Loader2, Upload, CheckCircle } from 'lucide-react';

interface CloudinaryUploadProps {
    onUploadComplete: (url: string) => void;
    currentImage?: string;
    folder?: string;
    label?: string;
}

export default function CloudinaryUpload({
    onUploadComplete,
    currentImage,
    folder = '1000jobs',
    label = 'Upload Image'
}: CloudinaryUploadProps) {
    const uid = useId();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (PNG, JPG, GIF, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const response = await fetch('/api/upload-cloudinary', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setPreview(data.url);
                onUploadComplete(data.url);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(data.error || 'Upload failed. Please try again.');
            }
        } catch (err: any) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setSuccess(false);
        onUploadComplete('');
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const fakeEvent = { target: { files: [file] } } as any;
            handleFileChange(fakeEvent);
        }
    };

    return (
        <div className="space-y-3">
            {preview ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-[#4CAF50] shadow-md">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-52 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label
                            htmlFor={uid}
                            className="btn btn-sm bg-white text-gray-800 hover:bg-gray-100 border-none gap-1 cursor-pointer"
                        >
                            <Upload size={14} /> Replace
                        </label>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="btn btn-sm bg-red-500 text-white hover:bg-red-600 border-none gap-1"
                        >
                            <X size={14} /> Remove
                        </button>
                    </div>
                    {success && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#4CAF50] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                            <CheckCircle size={12} /> Uploaded!
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" id={uid} />
                </div>
            ) : (
                <label
                    htmlFor={uid}
                    className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#1976D2] hover:bg-[#1976D2]/5 transition-all duration-200 cursor-pointer group"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id={uid}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[#1976D2]/10 flex items-center justify-center mb-3">
                                <Loader2 className="animate-spin text-[#1976D2]" size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Uploading to Cloudinary...</p>
                            <p className="text-xs text-gray-400 mt-1">Please wait</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#1976D2]/10 flex items-center justify-center mb-3 transition-colors">
                                <Upload className="text-gray-400 group-hover:text-[#1976D2] transition-colors" size={22} />
                            </div>
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#1976D2] transition-colors">
                                Click to upload or drag & drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP — Max 5MB</p>
                        </div>
                    )}
                </label>
            )}

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    <X size={14} className="flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
