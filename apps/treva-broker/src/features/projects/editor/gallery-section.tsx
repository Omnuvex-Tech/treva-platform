"use client";

import { Delete02Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";

import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";

/** The three tiles the artboard draws under the hero (873:51119…). */
const SLOTS = 3;

const ACCEPT = "image/jpeg,image/png,image/webp";

/**
 * Reads a picked file into a data URL.
 *
 * Not `URL.createObjectURL`: that URL dies with the File it came from, and this
 * component clears the input right after reading it so the same file can be
 * picked twice — which left the preview pointing at a revoked blob. A data URL
 * has no such lifetime, and there is no upload endpoint to send bytes to yet.
 */
function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export interface GallerySectionProps {
    heroImageUrl: string | null;
    galleryImageUrls: readonly string[];
    onChange: (next: { heroImageUrl: string | null; galleryImageUrls: string[] }) => void;
    disabled?: boolean;
}

/**
 * One image well — the hero or a thumbnail (873:51116 / 873:51119).
 *
 * The artboard draws an empty well as Figma's own "no fill" hatching and puts
 * only a delete chip on a filled one, so it says nothing about how an image
 * gets in. The well is therefore a real control: click it to pick a file, or
 * drop one on it. A filled well keeps the chip and swaps its picture on click.
 */
function ImageWell({
    src,
    label,
    hint,
    onPick,
    onClear,
    disabled,
    className,
    sizes,
}: {
    src: string | null;
    label: string;
    hint: string;
    onPick: (file: File) => void;
    onClear: () => void;
    disabled?: boolean;
    className?: string;
    sizes: string;
}) {
    const { t } = useI18n();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;

        const file = Array.from(event.dataTransfer.files).find((entry) =>
            entry.type.startsWith("image/"),
        );
        if (file) onPick(file);
    }

    return (
        <div
            onDragOver={(event) => {
                if (disabled) return;
                event.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "relative overflow-hidden rounded-xl border bg-bg-secondary transition-colors",
                dragging ? "border-border-brand bg-bg-tertiary" : "border-border-subtle",
                className,
            )}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    // Clear here, not in onChange: resetting the input while the
                    // reader still holds its File releases the backing store
                    // and the read comes back empty. Clearing on the way in
                    // still lets the same file be picked twice.
                    if (inputRef.current) inputRef.current.value = "";
                    inputRef.current?.click();
                }}
                aria-label={src ? t.projects.editor.replaceImage : label}
                title={src ? t.projects.editor.replaceImage : label}
                className="group size-full cursor-pointer disabled:cursor-not-allowed"
            >
                {src ? (
                    <>
                        {/* A picked file is an inline data URL, which next's
                            Image cannot take — it demands a routable path. Only
                            the stored ones go through the optimiser. */}
                        {src.startsWith("data:") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
                        ) : (
                            <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
                        )}
                        {/* The replace affordance only appears on hover, so a
                            filled well still reads as the artboard's picture. */}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-transparent transition-colors group-hover:bg-black/40 group-hover:text-content-inverse">
                            {t.projects.editor.replaceImage}
                        </span>
                    </>
                ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-2 text-content-disabled">
                        <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                        <span className="text-xs text-content-tertiary">{label}</span>
                        <span className="text-xs">{hint}</span>
                    </span>
                )}
            </button>

            {src && !disabled ? (
                <button
                    type="button"
                    onClick={onClear}
                    aria-label={t.common.delete}
                    title={t.common.delete}
                    className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-pill bg-bg-primary text-content-secondary shadow-l2 transition-colors hover:bg-bg-secondary"
                >
                    <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                </button>
            ) : null}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onPick(file);
                }}
            />
        </div>
    );
}

/**
 * The gallery at the top of the project editor (873:51112).
 *
 * A 368px hero over three 200px tiles, all 24 apart and inset 8 to line up with
 * the sections below.
 *
 * Picked files stay local: `lib/api/http` serialises every body as JSON and has
 * no multipart path, so a well shows an object URL and the real upload is one
 * endpoint away. Nothing else about this component changes when it lands.
 */
export function GallerySection({
    heroImageUrl,
    galleryImageUrls,
    onChange,
    disabled,
}: GallerySectionProps) {
    const { t } = useI18n();

    function setHero(url: string | null) {
        onChange({ heroImageUrl: url, galleryImageUrls: [...galleryImageUrls] });
    }

    function setSlot(index: number, url: string | null) {
        const next = [...galleryImageUrls];
        if (url === null) next.splice(index, 1);
        else next[index] = url;

        onChange({ heroImageUrl, galleryImageUrls: next });
    }

    return (
        <section className="flex flex-col gap-6 px-2">
            <ImageWell
                src={heroImageUrl}
                label={t.projects.editor.heroImage}
                hint={t.projects.editor.imageHint}
                sizes="1104px"
                disabled={disabled}
                onPick={(file) => void readAsDataUrl(file).then(setHero)}
                onClear={() => setHero(null)}
                className="h-92"
            />

            <div className="grid gap-6 sm:grid-cols-3">
                {Array.from({ length: SLOTS }, (_, index) => (
                    <ImageWell
                        key={index}
                        src={galleryImageUrls[index] ?? null}
                        label={t.projects.editor.galleryImage}
                        hint={t.projects.editor.imageHint}
                        sizes="355px"
                        disabled={disabled}
                        onPick={(file) => void readAsDataUrl(file).then((url) => setSlot(index, url))}
                        onClear={() => setSlot(index, null)}
                        className="h-50"
                    />
                ))}
            </div>
        </section>
    );
}
