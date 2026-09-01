"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import RichText from "./RichText";
import { useProjectGallery } from "@/app/components/Gallery/ProjectGalleryContext";
import { cmsImage } from "@/lib/cms-image";
import "./project-gallery.css";

interface GalleryItem {
  url: string;
  caption: string;
}

interface Props {
  titleLight: string;
  titleBold: string;
  description: string;
  items: GalleryItem[];
  getImageUrl: (url: string) => string;
}

/**
 * Layihənin foto qalereyası — interyer və eksteryer kadrları.
 *
 * Şəbəkə "masonry" deyil: sabit nisbətli kartlar sıra-sıra düzülür, çünki
 * fotolar müxtəlif ölçüdə yüklənir və eyni nisbət səhifəni sakit saxlayır.
 * Hər kadra klik səhifənin ümumi tam ekran qalereyasını həmin şəkildən açır.
 */
export default function ProjectGallery({
  titleLight,
  titleBold,
  description,
  items,
  getImageUrl,
}: Props): React.ReactElement | null {
  const gallery = useProjectGallery();
  const valid = items.filter((item) => Boolean(item?.url));

  if (valid.length === 0) return null;

  return (
    <section className="pg-section">
      <PageContainer className="pde-page-container">
        {(titleLight || titleBold) && (
          <div className="pg-header">
            <h2 className="pg-title">
              <span className="po-title-light">{titleLight}</span>
              <span className="po-title-bold">{titleBold}</span>
            </h2>
            {description && <RichText html={description} className="pg-description" />}
          </div>
        )}

        <div className="pg-grid">
          {valid.map((item, i) => {
            const src = getImageUrl(item.url);
            const zoomable = Boolean(gallery?.has(src));
            return (
              <figure key={`${src}-${i}`} className="pg-item">
                <div className="pg-item-frame">
                  <img
                    {...cmsImage(src, { max: 1200 })}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    alt={item.caption}
                    loading="lazy"
                    decoding="async"
                    className={`pg-img${zoomable ? " tg-zoomable" : ""}`}
                    onClick={zoomable ? () => gallery!.open(src) : undefined}
                  />
                </div>
                {item.caption && <figcaption className="pg-caption">{item.caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
