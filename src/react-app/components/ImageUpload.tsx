import { useState, useRef } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadImageToImgBB, validateImageFile } from '@/react-app/utils/imgbb';

interface ImageUploadProps {
    currentImageUrl?: string | null;
    onImageUploaded: (url: string) => void;
    onImageRemoved: () => void;
}

export default function ImageUpload({ currentImageUrl, onImageUploaded, onImageRemoved }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        try {
            // Validate file
            validateImageFile(file, 10); // Max 10MB for better UX

            // Show preview immediately
            const reader = new FileReader();
            reader.onload = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);

            // Upload to imgBB
            setUploading(true);
            const response = await uploadImageToImgBB(file);

            // Use display_url for better quality
            onImageUploaded(response.data.display_url);
            setPreviewUrl(response.data.display_url);
        } catch (err: any) {
            setError(err.message || 'Error al subir la imagen');
            setPreviewUrl(currentImageUrl || null);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        setError(null);
        onImageRemoved();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Imagen del Producto
            </label>

            {previewUrl ? (
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                    {!uploading && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                >
                    <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                            <>
                                <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                                <p className="text-sm text-slate-500">Subiendo imagen...</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="w-10 h-10 text-slate-400" />
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-medium text-slate-900 dark:text-slate-100">Click para subir</span>
                                    <p className="text-xs mt-1">PNG, JPG, GIF, WEBP (máx. 10MB)</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {error && (
                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}
