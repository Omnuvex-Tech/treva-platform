import { useRef, useState } from "react";
import { IoAdd, IoClose, IoRemove } from "react-icons/io5";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

export function ImageLightbox({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = scrollRef.current;
        if (!el || zoom <= MIN_ZOOM) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = scrollRef.current;
        if (!isDragging || !el) return;
        el.scrollLeft = dragStart.current.scrollLeft - (e.clientX - dragStart.current.x);
        el.scrollTop = dragStart.current.scrollTop - (e.clientY - dragStart.current.y);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - Math.sign(e.deltaY) * ZOOM_STEP)));
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-6"
            onClick={onClose}
        >
            <div className="absolute right-6 top-6 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
                    disabled={zoom <= MIN_ZOOM}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-40 cursor-pointer"
                    aria-label="Zoom out"
                >
                    <IoRemove size={20} />
                </button>
                <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
                    disabled={zoom >= MAX_ZOOM}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-40 cursor-pointer"
                    aria-label="Zoom in"
                >
                    <IoAdd size={20} />
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
                    aria-label="Close"
                >
                    <IoClose size={20} />
                </button>
            </div>

            <div
                ref={scrollRef}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                className={`no-scrollbar max-h-full max-w-full overflow-auto ${
                    zoom > MIN_ZOOM ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
                }`}
            >
                <img
                    src={src}
                    alt={alt || ""}
                    draggable={false}
                    className="max-h-[85vh] max-w-[85vw] select-none object-contain transition-transform duration-150 ease-out"
                    style={{ transform: `scale(${zoom})` }}
                />
            </div>
        </div>
    );
}
