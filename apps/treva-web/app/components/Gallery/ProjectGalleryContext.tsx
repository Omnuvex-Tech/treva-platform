"use client";

/**
 * Layihə detal səhifəsinin ümumi qalereyası.
 *
 * Səhifədəki bütün bloklar (hero, ümumi baxış, interyer bölmələri) öz
 * şəkillərini ayrı-ayrı qalereyalarda saxlasaydı, istifadəçi bir şəklə
 * kliklədikdə yalnız həmin blokun 2-3 şəklini gəzə bilərdi. Burada isə siyahı
 * bir dəfə — CMS bloklarının sırası ilə — qurulur və hansı şəklə klikləsə,
 * lightbox həmin kadrdan açılıb bütün layihəni gəzməyə imkan verir.
 *
 * Provider `ProjectSections`-dədir; bloklar yalnız `useProjectGallery()` ilə
 * `open(url)` çağırır. Provider olmadıqda kontekst `null` qaytarır və bloklar
 * şəkli sadəcə kliklənməz göstərir — komponentlər tək-tək də işlənə bilir.
 */

import React from "react";
import { GalleryLightbox, type GalleryImage } from "./GalleryLightbox";

type ProjectGalleryValue = {
  /** Verilmiş şəkli qalereyada tapıb tam ekranda açır. */
  open: (url: string) => void;
  /** Şəkil qalereyada varmı — kursoru yalnız o zaman dəyişirik. */
  has: (url: string) => boolean;
};

const ProjectGalleryContext = React.createContext<ProjectGalleryValue | null>(null);

export function useProjectGallery(): ProjectGalleryValue | null {
  return React.useContext(ProjectGalleryContext);
}

export function ProjectGalleryProvider({
  images,
  children,
}: {
  images: GalleryImage[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = React.useState<number | null>(null);

  // Eyni şəkil bir neçə blokda təkrarlana bilər — ilk mövqe kifayətdir.
  const positions = React.useMemo(() => {
    const map = new Map<string, number>();
    images.forEach((img, i) => {
      if (!map.has(img.url)) map.set(img.url, i);
    });
    return map;
  }, [images]);

  const value = React.useMemo<ProjectGalleryValue>(
    () => ({
      open: (url) => {
        const at = positions.get(url);
        if (at !== undefined) setIndex(at);
      },
      has: (url) => positions.has(url),
    }),
    [positions],
  );

  return (
    <ProjectGalleryContext.Provider value={value}>
      {children}
      {index !== null && images.length > 0 && (
        <GalleryLightbox
          images={images}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setIndex(null)}
        />
      )}
    </ProjectGalleryContext.Provider>
  );
}
