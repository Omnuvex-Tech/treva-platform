'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IoMdClose } from 'react-icons/io';
import Navbar from '@/app/components/HomeV2/V2Nav';
import { HomeFooter } from '@/app/components/HomeV2/V2Footer';
import CallbackV2 from "@/app/components/HomeV2/V2Callback";
import PageContainer from '@/app/components/Container/PageContainer';
import PropertyInfoCards from './PropertyInfoCards';
import RequestViewingCard from './RequestViewingCard';
import { useResaleApartmentBySlug } from '@/hooks/use-resale-apartments';
import { isSaved as isSavedProp, addSaved, removeSaved } from '@/lib/saved-properties';
import { isCompared as isComparedProp, addCompared, removeCompared } from '@/lib/compare-properties';
import './resale-detail.css';

async function copyToClipboard(text: string): Promise<boolean> {
  // navigator.clipboard yalnız secure context-də (https və ya localhost) mövcuddur.
  // Şəbəkə IP-si üzərindən açılan http səhifədə undefined olur və köhnə kod
  // orada səssizcə TypeError atırdı.
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // İcazə verilmədi — aşağıdakı fallback-ə keçirik.
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function toGoogleMapsEmbed(url: string): string {
  if (!url) return '';

  if (url.includes('/maps/embed')) return url;
  if (url.includes('/maps/embed/v1')) return url;

  const placeMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)/);
  if (placeMatch) {
    const [, lat, lng, zoom] = placeMatch;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${Math.round(Number(zoom))}&output=embed`;
  }

  const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    const [, lat, lng] = llMatch;
    const zoomMatch = url.match(/[?&]z=(\d+)/);
    const zoom = zoomMatch ? zoomMatch[1] : '15';
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }

  const qMatch = url.match(/[?&]q=([^&]+)/);
  if (qMatch) {
    const query = decodeURIComponent(qMatch[1]!);
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  const placeNameMatch = url.match(/\/maps\/place\/([^/@]+)/);
  if (placeNameMatch) {
    const placeName = decodeURIComponent(placeNameMatch[1]!.replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

/** Detal səhifəsində valyuta seçimi yoxdur — qiymət manatla göstərilir. */
const DEFAULT_CURRENCY = 'AZN';

/**
 * Yüklənmə və "tapılmadı" mətnləri.
 *
 * Səhifə lüğəti (`pageDictionary`) apartment gəldikdən sonra qurulur, bu iki
 * hal isə ondan əvvəl render olunur — ona görə modul səviyyəsindədir.
 */
const statusDictionary = {
  az: { loading: 'Yüklənir...', notFound: 'Mənzil tapılmadı' },
  en: { loading: 'Loading...', notFound: 'Apartment not found' },
  ru: { loading: 'Загрузка...', notFound: 'Квартира не найдена' },
} as const;

export default function ResaleDetailPage() {
  const params = useParams();
  const slug = params?.id as string;
  const locale = (params?.locale as string) || 'az';

  const st = statusDictionary[(locale as 'az' | 'en' | 'ru')] || statusDictionary.az;

  const { data: apartment, isLoading, error } = useResaleApartmentBySlug(slug);

  const [showPhone, setShowPhone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
        setCopied(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (apartment) {
      setIsSaved(isSavedProp(apartment.id));
      setIsCompared(isComparedProp(apartment.id));
    }
  }, [apartment]);

  const gallery: string[] = apartment?.gallery?.length
    ? apartment.gallery.map((g: any) => g.url || g)
    : apartment?.image
      ? [apartment.image]
      : [];

  const openGallery = (index: number) => {
    setLightboxIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const showPrevImage = () => {
    if (gallery.length === 0) return;
    setLightboxIndex((current) => (current - 1 + gallery.length) % gallery.length);
  };

  const showNextImage = () => {
    if (gallery.length === 0) return;
    setLightboxIndex((current) => (current + 1) % gallery.length);
  };

  const showPrevMainImage = () => {
    if (gallery.length === 0) return;
    setActiveThumb((current) => (current - 1 + gallery.length) % gallery.length);
  };

  const showNextMainImage = () => {
    if (gallery.length === 0) return;
    setActiveThumb((current) => (current + 1) % gallery.length);
  };

  useEffect(() => {
    if (!isGalleryOpen || typeof document === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeGallery();
      }

      if (event.key === 'ArrowLeft') {
        showPrevImage();
      }

      if (event.key === 'ArrowRight') {
        showNextImage();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGalleryOpen, gallery.length]);

  const toggleSaveProp = () => {
    if (!apartment) return;
    const formatFloorLabel = (floorFrom: number | null | undefined, floorTo: number | null | undefined) => {
      const from = floorFrom ?? 0;
      const to = floorTo ?? null;
      if (!to || to === from) return String(from);
      return `${from}/${to}`;
    };
    if (isSavedProp(apartment.id)) {
      removeSaved(apartment.id);
      setIsSaved(false);
    } else {
      addSaved({
        id: apartment.id,
        slug: apartment.slug,
        type: 'resale',
        image: apartment.image || (typeof apartment.gallery?.[0] === 'string' ? apartment.gallery[0] : apartment.gallery?.[0]?.url) || '',
        price: apartment.prices?.[0]?.priceTotal ?? apartment.priceTotal ?? 0,
        priceByArea: apartment.prices?.[0]?.priceByArea ?? apartment.priceByArea ?? 0,
        currency: apartment.prices?.[0]?.currency?.value ?? 'AZN',
        rooms: String(apartment.roomCount ?? ''),
        area: String(apartment.area ?? ''),
        floor: formatFloorLabel(apartment.floorFrom, apartment.floorTo),
        location: apartment.locationTitle || '',
        title: apartment.title || '',
        apartmentTypeSlug: apartment.apartmentType?.slug,
        apartmentTypeTitle: apartment.apartmentType?.title,
      });
      setIsSaved(true);
    }
  };

  const toggleCompareProp = () => {
    if (!apartment) return;
    const formatFloorLabel = (floorFrom: number | null | undefined, floorTo: number | null | undefined) => {
      const from = floorFrom ?? 0;
      const to = floorTo ?? null;
      if (!to || to === from) return String(from);
      return `${from}/${to}`;
    };
    if (isComparedProp(apartment.id)) {
      removeCompared(apartment.id);
      setIsCompared(false);
    } else {
      addCompared({
        id: apartment.id,
        slug: apartment.slug,
        type: 'resale',
        image: apartment.image || (typeof apartment.gallery?.[0] === 'string' ? apartment.gallery[0] : apartment.gallery?.[0]?.url) || '',
        price: apartment.prices?.[0]?.priceTotal ?? apartment.priceTotal ?? 0,
        currency: apartment.prices?.[0]?.currency?.value ?? 'AZN',
        rooms: String(apartment.roomCount ?? ''),
        area: String(apartment.area ?? ''),
        floor: formatFloorLabel(apartment.floorFrom, apartment.floorTo),
        project: apartment.locationTitle || '',
        title: apartment.title || '',
      });
      setIsCompared(true);
    }
  };

  if (isLoading) {
    return (
      <div className="pdet-page-wrapper">
        <Navbar locale={locale} variant="solid" />
        <main className="pdet-main-wrapper">
          <PageContainer className="pdet-page-container">
            <div className="py-16 text-center text-white/50">{st.loading}</div>
          </PageContainer>
        </main>
        <CallbackV2 locale={locale} />
        <HomeFooter locale={locale} />
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="pdet-page-wrapper">
        <Navbar locale={locale} variant="solid" />
        <main className="pdet-main-wrapper">
          <PageContainer className="pdet-page-container">
            <div className="py-16 text-center text-white/50">{st.notFound}</div>
          </PageContainer>
        </main>
        <CallbackV2 locale={locale} />
        <HomeFooter locale={locale} />
      </div>
    );
  }

  const mainImage = gallery[activeThumb] || gallery[0];
  const extraCount = Math.max(0, gallery.length - 5);
  const formatPrice = (p: number) => p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /**
   * Mənzilin qiyməti bir neçə valyutada saxlanıla bilər. Siyahı səhifəsində
   * valyutanı filtr seçir, detal səhifəsində isə belə seçim yoxdur — əvvəl
   * sadəcə `prices[0]` götürülürdü və məsələn EUR birinci sırada olanda
   * azərbaycanlı istifadəçiyə qiymət avro ilə görünürdü. İndi AZN varsa o
   * seçilir, yoxdursa ilk mövcud valyutaya keçilir.
   */
  const selectedPrice =
    apartment.prices?.find(p => p.currency?.value === DEFAULT_CURRENCY) ??
    apartment.prices?.[0];

  const getPrice = (type: 'total' | 'byArea') => {
    if (selectedPrice) {
      return type === 'total' ? (selectedPrice.priceTotal ?? 0) : (selectedPrice.priceByArea ?? 0);
    }
    return type === 'total' ? apartment.priceTotal : apartment.priceByArea;
  };

  // Qiymət və valyuta eyni sətirdən götürülür — ayrı-ayrı seçilsəydi rəqəm bir
  // valyutadan, işarə başqasından gələ bilərdi.
  const getCurrencyValue = () => selectedPrice?.currency?.value ?? DEFAULT_CURRENCY;

  const floorLabel = (() => {
    const from = apartment.floorFrom ?? 0;
    const to = apartment.floorTo ?? null;
    if (!to || to === from) return String(from);
    return `${from}/${to}`;
  })();

  /**
   * Səhifə mətnləri. Səhifənin əsas başlığı da daxil olmaqla bunlar sabit
   * ingiliscə idi — azərbaycanca və rusca versiyalarda da ingilis görünürdü.
   */
  const pageDictionary = {
    az: {
      loading: 'Yüklənir...',
      main: 'Ana səhifə',
      resale: 'Təkrar satış',
      share: 'Paylaş',
      copied: 'Kopyalandı!',
      copyLink: 'Linki kopyala',
      save: 'Yadda saxla',
      saved: 'Saxlanılıb',
      compare: 'Müqayisəyə əlavə et',
      compared: 'Müqayisədə',
      requestCall: 'Zəng sifariş et',
      titleTemplate: (rooms: number | string, area: number | string, floor: string) =>
        `${rooms} OTAQLI MƏNZİL, ${area} M², ${floor}-Cİ MƏRTƏBƏ`,
      shareIntro: 'Bu mənzilə baxın:',
      shareLocation: 'Ünvan:',
      owner: 'Mülkiyyətçi',
      viewPhone: 'Nömrəni göstər',
    },
    en: {
      loading: 'Loading...',
      main: 'Main',
      resale: 'Resale',
      share: 'Share',
      copied: 'Copied!',
      copyLink: 'Copy link',
      save: 'Save',
      saved: 'Saved',
      compare: 'Add to comparison',
      compared: 'In comparison',
      requestCall: 'Request a call',
      titleTemplate: (rooms: number | string, area: number | string, floor: string) =>
        `${rooms}-ROOM FLAT, ${area} M², ${floor} FLOOR`,
      shareIntro: 'Check out this apartment:',
      shareLocation: 'Location:',
      owner: 'Owner',
      viewPhone: 'View phone number',
    },
    ru: {
      loading: 'Загрузка...',
      main: 'Главная',
      resale: 'Вторичное жильё',
      share: 'Поделиться',
      copied: 'Скопировано!',
      copyLink: 'Копировать ссылку',
      save: 'Сохранить',
      saved: 'Сохранено',
      compare: 'Добавить к сравнению',
      compared: 'В сравнении',
      requestCall: 'Заказать звонок',
      titleTemplate: (rooms: number | string, area: number | string, floor: string) =>
        `${rooms}-КОМНАТНАЯ КВАРТИРА, ${area} М², ${floor} ЭТАЖ`,
      shareIntro: 'Посмотрите эту квартиру:',
      shareLocation: 'Адрес:',
      owner: 'Собственник',
      viewPhone: 'Показать номер',
    },
  } as const;
  const pt = pageDictionary[(locale as 'az' | 'en' | 'ru')] || pageDictionary.az;

  const title = pt.titleTemplate(apartment.roomCount, apartment.area, floorLabel);
  const galleryDictionary = {
    az: {
      viewAll: 'Bütün',
      images: 'şəkil',
      close: 'Bağla',
      closeGallery: 'Qalereyanı bağla',
      previousImage: 'Əvvəlki şəkil',
      nextImage: 'Növbəti şəkil',
      morePhotos: 'daha çox şəkil',
      image: 'Şəkil',
      thumbnail: 'Miniatür',
    },
    en: {
      viewAll: 'View all',
      images: 'images',
      close: 'Close',
      closeGallery: 'Close gallery',
      previousImage: 'Previous image',
      nextImage: 'Next image',
      morePhotos: 'more images',
      image: 'Image',
      thumbnail: 'Thumbnail',
    },
    ru: {
      viewAll: 'Все',
      images: 'изображения',
      close: 'Закрыть',
      closeGallery: 'Закрыть галерею',
      previousImage: 'Предыдущее изображение',
      nextImage: 'Следующее изображение',
      morePhotos: 'больше фото',
      image: 'Изображение',
      thumbnail: 'Миниатюра',
    },
  } as const;
  const gt = galleryDictionary[(locale as 'az' | 'en' | 'ru')] || galleryDictionary.az;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = title;
  const locationLink = apartment.locationUrl || '';
  const mapSource = apartment.locationGoogleMapsUrl || apartment.locationUrl || '';
  const mapEmbedUrl = mapSource ? toGoogleMapsEmbed(mapSource) : '';
  const shareText = `${pt.shareIntro} ${title} — ${formatPrice(getPrice('total'))} ${getCurrencyValue()}${locationLink ? `\n📍 ${pt.shareLocation} ${locationLink}` : ''}`;

  const handleShare = (platform: string) => {
    const url = shareUrl;
    const text = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${text}%20${encodedUrl}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${text}`, '_blank');
        break;
      case 'copy':
        // Dropdown açıq saxlanılır: "Kopyalandı!" yazısı yalnız onun içində
        // görünür, dərhal bağlansaydı istifadəçi heç bir təsdiq görməzdi.
        copyToClipboard(url).then((ok) => {
          if (!ok) return;
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            setShareOpen(false);
          }, 2000);
        });
        return;
      case 'native':
        if (navigator.share) {
          navigator.share({ title: shareTitle, text: shareText, url });
        }
        break;
    }
    setShareOpen(false);
  };

  return (
    <div className="pdet-page-wrapper" data-locale={locale}>
      {!isGalleryOpen && <Navbar locale={locale} variant="solid" />}
      <main className="pdet-main-wrapper">
        <PageContainer className="pdet-page-container">
          <nav className="pdet-breadcrumb">
            <Link href={`/${locale}`} className="pdet-breadcrumb-link">{pt.main}</Link>
            <span className="pdet-breadcrumb-sep">/</span>
            <Link href={`/${locale}/resale`} className="pdet-breadcrumb-link">{pt.resale}</Link>
            <span className="pdet-breadcrumb-sep">/</span>
            <span className="pdet-breadcrumb-current">N° {apartment.slug || apartment.id.slice(0, 6)}</span>
          </nav>

          <div className="pdet-container">
            <div className="pdet-main-grid">
              <div className="pdet-gallery-pane">
                <div
                  className="pdet-image-wrapper"
                  onClick={() => openGallery(activeThumb)}
                >
                  <img
                    src={mainImage}
                    alt={title}
                    className="pdet-main-img"
                  />
                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="pdet-main-image-nav pdet-main-image-nav--prev"
                        aria-label={gt.previousImage}
                        onClick={(event) => {
                          event.stopPropagation();
                          showPrevMainImage();
                        }}
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <button
                        type="button"
                        className="pdet-main-image-nav pdet-main-image-nav--next"
                        aria-label={gt.nextImage}
                        onClick={(event) => {
                          event.stopPropagation();
                          showNextMainImage();
                        }}
                      >
                        <ArrowRight size={18} />
                      </button>
                    </>
                  )}
                  <div className="pdet-gallery-badge">{gt.viewAll} {gallery.length} {gt.images}</div>
                  <div className="pdet-mobile-counter">{activeThumb + 1}/{gallery.length}</div>
                </div>

                <div className="pdet-thumbnails-grid">
                  {gallery.slice(0, 4).map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className={`pdet-thumb-box ${activeThumb === idx ? 'active' : ''}`}
                      onClick={() => setActiveThumb(idx)}
                    >
                      <img src={img} alt={`${gt.image} ${idx + 1}`} />
                    </div>
                  ))}
                  {gallery.length > 5 && (
                    <div
                      className="pdet-thumb-box pdet-thumb-overlay"
                      onClick={() => setActiveThumb(4)}
                    >
                      <img src={gallery[4]} alt={gt.morePhotos} />
                      <div className="pdet-overlay-text">+{extraCount} {gt.images}</div>
                    </div>
                  )}
                </div>

                <div className="pdet-content-footer pdet-content-footer--desktop">
                  <div className="pdet-desc-block">
                    <h1 className="pdet-main-title">{title}</h1>
                    <p className="pdet-address-line">{apartment.locationTitle || '—'}</p>
                  </div>

                  <div className="pdet-price-block">
                    <div className="pdet-price-tag">{formatPrice(getPrice('total'))} {getCurrencyValue()}</div>
                    <div className="pdet-sqm-badge">{formatPrice(getPrice('byArea'))} {getCurrencyValue()}/m²</div>
                  </div>
                </div>

                <div className="pdet-property-info-desktop">
                  <PropertyInfoCards
                    apartment={apartment}
                    mapEmbedUrl={mapEmbedUrl}
                    locationTitle={apartment.locationTitle || ''}
                    showViewingCard={false}
                    locale={locale}
                  />
                </div>
              </div>

              <div className="pdet-content-footer pdet-content-footer--mobile">
                <div className="pdet-desc-block">
                  <h1 className="pdet-main-title">{title}</h1>
                  <p className="pdet-address-line">{apartment.locationTitle || '—'}</p>
                </div>

                <div className="pdet-price-block">
                  <div className="pdet-price-tag">{formatPrice(getPrice('total'))} {getCurrencyValue()}</div>
                  <div className="pdet-sqm-badge">{formatPrice(getPrice('byArea'))} {getCurrencyValue()}/m²</div>
                </div>
              </div>

              <div className="pdet-sidebar-pane">
                <div className="pdet-action-widget" ref={shareRef}>
                  <div className="pdet-share-wrapper">
                    <button
                      type="button"
                      className="pdet-widget-btn"
                      onClick={() => setShareOpen((p) => !p)}
                    >
                      <img src="/images/resale/share.png" alt="" width="21" height="21" />
                      <span>{pt.share}</span>
                    </button>
                    {shareOpen && (
                      <div className="pdet-share-dropdown">
                        <a
                          className="pdet-share-option"
                          href={`https://wa.me/?text=${encodeURIComponent(shareText)}%20${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          <span>WhatsApp</span>
                        </a>
                        <a
                          className="pdet-share-option"
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          <span>Facebook</span>
                        </a>
                        <a
                          className="pdet-share-option"
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          <span>X</span>
                        </a>
                        <a
                          className="pdet-share-option"
                          href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                          <span>Telegram</span>
                        </a>
                        <button
                          type="button"
                          className="pdet-share-option"
                          onClick={() => handleShare('copy')}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          <span>{copied ? pt.copied : pt.copyLink}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="pdet-widget-divider"></div>
                  <button
                    type="button"
                    className={`pdet-widget-btn ${isSaved ? 'saved' : ''}`}
                    onClick={toggleSaveProp}
                  >
                    <img src="/images/resale/save.png" alt="" width="21" height="21" />
                    <span>{isSaved ? pt.saved : pt.save}</span>
                  </button>
                  <div className="pdet-widget-divider"></div>
                  <button
                    type="button"
                    className={`pdet-widget-btn ${isCompared ? 'saved' : ''}`}
                    onClick={toggleCompareProp}
                  >
                    <img src="/images/icons/compare.svg" alt="" width={21} height={21} />
                    <span>{isCompared ? pt.compared : pt.compare}</span>
                  </button>
                </div>

                <div className="pdet-agent-card">
                  <div className="pdet-agent-header">
                    <div className="pdet-agent-avatar">
                      <img src="/images/resale/person.png" alt="" width="48" height="48" />
                    </div>
                    <div className="pdet-agent-info">
                      <h3 className="pdet-agent-name">
                        {apartment.owner ? `${apartment.owner.firstName} ${apartment.owner.lastName}` : pt.owner}
                      </h3>
                      <span className="pdet-agent-role">{apartment.owner?.profession || pt.owner}</span>
                    </div>
                  </div>

                  <div className="pdet-agent-actions">
                    <button
                      type="button"
                      className="pdet-btn-primary"
                      onClick={() => setShowPhone(!showPhone)}
                    >
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{showPhone ? (apartment.owner?.phoneNumber || '—') : pt.viewPhone}</span>
                    </button>

                    <a
                      href={`tel:${apartment.owner?.phoneNumber || '+994502772662'}`}
                      className="pdet-btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {pt.requestCall}
                    </a>
                  </div>
                </div>

                <div className="pdet-viewing-card-desktop">
                  <RequestViewingCard className="pdet-sidebar-viewing-card" />
                </div>

                <div className="pdet-viewing-card-mobile">
                  <RequestViewingCard className="pdet-mobile-viewing-card" />
                </div>
              </div>
            </div>

            <div className="pdet-property-info-mobile">
              <PropertyInfoCards
                apartment={apartment}
                mapEmbedUrl={mapEmbedUrl}
                locationTitle={apartment.locationTitle || ''}
                showViewingCard={false}
                locale={locale}
              />
            </div>
          </div>
        </PageContainer>
      </main>
      {isGalleryOpen && (
        <div className="pdet-lightbox" onClick={closeGallery}>
          <div className="pdet-lightbox-dialog" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="pdet-lightbox-close"
              aria-label={gt.closeGallery}
              onClick={closeGallery}
            >
              <IoMdClose />
            </button>

            <div className="pdet-lightbox-counter">{lightboxIndex + 1} / {gallery.length}</div>

            <div className="pdet-lightbox-stage">
              {gallery.length > 1 && (
                <button
                  type="button"
                  className="pdet-lightbox-nav pdet-lightbox-nav--prev"
                  aria-label={gt.previousImage}
                  onClick={(event) => {
                    event.stopPropagation();
                    showPrevImage();
                  }}
                >
                  <ArrowLeft size={18} strokeWidth={2} />
                </button>
              )}

              <img
                src={gallery[lightboxIndex] || mainImage}
                alt={`${title} ${lightboxIndex + 1}`}
                className="pdet-lightbox-image"
              />

              {gallery.length > 1 && (
                <button
                  type="button"
                  className="pdet-lightbox-nav pdet-lightbox-nav--next"
                  aria-label={gt.nextImage}
                  onClick={(event) => {
                    event.stopPropagation();
                    showNextImage();
                  }}
                >
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="pdet-lightbox-thumbs">
                {gallery.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    className={`pdet-lightbox-thumb ${lightboxIndex === idx ? 'active' : ''}`}
                    aria-label={`${gt.image} ${idx + 1}`}
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img src={img} alt={`${gt.thumbnail} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <HomeFooter locale={locale} />
    </div>
  );
}
