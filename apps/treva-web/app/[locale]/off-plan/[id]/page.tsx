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
      available: 'Available',
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
          <PageContainer>
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
          <PageContainer>
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
        <PageContainer>
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
                </div>
              </div>

              {/* Right Side: Data and Details */}
              <div className="apt-details-section">
                <div className="apt-header">
                  <h1 className="apt-title">
                    {layout.title}
                  </h1>

                  <div className="apt-badge-row">
                    <span className={`apt-badge ${statusClass(layout.statusOption?.value || '')}`}>
                      <span className="apt-badge__text">{formatStatus(layout.statusOption?.value || '')}</span>
                    </span>
                    {layout.documents && layout.documents.length > 0 && layout.documents[0] && (
                      <a href={getAssetUrl(layout.documents[0].url)} target="_blank" rel="noopener noreferrer" className="apt-badge badge-btn">
                        <span className="apt-badge__text">PDF</span>
                      </a>
                    )}
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

            <section className="panorama-section" aria-label={t.apartmentDetails}>
              <div className="panorama-banner">
                <div className="panorama-overlay" />
                <div className="panorama-content">
                  <h2 className="panorama-title">{layout.category?.title || t.moreDetails}</h2>
                  <div className="panorama-button-group">
                    <a href="tel:+994502772662" className="panorama-btn">
                      <svg className="panorama-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{t.consultation}</span>
                    </a>
                    <a href="tel:+994502772662" className="panorama-btn">
                      <svg className="panorama-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                        <line x1="9" y1="22" x2="9" y2="16" />
                        <line x1="15" y1="22" x2="15" y2="16" />
                        <line x1="9" y1="16" x2="15" y2="16" />
                        <path d="M9 6h.01" />
                        <path d="M15 6h.01" />
                        <path d="M9 10h.01" />
                        <path d="M15 10h.01" />
                      </svg>
                      <span>{t.complexInfo}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="panorama-info-table">
                {layout.location && (
                  <div className="panorama-row">
                    <span className="panorama-label">{t.location}</span>
                    <span className="panorama-value">{layout.location.title}</span>
                  </div>
                )}
                {layout.location && (
                  <div className="panorama-row">
                    <span className="panorama-label">{t.realEstateType}</span>
                    <span className="panorama-value">{layout.location.type}</span>
                  </div>
                )}
                <div className="panorama-row">
                  <span className="panorama-label">{t.completionYear}</span>
                  <span className="panorama-value">{layout.completionYear}</span>
                </div>
                <div className="panorama-row">
                  <span className="panorama-label">{t.numberOfFloors}</span>
                  <span className="panorama-value">{layout.numberOfFloors?.start} - {layout.numberOfFloors?.end} {t.floorsRange}</span>
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
                              <span className="layout-card__code">{item.name || item.title}</span>
                              <span className="layout-card__floor">{item.floor} {t.floorSuffix}</span>
                            </div>
                            <div className="layout-card__number-block">
                              <span className="layout-card__number">N° {item.number || item.id.slice(-2)}</span>
                              <span className="layout-card__status">{formatStatus(item.statusOption?.value || "")}</span>
                            </div>
                          </div>

                          <div className="layout-card__visual">
                            {item.mainImage ? (
                              <img
                                src={getAssetUrl(item.mainImage.url)}
                                alt={item.mainImage.alt || item.title}
                                className="layout-card__blueprint"
                              />
                            ) : (
                              <div className="layout-card__blueprint layout-card__blueprint--placeholder">
                                <span>{t.noImage}</span>
                              </div>
                            )}
                          </div>

                          <div className="layout-card__footer">
                            <h3 className="layout-card__name">
                              {item.title}, {item.totalArea} m²
                            </h3>
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
