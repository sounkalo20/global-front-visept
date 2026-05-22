'use client';
import { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImageUpload({ currentImage, onFileChange }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return;

        const url = URL.createObjectURL(file);
        setPreview(url);
        onFileChange(file);
    }, [onFileChange]);

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    const onPickFile = () => {
        inputRef.current?.click();
    };

    const onRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        onFileChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-gray-700">
                Image du produit
            </label>

            {/* DROPZONE */}
            <div
                onClick={onPickFile}
                onDrop={onDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all",
                    isDragging
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-300 hover:border-gray-400"
                )}
            >
                {/* INPUT HIDDEN */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />

                {/* PREVIEW */}
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="preview"
                            className="h-36 w-36 rounded-lg object-cover border shadow-sm"
                        />

                        <button
                            type="button"
                            onClick={onRemove}
                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>

                        <div className="mt-3 text-center text-xs text-gray-500">
                            Cliquer pour remplacer l’image
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <Upload className="mx-auto text-gray-400" size={28} />

                        <p className="text-sm text-gray-600">
                            Glissez-déposez une image ou cliquez pour sélectionner
                        </p>

                        <p className="text-xs text-gray-400">
                            PNG, JPG jusqu’à 5MB
                        </p>

                        <button
                            type="button"
                            className="mt-2 rounded-lg bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
                        >
                            Parcourir
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}