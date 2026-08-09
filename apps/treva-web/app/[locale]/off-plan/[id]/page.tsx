'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import CallbackForm from '@/app/components/Home/Callback/CallbackForm';
import PageContainer from '@/app/components/Container/PageContainer';
import { useUnitLayoutBySlug } from '@/hooks/use-unit-layouts';
import { useCurrencies } from '@/hooks/use-currencies';
import { getTrevaAssetUrl as getAssetUrl } from '@/lib/asset-url';
import { trevaApi as api } from "@/lib/api";
import { endpoints } from "@/config/endpoints";
import type { UnitLayout } from "@/lib/unit-layout.types";
import "../off-plan.css";
import "./apartment-card.css";
import "./panorama-card.css";
import "./similar-apartments.css";

export default function ApartmentCard() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const localeParam = (params as any)?.locale as string | string[] | undefined;
  const locale = Array.isArray(localeParam) ? (localeParam[0] ?? "az") : (localeParam ?? "az");
  const dictionary = {
    az: {
      apartmentNotFound: 'Mənzil tapılmadı',
      backToListings: 'Elanlara qayıt',
      main: 'Əsas',
      offPlan: 'Off-plan',
      noImage: 'Şəkil yoxdur',
      share: 'Paylaş',
      copied: 'Kopyalandı!',
      copyLink: 'Linki kopyala',
      floor: 'Mərtəbə',
      totalArea: 'Ümumi sahə',
      internalArea: 'Daxili sahə',
      balcony: 'Balkon',
      apartmentDetails: 'Mənzil detalları',
      moreDetails: 'Ətraflı məlumat',
      consultation: 'Konsultasiya alın',
      complexInfo: 'Yaşayış kompleksi haqqında daha çox',
      location: 'Məkan',
      contractAddress: 'Müqaviləyə görə ünvan',
      realEstateType: 'Əmlak növü',
      completionYear: 'Təhvil ili',
      numberOfFloors: 'Mərtəbə sayı',
      floorsRange: 'Mərtəbələr',
      similarApartmentsThin: 'OXŞAR',
      similarApartmentsBold: 'MƏNZİLLƏR',
      loading: 'Yüklənir...',
      noSimilarApartments: 'Oxşar mənzil tapılmadı.',
      shown: 'Göstərilib',
      outOf: '/',
      showMore: 'Daha çox göstər',
      checkOutApartment: 'Bu mənzilə baxın',
      available: 'Aktiv',
      sold: 'Satılıb',
      reserved: 'Bron edilib',
      floorSuffix: 'mərtəbə',
    },
    en: {
      apartmentNotFound: 'Apartment not found',
      backToListings: 'Back to listings',
      main: 'Main',
      offPlan: 'Off Plan',
      noImage: 'No image',
      share: 'Share',
      copied: 'Copied!',
      copyLink: 'Copy link',
      floor: 'Floor',
      totalArea: 'Total Area',
      internalArea: 'Internal Area',
      balcony: 'Balcony',
      apartmentDetails: 'Apartment details',
      moreDetails: 'More details',
      consultation: 'Get a Consultation',
      complexInfo: 'More About the Residential Complex',
      location: 'Location',
      contractAddress: 'Address of the house according to the contract',
      realEstateType: 'Real Estate Type',
      completionYear: 'Year of Completion',
      numberOfFloors: 'Number of Floors',
      floorsRange: 'Floors',
      similarApartmentsThin: 'SIMILAR',
      similarApartmentsBold: 'APARTMENTS',
      loading: 'Loading...',
      noSimilarApartments: 'No similar apartments found.',
      shown: 'Shown',
      outOf: 'out of',
      showMore: 'Show more',
      checkOutApartment: 'Check out this apartment',
      available: 'Active',
      sold: 'Sold',
      reserved: 'Reserved',
      floorSuffix: 'floor',
    },
    ru: {
      apartmentNotFound: 'Квартира не найдена',
      backToListings: 'Назад к списку',
      main: 'Главная',
      offPlan: 'Off-plan',
      noImage: 'Нет изображения',
      share: 'Поделиться',
      copied: 'Скопировано!',
      copyLink: 'Скопировать ссылку',
      floor: 'Этаж',
      totalArea: 'Общая площадь',
      internalArea: 'Внутренняя площадь',
      balcony: 'Балкон',
      apartmentDetails: 'Детали квартиры',
      moreDetails: 'Подробнее',
      consultation: 'Получить консультацию',
      complexInfo: 'Подробнее о жилом комплексе',
      location: 'Локация',
      contractAddress: 'Адрес дома по договору',
      realEstateType: 'Тип недвижимости',
      completionYear: 'Год сдачи',
      numberOfFloors: 'Количество этажей',
      floorsRange: 'Этажи',
      similarApartmentsThin: 'ПОХОЖИЕ',
      similarApartmentsBold: 'КВАРТИРЫ',
      loading: 'Загрузка...',
      noSimilarApartments: 'Похожие квартиры не найдены.',
      shown: 'Показано',
      outOf: 'из',
      showMore: 'Показать еще',
      checkOutApartment: 'Посмотрите эту квартиру',
      available: 'Доступно',
      sold: 'Продано',
      reserved: 'Забронировано',
      floorSuffix: 'этаж',
    },
  } as const;
  const t = dictionary[(locale as 'az' | 'en' | 'ru')] || dictionary.az;

  const { data: layout, isLoading, error } = useUnitLayoutBySlug(id);
  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData || [];

  const [currency, setCurrency] = useState('USD');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const [similarPage, setSimilarPage] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const similarLimit = 6;
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [baseFrame, setBaseFrame] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // A pointerdown that pans/pinches still produces a click; remember where the
  // press started so a drag never counts as a backdrop click.
  const pointerMovedRef = useRef(false);
  const pointerDownPointRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number; pointerId: number | null }>({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    pointerId: null,
  });
  const pointerMapRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    startZoom: number;
    startPan: { x: number; y: number };
    startCenter: { x: number; y: number };
  }>({
    active: false,
    startDist: 0,
    startZoom: 1,
    startPan: { x: 0, y: 0 },
    startCenter: { x: 0, y: 0 },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatNumber = (num: number | undefined | null) => {
    return (num ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const statusClass = (statusValue: string) => {
    switch (statusValue?.toLowerCase()) {
      case 'available': return 'badge-available';
      case 'sold': return 'badge-sold';
      case 'reserved': return 'badge-reserved';
      default: return '';
    }
  };

  const formatStatus = (statusValue: string) => {
    const normalized = statusValue?.trim().toLowerCase();
    if (normalized === 'available') return t.available;
    if (normalized === 'sold') return t.sold;
    if (normalized === 'reserved') return t.reserved;
    return statusValue ? statusValue.charAt(0).toUpperCase() + statusValue.slice(1) : '';
  };

  const formatRooms = (rooms?: number | null) => {
    if (!rooms || rooms <= 0) return '';
    if (locale === 'ru') return `${rooms} комн.`;
    if (locale === 'en') return `${rooms} ${rooms === 1 ? 'room' : 'rooms'}`;
    return `${rooms} otaqlı`;
  };

  const formatFloorRange = (item: any) => {
    const start = item?.numberOfFloors?.start;
    const end = item?.numberOfFloors?.end;
    if (typeof start === 'number' && typeof end === 'number') {
      return start !== end ? `${start}-${end}` : `${start}`;
    }
    const floor = item?.floor;
    return typeof floor === 'number' ? `${floor}` : '';
  };

  const panoramaBannerUrl = layout?.category?.bannerImage ? getAssetUrl(layout.category.bannerImage) : '';
  const panoramaPhone = layout?.category?.phoneNumber?.trim() || '+994502772662';
  const panoramaEmail = layout?.category?.salesDepartment?.trim() || '';

  const brochureDoc = layout?.documents?.find(
    (doc) => String(doc?.type || '').trim().toLowerCase() === 'brochure' && doc?.url
  );
  const brochureUrl = brochureDoc?.url ? getAssetUrl(brochureDoc.url) : '';
  const statusValue = layout?.statusOption?.value || (layout as any)?.status || '';
  const realEstateTypeValue =
    typeof (layout as any)?.realEstateType === 'string'
      ? String((layout as any).realEstateType).trim()
      : '';
  const contractAddressValue =
    typeof (layout as any)?.house?.contractAddress === 'string'
      ? String((layout as any).house.contractAddress).trim()
      : '';
  const locationTitleValue =
    String(
      contractAddressValue ||
        ((layout as any)?.house?.location?.title ??
          (layout as any)?.house?.locationTitle ??
          (layout as any)?.location?.title ??
          '')
    ).trim();
  const locationLabel = contractAddressValue ? t.contractAddress : t.location;

  const galleryItems = (() => {
    const items: Array<{ url: string; alt?: string }> = [];
    const mainUrl = layout?.mainImage?.url ? String(layout.mainImage.url).trim() : '';
    if (mainUrl) items.push({ url: mainUrl, alt: layout?.mainImage?.alt || layout?.title });

    const gallery = Array.isArray(layout?.gallery) ? layout!.gallery : [];
    for (const img of gallery) {
      const url = img?.url ? String(img.url).trim() : '';
      if (!url) continue;
      if (mainUrl && url === mainUrl) continue;
      items.push({ url, alt: img?.alt || layout?.title });
    }

    const seen = new Set<string>();
    return items.filter((it) => {
      if (seen.has(it.url)) return false;
      seen.add(it.url);
      return true;
    });
  })();

  const openGallery = (index: number) => {
    if (galleryItems.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, galleryItems.length - 1));
    setGalleryIndex(safeIndex);
    setGalleryOpen(true);
  };

  const closeGallery = () => setGalleryOpen(false);

  const downloadAsset = async (url: string, filename: string) => {
    const safeName = filename?.trim() || 'file';
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const a = document.createElement('a');
      a.href = url;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const goPrev = () => {
    if (galleryItems.length <= 1) return;
    setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const goNext = () => {
    if (galleryItems.length <= 1) return;
    setGalleryIndex((prev) => (prev + 1) % galleryItems.length);
  };

  useEffect(() => {
    if (!galleryOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === '+' || e.key === '=') setZoom((prev) => Math.min(4, Math.round((prev + 0.25) * 100) / 100));
      if (e.key === '-' || e.key === '_') setZoom((prev) => Math.max(1, Math.round((prev - 0.25) * 100) / 100));
      if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [galleryOpen, galleryItems.length]);

  useEffect(() => {
    if (!galleryOpen) return;
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [galleryOpen, galleryIndex]);

  const computeBaseFrame = () => {
    const viewer = viewerRef.current;
    const img = imgRef.current;
    if (!viewer || !img) return;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    if (!natW || !natH) return;
    const viewerRect = viewer.getBoundingClientRect();
    const containScale = Math.min(1, Math.min(viewerRect.width / natW, viewerRect.height / natH));
    const w = Math.max(1, natW * containScale);
    const h = Math.max(1, natH * containScale);
    setBaseFrame({ w, h });
  };

  useEffect(() => {
    if (!galleryOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [galleryOpen]);

  const canPanAtZoom = (z: number) => {
    if (!baseFrame.w || !baseFrame.h) return false;
    return z > 1;
  };

  const clampPan = (nextZoom: number, nextPan: { x: number; y: number }) => {
    const baseW = baseFrame.w;
    const baseH = baseFrame.h;
    if (!baseW || !baseH) return nextPan;
    const scaledW = baseW * Math.max(1, nextZoom);
    const scaledH = baseH * Math.max(1, nextZoom);
    const maxX = Math.max(0, (scaledW - baseW) / 2);
    const maxY = Math.max(0, (scaledH - baseH) / 2);
    const x = Math.min(maxX, Math.max(-maxX, nextPan.x));
    const y = Math.min(maxY, Math.max(-maxY, nextPan.y));
    return { x, y };
  };

  const setZoomSafe = (nextZoom: number) => {
    const z = Math.max(1, Math.min(4, nextZoom));
    setZoom(z);
    if (z <= 1) {
      setPan({ x: 0, y: 0 });
      return;
    }
    setPan((prev) => clampPan(z, prev));
  };

  const onWheelZoom = (e: React.WheelEvent) => {
    if (!galleryOpen) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setZoom((prev) => {
      const next = Math.max(1, Math.min(4, Math.round((prev + delta) * 100) / 100));
      if (next <= 1) setPan({ x: 0, y: 0 });
      else setPan((p) => clampPan(next, p));
      return next;
    });
  };

  const onPointerDownPan = (e: React.PointerEvent) => {
    pointerMapRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointerMapRef.current.size === 1) {
      pointerMovedRef.current = false;
      pointerDownPointRef.current = { x: e.clientX, y: e.clientY };
    }

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (pointerMapRef.current.size >= 2) {
      const points = Array.from(pointerMapRef.current.values());
      const p1 = points[0]!;
      const p2 = points[1]!;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy) || 1;
      pinchRef.current.active = true;
      pinchRef.current.startDist = dist;
      pinchRef.current.startZoom = zoom;
      pinchRef.current.startPan = { ...pan };
      pinchRef.current.startCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      dragRef.current.active = false;
      dragRef.current.pointerId = null;
      return;
    }

    if (!canPanAtZoom(zoom)) return;
    dragRef.current.active = true;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.baseX = pan.x;
    dragRef.current.baseY = pan.y;
  };

  const onPointerMovePan = (e: React.PointerEvent) => {
    if (!pointerMapRef.current.has(e.pointerId)) return;
    const origin = pointerDownPointRef.current;
    if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > 4) pointerMovedRef.current = true;
    pointerMapRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pinchRef.current.active && pointerMapRef.current.size >= 2) {
      const points = Array.from(pointerMapRef.current.values());
      const p1 = points[0]!;
      const p2 = points[1]!;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ratio = dist / Math.max(1, pinchRef.current.startDist);
      const nextZoom = Math.max(1, Math.min(4, Math.round((pinchRef.current.startZoom * ratio) * 100) / 100));
      const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const deltaCenter = { x: center.x - pinchRef.current.startCenter.x, y: center.y - pinchRef.current.startCenter.y };
      const nextPan = { x: pinchRef.current.startPan.x + deltaCenter.x, y: pinchRef.current.startPan.y + deltaCenter.y };
      setZoom(nextZoom);
      setPan(canPanAtZoom(nextZoom) ? clampPan(nextZoom, nextPan) : { x: 0, y: 0 });
      return;
    }

    if (!dragRef.current.active) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const nextPan = { x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy };
    setPan(clampPan(zoom, nextPan));
  };

  const onPointerUpPan = (e: React.PointerEvent) => {
    pointerMapRef.current.delete(e.pointerId);
    if (pointerMapRef.current.size < 2) {
      pinchRef.current.active = false;
    }
    if (dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
  };

  // Close only when the click really landed outside the picture. A geometric
  // test is required because pointer capture (used while panning) retargets the
  // click to the viewer, so the image is not always in the event's path.
  const onViewerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pointerMovedRef.current) {
      pointerMovedRef.current = false;
      return;
    }
    const frame = frameRef.current;
    if (frame) {
      const r = frame.getBoundingClientRect();
      const inside =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) return;
    }
    closeGallery();
  };

  const onDoubleClickZoom = () => {
    if (zoom <= 1) {
      setZoomSafe(2);
    } else {
      setZoomSafe(1);
    }
  };

  useEffect(() => {
    if (!galleryOpen) return;
    computeBaseFrame();
    const onResize = () => computeBaseFrame();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [galleryOpen, galleryIndex, galleryItems.length]);

  const shareUrl = typeof window !== 'undefined' && layout ? `${window.location.origin}/${locale}/off-plan/${layout.slug}` : '';
  const shareText = layout ? `${t.checkOutApartment}: ${layout.title}` : '';

  const handleShare = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}%20${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2000);
        });
        break;
      case 'native':
        if (navigator.share && layout) {
          navigator.share({ title: shareText, text: shareText, url: shareUrl });
        }
        break;
    }
    setShareOpen(false);
  };

  const similarIds = layout?.similarApartmentIds || [];
  const uniqueSimilarIds = Array.from(new Set(similarIds.filter(Boolean)));
  const similarRequestedIds = uniqueSimilarIds.slice(0, similarPage * similarLimit);
  const similarQuery = useQuery({
    queryKey: ["unit-layout-similar", layout?.id, similarRequestedIds],
    queryFn: async () => {
      const existing = layout?.similarApartments || [];
      const existingIds = new Set(existing.map((item) => item.id));
      const idsToFetch = similarRequestedIds.filter((unitId) => !existingIds.has(unitId));

      if (idsToFetch.length === 0) {
        return existing;
      }

      const results = await Promise.all(
        idsToFetch.map(async (unitId) => {
          try {
            const response = await api.get<UnitLayout>(endpoints.offPlan.detail(unitId));
            return response.data;
          } catch {
            return null;
          }
        })
      );
      const fetched = results.filter(Boolean) as UnitLayout[];
      const merged = [...existing, ...fetched];
      const byId = new Map<string, UnitLayout>();
      merged.forEach((item) => byId.set(item.id, item));
      return Array.from(byId.values());
    },
    enabled: similarRequestedIds.length > 0,
    placeholderData: keepPreviousData,
  });

  const similarLayouts = (similarQuery.data?.length ? similarQuery.data : layout?.similarApartments) || [];
  const filteredSimilarLayouts = similarLayouts.filter((item) => item.slug !== layout?.slug);
  const similarTotal = uniqueSimilarIds.filter((unitId) => unitId !== layout?.id).length;
  const similarTotalPages = Math.max(1, Math.ceil(similarTotal / similarLimit));
  const similarShown = Math.min(similarPage * similarLimit, similarTotal);
  const visibleSimilarLayouts = filteredSimilarLayouts.slice(0, similarShown);
  const isLoadingMoreSimilar = similarQuery.isFetching && filteredSimilarLayouts.length > 0;

  useEffect(() => {
    setSimilarPage(1);
  }, [layout?.id]);

  useEffect(() => {
    if (similarPage > similarTotalPages) setSimilarPage(similarTotalPages);
  }, [similarPage, similarTotalPages]);

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Navbar locale={locale} variant="solid" />
        <main className="main-wrapper">
          <PageContainer className="off-plan-page-container">
            <div />
          </PageContainer>
        </main>
        <CallbackForm allowedRoles={['Client']} />
        <HomeFooter locale={locale} />
        <div className="apt-loading-overlay" role="status" aria-live="polite" aria-busy="true">
          <div className="apt-spinner" />
        </div>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="page-wrapper">
        <Navbar locale={locale} variant="solid" />
        <main className="main-wrapper">
          <PageContainer className="off-plan-page-container">
            <div className="loading-state" style={{ padding: '64px 0', textAlign: 'center' }}>
              <p style={{ color: '#6d717a' }}>{t.apartmentNotFound}</p>
              <Link href={`/${locale}/off-plan`} style={{ color: '#3F4249', marginTop: 16, display: 'inline-block' }}>
                ← {t.backToListings}
              </Link>
            </div>
          </PageContainer>
        </main>
        <CallbackForm allowedRoles={['Client']} />
        <HomeFooter locale={locale} />
      </div>
    );
  }

  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <main className="main-wrapper">
        <PageContainer className="off-plan-page-container">
          <div className="apt-wrapper">
            {/* Breadcrumbs */}
            <nav className="apt-breadcrumbs">
              <Link href={`/${locale}`}>{t.main}</Link> <span className="apt-separator">/</span>
              <Link href={`/${locale}/off-plan?category=${layout.category?.slug || ''}`}>{layout.category?.title || t.offPlan}</Link> <span className="apt-separator">/</span>
              <span className="apt-crumb-active">N° {layout.number || layout.id.slice(-2)}</span>
            </nav>

            {/* Main Container */}
            <div className="apt-main-card">

              {/* Left Side: Blueprint Image Section */}
              <div className="apt-image-section">
                <div className="apt-blueprint-box">
                  <button
                    type="button"
                    className="apt-blueprint-trigger"
                    onClick={() => openGallery(0)}
                    disabled={galleryItems.length === 0}
                    aria-label="Open gallery"
                  >
                    {layout.mainImage ? (
                      <img
                        src={getAssetUrl(layout.mainImage.url)}
                        alt={layout.mainImage.alt || layout.title}
                        className="apt-plan-img"
                      />
                    ) : (
                      <div className="apt-plan-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f2eb', color: '#6d717a' }}>
                        {t.noImage}
                      </div>
                    )}
                    {galleryItems.length > 0 ? (
                      <span className="apt-blueprint-overlay" aria-hidden="true">
                        <span className="apt-blueprint-icon" aria-hidden="true">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </span>
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>

              {/* Right Side: Data and Details */}
              <div className="apt-details-section">
                <div className="apt-header">
                  <h1 className="apt-title">
                    {layout.unitTypeOption?.title ? `${layout.unitTypeOption.title} ${layout.title}` : layout.title}
                  </h1>

                  <div className="apt-badge-row">
                    {statusValue ? (
                      <div className="apt-badge apt-badge--status">
                        <span className="apt-badge__text">{formatStatus(statusValue)}</span>
                      </div>
                    ) : null}
                    {brochureDoc ? (
                      <a
                        href={brochureUrl}
                        className="apt-badge badge-btn"
                        download
                        onClick={(e) => {
                          e.preventDefault();
                          if (!brochureUrl) return;
                          const href = brochureUrl;
                          const rawUrl = String(brochureDoc?.url || '');
                          const nameFromUrl = ((((rawUrl.split('?')[0] ?? '').split('#')[0] ?? '').split('/').pop() ?? '') || '');
                          const filename = nameFromUrl || `${layout.slug || 'brochure'}.pdf`;
                          downloadAsset(href, filename);
                        }}
                      >
                        <span className="apt-badge__text">PDF</span>
                      </a>
                    ) : null}
                    <div className="apt-share-container" ref={shareRef}>
                      <button type="button" className="apt-share-btn" aria-label={t.share} onClick={() => setShareOpen((prev) => !prev)} aria-haspopup="listbox" aria-expanded={shareOpen}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                      </button>
                      {shareOpen && (
                        <div className="apt-share-dropdown" role="listbox">
                          <button type="button" className="apt-share-option" role="option" onClick={() => handleShare('whatsapp')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            <span>WhatsApp</span>
                          </button>
                          <button type="button" className="apt-share-option" role="option" onClick={() => handleShare('facebook')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            <span>Facebook</span>
                          </button>
                          <button type="button" className="apt-share-option" role="option" onClick={() => handleShare('twitter')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            <span>X</span>
                          </button>
                          <button type="button" className="apt-share-option" role="option" onClick={() => handleShare('telegram')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                            <span>Telegram</span>
                          </button>
                          <button type="button" className="apt-share-option" role="option" onClick={() => handleShare('copy')}>
                            {shareCopied ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                            )}
                            <span>{shareCopied ? t.copied : t.copyLink}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="apt-specs-list">
                  <div className="apt-spec-item">
                    <span className="apt-label">{t.floor}</span>
                    <span className="apt-value">{layout.floor}</span>
                  </div>
                  <div className="apt-spec-item">
                    <span className="apt-label">{t.totalArea}</span>
                    <span className="apt-value">{layout.totalArea} m²</span>
                  </div>
                  <div className="apt-spec-item">
                    <span className="apt-label">{t.internalArea}</span>
                    <span className="apt-value">{layout.internalArea} m²</span>
                  </div>
                  {layout.balconyArea && (
                    <div className="apt-spec-item">
                      <span className="apt-label">{t.balcony}</span>
                      <span className="apt-value">{layout.balconyArea} m²</span>
                    </div>
                  )}
                </div>

                <div className="apt-footer">
                  <div className="apt-currency-wrapper" ref={currencyRef}>
                    <button
                      type="button"
                      onClick={() => setCurrencyOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={currencyOpen}
                      className="apt-currency-select"
                    >
                      <span className="apt-currency-text">{currency}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {currencyOpen && (
                      <div className="apt-currency-dropdown" role="listbox">
                        {currencies.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            role="option"
                            aria-selected={currency === c.value}
                            className={`apt-currency-option ${currency === c.value ? 'apt-currency-option--active' : ''}`}
                            onClick={() => { setCurrency(c.value); setCurrencyOpen(false); }}
                          >
                            {c.value}
                          </button>
                        ))}
                        {currencies.length === 0 && ['USD', 'AZN'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            role="option"
                            aria-selected={currency === c}
                            className={`apt-currency-option ${currency === c ? 'apt-currency-option--active' : ''}`}
                            onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="apt-price">
                    {formatNumber(layout.prices?.[currency] || 0)}
                  </div>
                </div>

              </div>
            </div>

            {galleryOpen && galleryItems.length > 0 ? (
              <div className="apt-lightbox" role="dialog" aria-modal="true">
                <button type="button" className="apt-lightbox__backdrop" onClick={closeGallery} aria-label="Close gallery" />
                <div className="apt-lightbox__panel" onClick={closeGallery}>
                  <button
                    type="button"
                    className="apt-lightbox__close"
                    onClick={(e) => { e.stopPropagation(); closeGallery(); }}
                    aria-label="Close gallery"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="apt-lightbox__zoom apt-lightbox__zoom--in"
                    onClick={(e) => { e.stopPropagation(); setZoomSafe(zoom + 0.25); }}
                    aria-label="Zoom in"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="apt-lightbox__zoom apt-lightbox__zoom--out"
                    onClick={(e) => { e.stopPropagation(); setZoomSafe(zoom - 0.25); }}
                    aria-label="Zoom out"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </button>

                  {galleryItems.length > 1 ? (
                    <button
                      type="button"
                      className="apt-lightbox__nav apt-lightbox__nav--prev"
                      onClick={(e) => { e.stopPropagation(); goPrev(); }}
                      aria-label="Previous image"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                  ) : null}

                  <div
                    className={`apt-lightbox__viewer ${zoom > 1 ? 'apt-lightbox__viewer--zoomed' : ''}`}
                    ref={viewerRef}
                    onWheel={onWheelZoom}
                    onPointerDown={onPointerDownPan}
                    onPointerMove={onPointerMovePan}
                    onPointerUp={onPointerUpPan}
                    onPointerCancel={onPointerUpPan}
                    onDoubleClick={onDoubleClickZoom}
                    onClick={onViewerClick}
                    role="presentation"
                  >
                    <div
                      ref={frameRef}
                      className="apt-lightbox__frame"
                      style={{
                        width: baseFrame.w ? `${Math.round(baseFrame.w)}px` : undefined,
                        height: baseFrame.h ? `${Math.round(baseFrame.h)}px` : undefined,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      role="presentation"
                    >
                      <div className="apt-lightbox__pan" style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}>
                        <img
                          ref={imgRef}
                          className="apt-lightbox__image"
                          onLoad={computeBaseFrame}
                          src={getAssetUrl(galleryItems[galleryIndex]?.url)}
                          alt={galleryItems[galleryIndex]?.alt || layout.title}
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>

                  {galleryItems.length > 1 ? (
                    <button
                      type="button"
                      className="apt-lightbox__nav apt-lightbox__nav--next"
                      onClick={(e) => { e.stopPropagation(); goNext(); }}
                      aria-label="Next image"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ) : null}

                  {galleryItems.length > 1 ? (
                    <div className="apt-lightbox__thumbs" onClick={(e) => e.stopPropagation()}>
                      {galleryItems.map((img, idx) => (
                        <button
                          key={`${img.url}-${idx}`}
                          type="button"
                          className={`apt-lightbox__thumb ${idx === galleryIndex ? 'apt-lightbox__thumb--active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setGalleryIndex(idx); }}
                          aria-label={`Open image ${idx + 1}`}
                        >
                          <img src={getAssetUrl(img.url)} alt={img.alt || layout.title} />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <section className="panorama-section" aria-label={t.apartmentDetails}>
              <div
                className="panorama-banner"
                style={panoramaBannerUrl ? { backgroundImage: `url(${panoramaBannerUrl})` } : undefined}
              >
                <div className="panorama-overlay" />
                <div className="panorama-content">
                  <h2 className="panorama-title">{layout.category?.title || t.moreDetails}</h2>
                  <div className="panorama-button-group">
                    <a href={`tel:${panoramaPhone}`} className="panorama-btn">
                      <svg className="panorama-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{t.consultation}</span>
                    </a>
                    <a href={panoramaEmail ? `mailto:${panoramaEmail}` : `tel:${panoramaPhone}`} className="panorama-btn">
                      <svg className="panorama-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22 6 12 13 2 6" />
                      </svg>
                      <span>{t.complexInfo}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="panorama-info-table">
                {locationTitleValue ? (
                  <div className="panorama-row">
                    <span className="panorama-label">{locationLabel}</span>
                    <span className="panorama-value">{locationTitleValue}</span>
                  </div>
                ) : null}
                {realEstateTypeValue ? (
                  <div className="panorama-row">
                    <span className="panorama-label">{t.realEstateType}</span>
                    <span className="panorama-value">{realEstateTypeValue}</span>
                  </div>
                ) : null}
                <div className="panorama-row">
                  <span className="panorama-label">{t.completionYear}</span>
                  <span className="panorama-value">{layout.completionYear}</span>
                </div>
                <div className="panorama-row">
                  <span className="panorama-label">{t.numberOfFloors}</span>
                  <span className="panorama-value">
                    {layout.numberOfFloors?.start && layout.numberOfFloors?.end && layout.numberOfFloors.end !== layout.numberOfFloors.start
                      ? `${layout.numberOfFloors.start} - ${layout.numberOfFloors.end}`
                      : `${layout.numberOfFloors?.start ?? layout.numberOfFloors?.end ?? ''}`}
                  </span>
                </div>
              </div>
            </section>

            {(similarIds.length > 0 || (layout.similarApartments?.length ?? 0) > 0) && (
              <section className="similar-section" aria-label={`${t.similarApartmentsThin} ${t.similarApartmentsBold}`}>
                <div className="similar-header">
                  <h2 className="similar-title">
                    <span className="similar-title-thin">{t.similarApartmentsThin}</span>
                    <span className="similar-title-bold">{t.similarApartmentsBold}</span>
                  </h2>
                </div>

                {similarQuery.isLoading && filteredSimilarLayouts.length === 0 ? (
                  <div style={{ padding: "24px 0", color: "#6d717a" }}>{t.loading}</div>
                ) : filteredSimilarLayouts.length === 0 ? (
                  <div style={{ padding: "24px 0", color: "#6d717a" }}>{t.noSimilarApartments}</div>
                ) : (
                  <>
                    <div className="similar-grid">
                      {visibleSimilarLayouts.map((item) => (
                        <Link key={item.id} href={`/${locale}/off-plan/${item.slug}`} className="layout-card">
                          <div className="layout-card__header">
                            <div className="layout-card__title-block">
                              <span className="layout-card__code">{item.title || item.name}</span>
                              <span className="layout-card__floor">{formatFloorRange(item)} {t.floorSuffix}</span>
                            </div>
                            <div className="layout-card__number-block">
                              <span className="layout-card__number">{formatRooms(item.number)}</span>
                              <span className="layout-card__status">{formatStatus(item.statusOption?.value || "")}</span>
                            </div>
                          </div>

                          <div className="layout-card__visual">
                            {item.coverImage || item.mainImage ? (
                              <img
                                src={getAssetUrl((item.coverImage || item.mainImage)!.url)}
                                alt={(item.coverImage || item.mainImage)!.alt || item.title}
                                className="layout-card__blueprint"
                              />
                            ) : (
                              <div className="layout-card__blueprint layout-card__blueprint--placeholder">
                                <span>{t.noImage}</span>
                              </div>
                            )}
                          </div>

                          <div className="layout-card__footer">
                            <div className="layout-card__meta">
                              {item.unitTypeOption?.title ? <span>{item.unitTypeOption.title}</span> : null}
                              {item.unitTypeOption?.title ? <span className="layout-card__meta-sep">•</span> : null}
                              <span>{item.totalArea} m²</span>
                            </div>
                            {typeof item.prices?.[currency] === "number" && item.prices[currency] > 0 && (
                              <span className="layout-card__price">
                                {currency} {formatNumber(item.prices[currency])}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>

                    {similarTotalPages > 1 && (
                      <div className="pagination-mobile">
                        <span className="pagination-shown">
                          {t.shown} {similarShown} {t.outOf} {similarTotal}
                        </span>
                        <div className="pagination-progress">
                          <div
                            className="pagination-progress__fill"
                            style={{ width: `${(similarShown / similarTotal) * 100}%` }}
                          />
                        </div>
                        {similarShown < similarTotal && (
                          <button
                            type="button"
                            className="pagination-show-more"
                            disabled={isLoadingMoreSimilar}
                            onClick={() => setSimilarPage(Math.min(similarPage + 1, similarTotalPages))}
                          >
                            {isLoadingMoreSimilar ? (
                              <>
                                <span className="pagination-show-more__spinner" aria-hidden="true" />
                                {t.loading}
                              </>
                            ) : (
                              t.showMore
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        </PageContainer>
      </main>
      <CallbackForm allowedRoles={['Client']} />
      <HomeFooter locale={locale} />
    </div>
  );
}
