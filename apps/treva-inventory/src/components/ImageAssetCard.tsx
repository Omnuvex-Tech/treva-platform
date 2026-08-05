import { useState, type DragEvent } from "react";
import { IoClose, IoEyeOutline } from "react-icons/io5";
import { ImageLightbox } from "./ImageLightbox";

interface ImageAssetCardProps {
    label: string;
    description: string;
    alt: string;
    imageUrl?: string | null;
    widthClass: string;
    previewClassName: string;
    emptyPreviewClassName: string;
    placeholderTitle: string;
    placeholderHint?: string;
    isDragging?: boolean;
    uploading?: boolean;
    onOpen: () => void;
    onRemove?: () => void;
    onDragOver?: (e: DragEvent) => void;
    onDragEnter?: (e: DragEvent) => void;
    onDragLeave?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
}

export function ImageAssetCard({
    label,
    description,
    alt,
    imageUrl,
    widthClass,
    previewClassName,
    emptyPreviewClassName,
    placeholderTitle,
    placeholderHint,
    isDragging = false,
    uploading = false,
    onOpen,
    onRemove,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
}: ImageAssetCardProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <div className="rounded-[22px] border border-[#ECEEF2] bg-white p-3">
            <div className="flex items-start gap-4">
                <div className={`group relative ${widthClass}`}>
                    <button
                        type="button"
                        onClick={onOpen}
                        onDragOver={onDragOver}
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`cursor-pointer overflow-hidden text-left transition-colors ${imageUrl ? previewClassName : emptyPreviewClassName}`}
                    >
                        {imageUrl ? (
                            <img src={imageUrl} alt={alt} className="h-full w-full rounded-[18px] object-cover" />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-3 text-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isDragging ? "text-blue-500" : "text-[#999]"}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span className={`text-[11px] font-medium leading-4 ${isDragging ? "text-blue-500" : "text-[#666666]"}`}>
                                    {uploading ? "Uploading..." : isDragging ? "Drop here" : placeholderTitle}
                                </span>
                                {placeholderHint ? <span className="text-[10px] leading-4 text-[#9AA0AE]">{placeholderHint}</span> : null}
                            </div>
                        )}
                    </button>

                    {imageUrl ? (
                        <button
                            type="button"
                            aria-label={`View ${label}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxOpen(true);
                            }}
                            className="absolute bottom-3 left-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:opacity-85"
                        >
                            <IoEyeOutline size={14} className="block shrink-0" />
                        </button>
                    ) : null}

                    {imageUrl && onRemove ? (
                        <button
                            type="button"
                            aria-label={`Remove ${label}`}
                            onClick={onRemove}
                            className="absolute right-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white backdrop-blur-sm transition-opacity hover:opacity-85"
                        >
                            <span className="flex h-full w-full items-center justify-center leading-none">
                                <IoClose size={18} className="block shrink-0" />
                            </span>
                        </button>
                    ) : null}
                </div>

                <div className="min-w-0 flex-1 pt-1">
                    <div className="text-sm font-semibold text-[#1A1A1A]">{label}</div>
                    <p className="mt-1 text-xs leading-5 text-[#808191]">{description}</p>
                </div>
            </div>

            {lightboxOpen && imageUrl ? (
                <ImageLightbox src={imageUrl} alt={alt} onClose={() => setLightboxOpen(false)} />
            ) : null}
        </div>
    );
}
