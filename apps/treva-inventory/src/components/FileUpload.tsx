import { useState, useRef } from "react";
import { unitLayoutsApi, UploadResponse } from "../api/unit-layouts";

interface FileUploadProps {
    accept?: string;
    label: string;
    onUpload: (result: UploadResponse) => void;
    multiple?: boolean;
}

export function FileUpload({
    accept = "image/*,.pdf",
    label,
    onUpload,
    multiple = false,
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setError("");

        try {
            const fileArray = Array.from(files);
            for (const file of fileArray) {
                const response = await unitLayoutsApi.uploadFile(file);
                onUpload(response.data);
            }
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as { response?: { data?: { message?: string } } };
                setError(axiosErr.response?.data?.message || "Upload failed");
            } else {
                setError("Upload failed");
            }
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        await uploadFiles(files || []);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        await uploadFiles(files);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-white/70">
                {label}
            </label>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
                    isDragging
                        ? "border-blue-400 bg-blue-500/10"
                        : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/8"
                } ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`transition-colors ${isDragging ? "text-blue-400" : "text-white/40"}`}
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div className="text-center">
                    <span className={`text-sm ${isDragging ? "text-blue-400" : "text-white/60"}`}>
                        {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
                    </span>
                </div>
                <span className="text-[11px] text-white/30">
                    {accept === ".pdf" ? "PDF files" : accept === "image/*" ? "Image files" : "Files"}
                </span>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                disabled={uploading}
                className="hidden"
            />
            {uploading && (
                <p className="mt-1 text-xs text-blue-400">Uploading...</p>
            )}
            {error && (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
