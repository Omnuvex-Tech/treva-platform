"use client";

import { useState, useRef } from "react";
import { cn } from "../../lib/utils";

interface FormImageFieldProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    uploadFn: (file: File) => Promise<{ url: string }>;
    accept?: string;
    required?: boolean;
    previewClassName?: string;
    uploadClassName?: string;
}

export function FormImageField({
    label,
    value,
    onChange,
    uploadFn,
    accept = "image/*",
    required,
    previewClassName,
    uploadClassName,
}: FormImageFieldProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadFn(file);
            onChange(res.url);
        } catch {
            // upload failed silently
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col">
            <label
                className="mb-1 block text-xs font-semibold text-[#333333]"
                style={{ lineHeight: "18px" }}
            >
                {label}
                {required && <span style={{ color: "#F31100" }}>*</span>}
            </label>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleUpload}
                className="hidden"
            />
            {value ? (
                <div className={cn("relative w-full h-[200px] rounded-xl overflow-hidden bg-[#F4F5F6]", previewClassName)}>
                    <img src={value} alt={label} className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={cn("w-full h-[180px] rounded-xl border-2 border-dashed border-[#CCCCCC] bg-[#F4F5F6] flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors cursor-pointer", uploadClassName)}
                >
                    {uploading ? (
                        <span className="text-sm text-[#666666]">Uploading...</span>
                    ) : (
                        <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                            <span className="text-sm text-[#999]">Click to upload image</span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
