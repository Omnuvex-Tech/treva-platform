"use client";

import { useCallback, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "./gallery-lightbox.css";

/** Lightbox-un ekran oxuyucu etiketləri. */
const lightboxLabels = {
  az: { gallery: 'Qalereya', close: 'Bağla', prev: 'Əvvəlki şəkil', next: 'Növbəti şəkil', nth: (i: number) => `${i}-ci şəkil` },
  en: { gallery: 'Gallery', close: 'Close', prev: 'Previous image', next: 'Next image', nth: (i: number) => `Image ${i}` },
  ru: { gallery: 'Галерея', close: 'Закрыть', prev: 'Предыдущее изображение', next: 'Следующее изображение', nth: (i: number) => `Изображение ${i}` },
} as const;

export type GalleryImage = {
  url: string;
  alt?: string;
  label?: string;
};

/**
 * Tam ekran şəkil qalereyası.
 *
 * - Klaviatura: ← → keçid, Escape bağlayır
 * - Fon kliki bağlayır, şəklin özünə klik bağlamır
 * - Altdakı miniatür lenti sürüşür və aktiv kadr avtomatik görünür
 * - Açıq olduğu müddətdə səhifənin sürüşməsi dayanır
 */
export function GalleryLightbox({
  images,
  index,
  onClose,
  onIndexChange,
  locale = "az",
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  locale?: string;
}) {
  const l = lightboxLabels[locale as keyof typeof lightboxLabels] ?? lightboxLabels.az;
  const stripRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      // Dövrə: sonuncudan sonra birinciyə qayıdır.
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Arxa fon sürüşməsin deyə.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Aktiv miniatür lentdə görünən sahəyə gətirilir.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  const current = images[index];
  if (!current) return null;

  return (
    <div className="tg-lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={l.gallery}>
      <button type="button" className="tg-lightbox__close" onClick={onClose} aria-label={l.close}>
        <X size={22} />
      </button>

      <span className="tg-lightbox__counter">
        {index + 1} / {total}
      </span>

      {total > 1 && (
        <button
          type="button"
          className="tg-lightbox__nav tg-lightbox__nav--prev"
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          aria-label={l.prev}
        >
          <ChevronLeft size={26} />
        </button>
      )}

      <figure className="tg-lightbox__stage" onClick={(e) => e.stopPropagation()}>
        <img src={current.url} alt={current.alt || current.label || ""} className="tg-lightbox__img" />
        {current.label && <figcaption className="tg-lightbox__caption">{current.label}</figcaption>}
      </figure>

      {total > 1 && (
        <button
          type="button"
          className="tg-lightbox__nav tg-lightbox__nav--next"
          onClick={(e) => { e.stopPropagation(); go(1); }}
          aria-label={l.next}
        >
          <ChevronRight size={26} />
        </button>
      )}

      {total > 1 && (
        <div className="tg-lightbox__strip" ref={stripRef} onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              data-active={i === index}
              className={`tg-lightbox__thumb ${i === index ? "is-active" : ""}`}
              onClick={() => onIndexChange(i)}
              aria-label={l.nth(i + 1)}
            >
              <img src={img.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
