'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import UnitCardV2 from '@/app/components/UnitCardV2';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/app/components/HomeV2/V2Nav';
import { HomeFooter } from '@/app/components/HomeV2/V2Footer';
import CallbackV2 from "@/app/components/HomeV2/V2Callback";
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
  // `ResaleListing` reads the filter query via useSearchParams, so it has to
  // sit under a Suspense boundary for the static shell to prerender.
  return (
    <Suspense fallback={null}>
      <ResaleListing />
    </Suspense>
  );
}

function ResaleListing() {
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
      shown: 'Göstərilib',
      outOf: '/',
      showMore: 'Daha çox göstər',
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
      shown: 'Shown',
      outOf: 'out of',
      showMore: 'Show more',
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
      shown: 'Показано',
      outOf: 'из',
      showMore: 'Показать еще',
    },
  } as const;
  const t = dictionary[locale] || dictionary.az;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [comparedItems, setComparedItems] = useState<string[]>([]);

  // The committed filter set and the page number both live in the URL query.
  // The fetch derives from it, so a backend request only goes out when the
  // query actually changes (see ResaleFilter — dropdown pick / input blur /
  // slider release). `page` climbs via "show more" and resets on any filter
  // change (ResaleFilter drops it).
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const filters = useMemo<ResaleFilterState>(() => {
    const num = (key: string): number | undefined => {
      const raw = searchParams.get(key);
      if (raw == null || raw === '') return undefined;
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    };
    const out: ResaleFilterState = { currency: searchParams.get('currency') || 'AZN' };
    const type = searchParams.get('type');
    if (type) out.apartmentTypeId = type;
    const city = searchParams.get('city');
    if (city) out.city = city;
    const region = searchParams.get('region');
    if (region) out.region = region;
    const purpose = searchParams.get('purpose');
    if (purpose === 'sale' || purpose === 'rent') out.purpose = purpose;
    if (searchParams.get('mortgage') != null) out.mortgage = searchParams.get('mortgage') === 'true';
    if (searchParams.get('extract') != null) out.extract = searchParams.get('extract') === 'true';
    const minPrice = num('minPrice');
    if (minPrice != null) out.minPrice = minPrice;
    const maxPrice = num('maxPrice');
    if (maxPrice != null) out.maxPrice = maxPrice;
    const minArea = num('minArea');
    if (minArea != null) out.minArea = minArea;
    const maxArea = num('maxArea');
    if (maxArea != null) out.maxArea = maxArea;
    const roomCount = num('roomCount');
    if (roomCount != null) out.roomCount = roomCount;
    // No `status` param means the default "active only" view; "all" clears it.
    const status = searchParams.get('status') ?? 'active';
    if (status && status !== 'all') out.status = status;
    return out;
  }, [searchParams]);

  const goToPage = (next: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(next));
    router.replace(`?${sp.toString()}`, { scroll: false });
  };

  // "Show more" grows a single cumulative request instead of stitching pages
  // together in component state. `page` lives in the URL, so a refresh or a
  // tab the browser discarded and reloaded re-fetches the whole window
  // (pages 1..N) in one call — the list is never left showing only the last
  // page's slice.
  const PAGE_SIZE = 12;
  const { data: response, isLoading, isFetching } = useResaleApartments({
    ...filters,
    page: 1,
    limit: page * PAGE_SIZE,
  });

  const apartments = response?.data ?? [];
  const pagination = response?.pagination;
  const hasMore = !!pagination && apartments.length < pagination.total;

  const isAppending = isFetching && page > 1;
  const showSpinner = (isLoading || isFetching) && !isAppending;

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
            <ResaleFilter totalCount={pagination?.total ?? 0} />
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

              {isLoading && apartments.length === 0 ? (
                <div className="re-spinner-overlay">
                  <div className="re-spinner-icon"></div>
                </div>
              ) : apartments.length === 0 && !showSpinner ? (
                <div className="re-empty-state">{t.noApartments}</div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {showSpinner && (
                    <div className="re-spinner-overlay">
                      <div className="re-spinner-icon"></div>
                    </div>
                  )}
                  <main className={`re-grid${!showSpinner ? ' re-grid--fadein' : ''}`} style={{ opacity: showSpinner ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: '300px' }}>
                    {apartments.map((apt) => (
                      <UnitCardV2
                        key={apt.id}
                        href={`/${locale}/resale/${apt.slug}`}
                        image={getAssetUrl(apt.image) || undefined}
                        alt={apt.locationTitle || apt.title}
                        price={`${formatPrice(getAptPrice(apt, 'total'))} ${getAptCurrencyValue(apt)}`}
                        developer={apt.locationTitle || undefined}
                        specs={[
                          getLocalizedApartmentTypeLabel(apt.apartmentType, locale),
                          `${apt.roomCount}-${t.room}`,
                          `${apt.area} m²`,
                          `${formatFloorLabel(apt.floorFrom, apt.floorTo)} ${t.floor}`,
                        ]}
                        saved={savedItems.includes(apt.id)}
                        compared={comparedItems.includes(apt.id)}
                        onSave={() => toggleSave(apt)}
                        onCompare={() => toggleCompare(apt)}
                        labels={{
                          save: t.saveListing,
                          saved: t.saveListing,
                          compare: t.compareListing,
                          compared: t.removeFromCompare,
                        }}
                      />
                    ))}
                  </main>
                </div>
              )}
            </div>

          {pagination && apartments.length > 0 && (
            <footer className="re-load-more">
              <span className="re-load-more__shown">
                {t.shown} {Math.min(apartments.length, pagination.total)} {t.outOf} {pagination.total}
              </span>
              <div className="re-load-more__progress">
                <div
                  className="re-load-more__progress-fill"
                  style={{ width: `${pagination.total ? (Math.min(apartments.length, pagination.total) / pagination.total) * 100 : 0}%` }}
                ></div>
              </div>
              {hasMore && (
                <button
                  type="button"
                  className="re-load-more__btn"
                  onClick={() => goToPage(page + 1)}
                  disabled={isAppending}
                >
                  {t.showMore}
                </button>
              )}
            </footer>
          )}
        </PageContainer>
      </main>
      <CallbackV2 locale={locale} />
      <HomeFooter locale={locale} />
    </div>
  );
}
