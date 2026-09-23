"use client";

import { Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import { isApiError } from "@/lib/api/errors";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { projectsService } from "../api/projects.service";

/** The three tiles the artboard draws under the hero (873:51119…). */
const SLOTS = 3;

const ACCEPT = "image/jpeg,image/png,image/webp";

/** Which well an upload is filling: the hero, or a tile by index. */
type WellKey = "hero" | number;

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
    uploading,
    className,
    chipClassName,
    sizes,
}: {
    src: string | null;
    label: string;
    hint: string;
    onPick: (file: File) => void;
    onClear: () => void;
    disabled?: boolean;
    uploading?: boolean;
    className?: string;
    /** Where the delete chip sits: 16 in from the hero's corner, 12 on a tile. */
    chipClassName: string;
    sizes: string;
}) {
    const { t } = useI18n();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
        if (disabled || uploading) return;

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
                // 5XL (24) and no stroke: the wells are image fills on a
                // clipped frame (873:51116). No border box at all — even a
                // transparent 1px edge would take 2px off the grid — so the
                // drag state is an inset ring instead.
                "@container relative overflow-hidden rounded-[var(--radius-5xl)] bg-bg-app transition-shadow",
                dragging && "ring-2 ring-border-brand ring-inset",
                className,
            )}
        >
            <button
                type="button"
                disabled={disabled || uploading}
                aria-busy={uploading}
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
                    <>
                        {/* The artboard fills an empty well with a transparency
                            grid (873:51116): sixteen #ebebeb / #fafafa cells
                            across whatever the width, centred like the cover
                            fit of a square image. Sized in container units so
                            the 1104 hero and the 354 tiles both get sixteen. */}
                        <span
                            aria-hidden
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    "repeating-conic-gradient(var(--color-bg-tertiary) 0 25%, var(--color-bg-app) 0 50%)",
                                backgroundSize: "12.5cqw 12.5cqw",
                                backgroundPosition: "center",
                            }}
                        />
                        {/* The how-to only surfaces on hover, so the resting
                            well is the artboard's bare grid. */}
                        <span className="relative flex size-full flex-col items-center justify-center gap-2 text-content-tertiary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <HugeiconsIcon icon={Image01Icon} size={24} strokeWidth={1.5} />
                            <span className="text-xs">{label}</span>
                            <span className="text-xs">{hint}</span>
                        </span>
                    </>
                )}

                {uploading ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-content-inverse">
                        {t.common.upload.uploading}
                    </span>
                ) : null}
            </button>

            {src && !disabled ? (
                <button
                    type="button"
                    onClick={onClear}
                    aria-label={t.common.delete}
                    title={t.common.delete}
                    // 873:51117 — 32 square on Background/Secondary with an 8px
                    // radius, a 1px-stroke trash in brand.
                    className={cn(
                        "absolute flex size-8 items-center justify-center rounded-sm bg-bg-secondary p-2 text-content-brand transition-colors hover:bg-bg-tertiary",
                        chipClassName,
                    )}
                >
                    <AssetIcon src="/images/projects/icon-trash-thin.svg" size={16} />
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
 * the sections below. The hero's own row carries a further 8 on its left
 * (873:51115), so it is 1104 wide and flush right while the tiles span the full
 * 1112 — drawn that way, kept that way.
 *
 * A picked file is stored first and only its URL goes into the project, so a
 * save never carries the bytes themselves.
 */
export function GallerySection({
    heroImageUrl,
    galleryImageUrls,
    onChange,
    disabled,
}: GallerySectionProps) {
    const { t } = useI18n();
    const toast = useToast();
    const [uploading, setUploading] = useState<ReadonlySet<WellKey>>(new Set());

    // An upload resolves renders after it started; reading the props it closed
    // over would drop whatever another well stored in the meantime.
    const latest = useRef({ heroImageUrl, galleryImageUrls });
    latest.current = { heroImageUrl, galleryImageUrls };

    function setHero(url: string | null) {
        onChange({ heroImageUrl: url, galleryImageUrls: [...latest.current.galleryImageUrls] });
    }

    function setSlot(index: number, url: string | null) {
        const next = [...latest.current.galleryImageUrls];
        if (url === null) next.splice(index, 1);
        else next[index] = url;

        // Filling the third tile of an empty gallery must not save two holes.
        onChange({
            heroImageUrl: latest.current.heroImageUrl,
            galleryImageUrls: next.filter(Boolean),
        });
    }

    async function upload(key: WellKey, file: File) {
        setUploading((current) => new Set(current).add(key));

        try {
            const url = await projectsService.uploadImage(file);
            if (key === "hero") setHero(url);
            else setSlot(key, url);
        } catch (error) {
            toast.error(
                isApiError(error) && error.status !== 0
                    ? error.message
                    : interpolate(t.common.upload.uploadFailed, { name: file.name }),
            );
        } finally {
            setUploading((current) => {
                const next = new Set(current);
                next.delete(key);
                return next;
            });
        }
    }

    return (
        <section className="flex flex-col gap-6 px-2">
            <ImageWell
                src={heroImageUrl}
                label={t.projects.editor.heroImage}
                hint={t.projects.editor.imageHint}
                sizes="1104px"
                disabled={disabled}
                uploading={uploading.has("hero")}
                onPick={(file) => void upload("hero", file)}
                onClear={() => setHero(null)}
                className="ml-2 h-92"
                chipClassName="top-4 right-4"
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
                        uploading={uploading.has(index)}
                        onPick={(file) => void upload(index, file)}
                        onClear={() => setSlot(index, null)}
                        className="h-50"
                        chipClassName="top-3 right-3"
                    />
                ))}
            </div>
        </section>
    );
}
