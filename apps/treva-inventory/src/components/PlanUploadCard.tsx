import { useRef, useState, type DragEvent } from "react";

interface PlanUploadCardProps {
    planName: string;
    onPlanNameChange: (value: string) => void;
    selectedFileName?: string;
    uploading?: boolean;
    onFileSelect: (file: File) => void;
    onUpload: () => void;
    onCancel: () => void;
}

export function PlanUploadCard({
    planName,
    onPlanNameChange,
    selectedFileName,
    uploading = false,
    onFileSelect,
    onUpload,
    onCancel,
}: PlanUploadCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (files?: FileList | null) => {
        const file = files?.[0];
        if (!file) return;
        onFileSelect(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onDragOver = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDragEnter = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const onDragLeave = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const onDrop = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="rounded-[24px] border border-[#E9ECF2] bg-[#FBFCFD] p-4">
            <div className="flex flex-wrap items-start gap-4">
                <div className="w-full max-w-[280px]">
                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Plan Name</label>
                    <input
                        className="h-11 w-full rounded-2xl border border-[#E7E9EE] bg-white px-4 py-0 text-sm leading-5 text-[#1A1A1A] placeholder-[#999] outline-none transition-colors focus:border-[#C8CDD8]"
                        value={planName}
                        onChange={(e) => onPlanNameChange(e.target.value)}
                        placeholder="Master Plan A"
                    />
                </div>

                <div className="w-full max-w-[220px]">
                    <span className="mb-1.5 block text-xs font-medium text-[#4E525D]">File Upload</span>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={onDragOver}
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed px-4 py-6 text-center transition-colors ${
                            dragActive
                                ? "border-blue-400 bg-blue-50"
                                : uploading
                                    ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50"
                                    : "border-gray-200 bg-[#F8F9FB] hover:border-gray-400"
                        }`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${dragActive ? "text-blue-500" : "text-[#999]"}`}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className={`text-sm font-medium ${dragActive ? "text-blue-500" : "text-[#666666]"}`}>
                            {uploading ? "Uploading..." : dragActive ? "Drop file here" : "Drag, drop or click to upload"}
                        </span>
                        <span className="max-w-full truncate text-[11px] text-[#999]">
                            {selectedFileName || "PDF or image file"}
                        </span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                    />
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onUpload}
                    disabled={uploading || !selectedFileName}
                    className="rounded-xl bg-[#4E525D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "Upload plan"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={uploading}
                    className="rounded-xl border border-[#D9DEE7] px-4 py-2.5 text-sm font-medium text-[#666666] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
