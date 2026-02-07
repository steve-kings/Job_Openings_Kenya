'use client'

import { useState } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';

interface CloudinaryUploadProps {
    onUploadComplete: (url: string) => void;
    currentImage?: string;
    folder?: string;
    label?: string;
}

export default function CloudinaryUpload({ 
    onUploadComplete, 
    currentImage, 
    folder = 'yena',
    label = 'Upload Image'
}: CloudinaryUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

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
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onUploadComplete('');
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            
            {preview ? (
                <div className="relative">
                    <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 btn btn-sm btn-circle bg-red-500 text-white hover:bg-red-600 border-none"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#C44536] transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                        id="cloudinary-upload"
                    />
                    <label 
                        htmlFor="cloudinary-upload" 
                        className="cursor-pointer flex flex-col items-center"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin text-[#C44536] mb-2" size={40} />
                                <p className="text-sm text-gray-600">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="text-gray-400 mb-2" size={40} />
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="text-[#C44536] font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </>
                        )}
                    </label>
                </div>
            )}

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}
