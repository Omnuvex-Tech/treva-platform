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
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError("");

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file) {
                    const response = await unitLayoutsApi.uploadFile(file);
                    onUpload(response.data);
                }
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

    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-white/70">
                {label}
            </label>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleChange}
                disabled={uploading}
                className="block w-full text-sm text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white file:transition-colors file:hover:bg-white/20 disabled:opacity-50"
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
