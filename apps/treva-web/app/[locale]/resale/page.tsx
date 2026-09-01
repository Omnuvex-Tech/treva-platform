'use client';

import React, { Suspense, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import CardImage from '@/app/components/CardImage';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import CallbackForm from '@/app/components/Home/Callback/CallbackForm';
import PageContainer from '@/app/components/Container/PageContainer';
import ResaleFilter, { ResaleFilterState } from './ResaleFilter';
import { useResaleApartments } from '@/hooks/use-resale-apartments';
import { getSaved, addSaved, removeSaved } from '@/lib/saved-properties';
import { getCompared, addCompared, removeCompared } from '@/lib/compare-properties';
import type { ResaleApartment } from '@/lib/resale.types';
import { getTrevaAssetUrl as getAssetUrl } from '@/lib/asset-url';
import './resale-listing.css';

function getLocalizedApartmentTypeLabel(
  apartmentType: { slug?: string; title?: string } | undefined,
  locale: 'az' | 'en' | 'ru'
) {
  const normalized = String(apartmentType?.slug || apartmentType?.title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const translations = {
    country_house: {
      az: 'Həyət evi/Bağ evi',
      en: 'Country House',
      ru: 'Отдельный дом',
    },
    detached_house: {
      az: 'Həyət evi/Bağ evi',
      en: 'Country House',
      ru: 'Отдельный дом',
    },
    new_constructed: {
      az: 'Yeni tikili',
      en: 'New Constructed',
      ru: 'Новостройка',
    },
    object: {
      az: 'Obyekt',
      en: 'Object',
      ru: 'Объект',
    },
    ofice: {
      az: 'Ofis',
      en: 'Office',
      ru: 'Офис',
    },
    old_constructed: {
      az: 'Köhnə tikili',
      en: 'Old Constructed',
      ru: 'Старый фонд',
    },
  } as const;

  return translations[normalized as keyof typeof translations]?.[locale] ?? apartmentType?.title ?? '';
}

export default function ResalePage() {
  const params = useParams();
  const locale = ((params?.locale as string) || 'az') as 'az' | 'en' | 'ru';
  const dictionary = {
    az: {
      pageTitle: 'BAKIDA TƏKRAR SATIŞ MƏNZİLLƏRİ',
      properties: 'elan',
      noApartments: 'Mənzil tapılmadı',
      saveListing: 'Elanı yadda saxla',
      compareListing: 'Müqayisəyə əlavə et',
      removeFromCompare: 'Müqayisədən çıxar',
      room: 'otaqlı',
      floor: 'mərtəbə',
      details: 'Mənzilə bax',
    },
    en: {
      pageTitle: 'PURCHASE APARTMENTS IN BAKU',
      properties: 'properties',
      noApartments: 'No apartments found',
      saveListing: 'Save listing',
      compareListing: 'Add to comparison',
      removeFromCompare: 'Remove from comparison',
      room: 'room',
      floor: 'floor',
      details: 'View Apartment Details',
    },
    ru: {
      pageTitle: 'КВАРТИРЫ НА ВТОРИЧНОМ РЫНКЕ В БАКУ',
      properties: 'объектов',
      noApartments: 'Квартиры не найдены',
      saveListing: 'Сохранить объявление',
      compareListing: 'Добавить к сравнению',
      removeFromCompare: 'Убрать из сравнения',
      room: 'комн.',
      floor: 'этаж',
      details: 'Смотреть квартиру',
    },
  } as const;
  const t = dictionary[locale] || dictionary.az;
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [comparedItems, setComparedItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ResaleFilterState>({});
  const [isDebouncing, setIsDebouncing] = useState(false);

  const { data: response, isLoading, isFetching } = useResaleApartments({
    ...filters,
    page,
    limit: 12,
  });

  const apartments = response?.data ?? [];
  const pagination = response?.pagination;
  const showSpinner = isLoading || isFetching || isDebouncing;

  useEffect(() => {
    setSavedItems(getSaved().filter(p => p.type === 'resale').map(p => p.id));
    setComparedItems(getCompared().filter(p => p.type === 'resale').map(p => p.id));
  }, []);

  const formatFloorLabel = (floorFrom: number | null | undefined, floorTo: number | null | undefined) => {
    const from = floorFrom ?? 0;
    const to = floorTo ?? null;
    if (!to || to === from) return String(from);
    return `${from}/${to}`;
  };

  const toggleSave = (apt: ResaleApartment) => {
    if (savedItems.includes(apt.id)) {
      removeSaved(apt.id);
      setSavedItems(prev => prev.filter(item => item !== apt.id));
    } else {
      addSaved({
        id: apt.id,
        slug: apt.slug,
        type: 'resale',
        image: apt.image || '',
        price: apt.prices?.[0]?.priceTotal ?? apt.priceTotal ?? 0,
        priceByArea: apt.prices?.[0]?.priceByArea ?? apt.priceByArea ?? 0,
        currency: apt.prices?.[0]?.currency?.value ?? 'AZN',
        rooms: String(apt.roomCount ?? ''),
        area: String(apt.area ?? ''),
        floor: formatFloorLabel(apt.floorFrom, apt.floorTo),
        location: apt.locationTitle || '',
        title: apt.title || '',
        apartmentTypeSlug: apt.apartmentType?.slug,
        apartmentTypeTitle: apt.apartmentType?.title,
      });
      setSavedItems(prev => [...prev, apt.id]);
    }
  };

  const toggleCompare = (apt: ResaleApartment) => {
    if (comparedItems.includes(apt.id)) {
      removeCompared(apt.id);
      setComparedItems(prev => prev.filter(item => item !== apt.id));
    } else {
      addCompared({
        id: apt.id,
        slug: apt.slug,
        type: 'resale',
        image: apt.image || '',
        price: apt.prices?.[0]?.priceTotal ?? apt.priceTotal ?? 0,
        currency: apt.prices?.[0]?.currency?.value ?? 'AZN',
        rooms: String(apt.roomCount ?? ''),
        area: String(apt.area ?? ''),
        floor: formatFloorLabel(apt.floorFrom, apt.floorTo),
        project: apt.locationTitle || '',
        title: apt.title || '',
      });
      setComparedItems(prev => [...prev, apt.id]);
    }
  };

  const handleFilterChange = useCallback((f: ResaleFilterState) => {
    setFilters(f);
    setPage(1);
  }, []);

  const formatPrice = (p: number) =>
    p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const getAptPrice = (apt: ResaleApartment, type: 'total' | 'byArea') => {
    const selectedCurrency = filters.currency;
    if (selectedCurrency && apt.prices?.length) {
      const match = apt.prices.find(p => p.currency?.value === selectedCurrency);
      if (match) return type === 'total' ? (match.priceTotal ?? 0) : (match.priceByArea ?? 0);
    }
    if (apt.prices?.length) {
      return type === 'total' ? (apt.prices[0]?.priceTotal ?? 0) : (apt.prices[0]?.priceByArea ?? 0);
    }
    return type === 'total' ? apt.priceTotal : apt.priceByArea;
  };

  const getAptCurrencyValue = (apt: ResaleApartment) => {
    const selectedCurrency = filters.currency;
    if (selectedCurrency && apt.prices?.length) {
      const match = apt.prices.find(p => p.currency?.value === selectedCurrency);
      if (match?.currency?.value) return match.currency.value;
    }
    if (apt.prices?.[0]?.currency?.value) return apt.prices[0].currency.value;
    return 'AZN';
  };

  return (
    <div className="re-page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <main className="re-main-wrapper">
        <PageContainer className="re-page-container">
          <Suspense fallback={null}>
            <ResaleFilter onFilterChange={handleFilterChange} totalCount={pagination?.total ?? 0} onDebouncingChange={setIsDebouncing} />
          </Suspense>

          <header className="re-header">
            <h1 className="re-main-title">{t.pageTitle}</h1>

            <div className="re-controls-row">
              <div className="re-property-count">{pagination?.total ?? 0} {t.properties}</div>
            </div>
          </header>

          <div style={{ position: 'relative', minHeight: '300px' }}>
              <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .re-spinner-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(255, 255, 255, 0.6); display: flex; justify-content: center;
                  align-items: center; z-index: 10; border-radius: 12px; }
                .re-spinner-icon { width: 40px; height: 40px; border: 4px solid #f3f3f3;
                  border-top: 4px solid #3F4249; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .re-grid--fadein { animation: fadeIn 0.35s ease-out; }
              `}</style>

              {isLoading ? (
                <div className="re-spinner-overlay">
                  <div className="re-spinner-icon"></div>
                </div>
              ) : apartments.length === 0 && !showSpinner ? (
                <div className="py-16 text-center text-white/50">{t.noApartments}</div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {showSpinner && (
                    <div className="re-spinner-overlay">
                      <div className="re-spinner-icon"></div>
                    </div>
                  )}
                  <main className={`re-grid${!showSpinner ? ' re-grid--fadein' : ''}`} style={{ opacity: showSpinner ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: '300px' }}>
                    {apartments.map((apt) => {
                      return (
                    <div key={apt.id} className="re-card-wrapper">
                      <article className="re-card">
                        <Link href={`/${locale}/resale/${apt.slug}`} className="re-card-media-link" aria-label={t.details}>
                          <div className="re-card-media">
                            {/* next/image so the card gets a card-sized WebP of the
                                CMS original, lazily. No photo means no photo. */}
                            {getAssetUrl(apt.image) ? (
                              <CardImage
                                src={getAssetUrl(apt.image)}
                                alt={apt.locationTitle || apt.title}
                                className="re-card-img"
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                              />
                            ) : null}
                          </div>
                        </Link>

                        <div className="re-card-body">
                          <div className="re-card-meta-row">
                            <span className="re-badge">{getLocalizedApartmentTypeLabel(apt.apartmentType, locale)}</span>
                            <div className="re-card-actions">
                              <button
                                type="button"
                                className={`re-compare-btn ${comparedItems.includes(apt.id) ? 'active' : ''}`}
                                onClick={() => toggleCompare(apt)}
                                aria-label={comparedItems.includes(apt.id) ? t.removeFromCompare : t.compareListing}
                              >
                                <img src="/images/icons/compare.svg" alt="" width={16} height={16} />
                              </button>
                              <button
                                type="button"
                                className={`re-bookmark-btn ${savedItems.includes(apt.id) ? 'active' : ''}`}
                                onClick={() => toggleSave(apt)}
                                aria-label={t.saveListing}
                              >
                                <img src="/images/icons/heart.svg" alt="" width={16} height={16} />
                              </button>
                            </div>
                          </div>

                          <div className="re-price-block">
                            <h2 className="re-main-price">{formatPrice(getAptPrice(apt, 'total'))} {getAptCurrencyValue(apt)}</h2>
                            <div className="re-sqm-price">{formatPrice(getAptPrice(apt, 'byArea'))} {getAptCurrencyValue(apt)}/m²</div>
                          </div>

                          <div className="re-tags-row">
                            <span className="re-tag">{apt.roomCount}-{t.room}</span>
                            <span className="re-tag">{apt.area} m²</span>
                            <span className="re-tag">{formatFloorLabel(apt.floorFrom, apt.floorTo)} {t.floor}</span>
                          </div>

                          <p className="re-address">{apt.locationTitle || '—'}</p>
                        </div>
                      </article>

                      <Link href={`/${locale}/resale/${apt.slug}`} className="re-action-btn">
                        {t.details}
                      </Link>
                    </div>
                      );
                    })}
                  </main>
                </div>
              )}
            </div>

          {pagination && pagination.totalPages > 1 && (
            <footer className="re-pagination">
              <div className="re-pagination-numbers">
                {page > 1 && (
                  <span className="re-page-num" onClick={() => setPage(page - 1)}>
                    &laquo;
                  </span>
                )}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    typeof p === 'string' ? (
                      <span key={`e-${idx}`} className="re-page-ellipsis">{p}</span>
                    ) : (
                      <span
                        key={p}
                        className={`re-page-num ${page === p ? 're-page-active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </span>
                    )
                  )}
                {page < pagination.totalPages && (
                  <span className="re-page-num" onClick={() => setPage(page + 1)}>
                    &raquo;
                  </span>
                )}
              </div>
            </footer>
          )}
        </PageContainer>
      </main>
      <CallbackForm allowedRoles={['Client']} />
      <HomeFooter locale={locale} />
    </div>
  );
}
