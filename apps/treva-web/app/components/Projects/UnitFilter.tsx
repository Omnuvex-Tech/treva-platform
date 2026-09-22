'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import UnitCardV2 from '@/app/components/UnitCardV2';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUnitLayouts, useUnitLayoutRange, useUnitLayoutFloors } from '@/hooks/use-unit-layouts';
import { useCurrencies } from '@/hooks/use-currencies';
import { getTrevaAssetUrl as getAssetUrl } from '@/lib/asset-url';
import type { UnitLayout } from '@/lib/unit-layout.types';
import { getSaved, addSaved, removeSaved } from '@/lib/saved-properties';
import { getCompared, addCompared, removeCompared } from '@/lib/compare-properties';
import './unit-filter.css';

// `id` is what goes into the `?rooms=` query and straight to the backend
// (`number` match, `0` = studio). `labelKey` (when set) is resolved against the
// locale dictionary so "Studiya" is translated; otherwise `label` is shown as-is.
const ROOM_COUNT_OPTIONS: Array<{ id: string; label: string; labelKey?: 'studio' }> = [
  { id: '0', label: 'Studio', labelKey: 'studio' },
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  // `4+` matches the home SearchPanelV2 deep-link value; backend accepts it (gte 4).
  { id: '4+', label: '4+' },
];

const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

type CategoryTitle = { az?: string; en?: string; ru?: string } | string;

function getCatTitle(title: CategoryTitle | undefined, loc: string): string {
  if (!title) return '';
  if (typeof title === 'string') return title;
  const t = title as Record<string, string | undefined>;
  return t[loc] || t.az || t.en || t.ru || '';
}

export default function UnitLayout() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = ((params?.locale as string) || 'az') as 'az' | 'en' | 'ru';

  // ── Committed filters live in the URL query. The list fetch below is derived
  //    from the query, so a backend request goes out only when the query
  //    actually changes — a dropdown pick, an input blur, or a slider release,
  //    never on every tick while a slider is being dragged.
  const selectedCategorySlug = searchParams.get('category') || '';
  const currency = searchParams.get('currency') || 'AZN';
  const floor = searchParams.get('floor') || '';
  const selectedStatus = searchParams.get('status') || '';
  const selectedRooms = searchParams.get('rooms') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const qNum = (key: string): number | null => {
    const raw = searchParams.get(key);
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };
  const urlPriceMin = qNum('priceMin') ?? 0;
  const urlPriceMax = qNum('priceMax');
  const urlAreaMin = qNum('areaMin') ?? 0;
  const urlAreaMax = qNum('areaMax');

  const commit = React.useCallback(
    (patch: Record<string, string | number | null | undefined>, keepPage = false) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === '' || value === null || value === undefined) sp.delete(key);
        else sp.set(key, String(value));
      }
      // Any filter change drops pagination back to the first page.
      if (!keepPage) sp.delete('page');
      const qs = sp.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    },
    [searchParams, router],
  );

  const dictionary = {
    az: {
      titleThin: 'Mənzil',
      titleBold: 'planları',
      project: 'Layihə',
      price: 'Qiymət',
      area: 'Sahə (m²)',
      from: 'min',
      to: 'max',
      floor: 'Mərtəbə',
      status: 'Status',
      rooms: 'Otaq sayı',
      noRooms: 'Otaq yoxdur',
      studio: 'Studiya',
      results: 'mənzil tapıldı',
      reset: 'Filtrləri sıfırla',
      bannerTitle: 'Daha Ətraflı Məlumat Alın',
      consultation: 'Konsultasiya alın',
      complexInfo: 'Yaşayış kompleksi haqqında daha çox',
      noResults: 'Filtrlərinizə uyğun mənzil tapılmadı.',
      noImage: 'Şəkil yoxdur',
      viewApartmentDetails: 'Mənzilə bax',
      shown: 'Göstərilib',
      outOf: '/',
      showMore: 'Daha çox göstər',
      all: 'Hamısı',
      available: 'Aktiv',
      sold: 'Satılıb',
      reserved: 'Bron edilib',
      floorSuffix: 'mərtəbə',
      saveListing: 'Seçilmişlərə əlavə et',
      removeFromSaved: 'Seçilmişlərdən sil',
      compareListing: 'Müqayisəyə əlavə et',
      removeFromCompare: 'Müqayisədən çıxar',
    },
    en: {
      titleThin: 'Unit',
      titleBold: 'layouts',
      project: 'Projects',
      price: 'Price',
      area: 'Area (m²)',
      from: 'from',
      to: 'to',
      floor: 'Floor',
      status: 'Status',
      rooms: 'Number of rooms',
      noRooms: 'No rooms',
      studio: 'Studio',
      results: 'apartments found',
      reset: 'Reset filters',
      bannerTitle: 'Get More Information',
      consultation: 'Get a Consultation',
      complexInfo: 'More About the Residential Complex',
      noResults: 'No apartments found matching your filters.',
      noImage: 'No image',
      viewApartmentDetails: 'View Apartment Details',
      shown: 'Shown',
      outOf: 'out of',
      showMore: 'Show more',
      all: 'All',
      available: 'Available',
      sold: 'Sold',
      reserved: 'Reserved',
      floorSuffix: 'floor',
      saveListing: 'Add to saved',
      removeFromSaved: 'Remove from saved',
      compareListing: 'Add to comparison',
      removeFromCompare: 'Remove from comparison',
    },
    ru: {
      titleThin: 'План',
      titleBold: 'ировки',
      project: 'Проекты',
      price: 'Цена',
      area: 'Площадь (м²)',
      from: 'от',
      to: 'до',
      floor: 'Этаж',
      status: 'Статус',
      rooms: 'Количество комнат',
      noRooms: 'Нет комнат',
      studio: 'Студия',
      results: 'квартир найдено',
      reset: 'Сбросить фильтры',
      bannerTitle: 'Получить больше информации',
      consultation: 'Получить консультацию',
      complexInfo: 'Подробнее о жилом комплексе',
      noResults: 'Квартиры по вашим фильтрам не найдены.',
      noImage: 'Нет изображения',
      viewApartmentDetails: 'Смотреть квартиру',
      shown: 'Показано',
      outOf: 'из',
      showMore: 'Показать еще',
      all: 'Все',
      available: 'Доступно',
      sold: 'Продано',
      reserved: 'Забронировано',
      floorSuffix: 'этаж',
      saveListing: 'Добавить в избранное',
      removeFromSaved: 'Удалить из избранного',
      compareListing: 'Добавить к сравнению',
      removeFromCompare: 'Убрать из сравнения',
    },
  } as const;

  const t = dictionary[locale] || dictionary.az;

  // Must mirror the values the inventory panel actually stores on a unit layout
  // (UNIT_LAYOUT_STATUS_BUTTONS): available / reserved / sold. The old filter
  // sent a `statusOptionId` from /status-options that unit layouts never carry,
  // so every pick returned nothing.
  const statusOptions = [
    { id: 'available', value: t.available },
    { id: 'reserved', value: t.reserved },
    { id: 'sold', value: t.sold },
  ];

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Draft values for the price/area controls. They track what the user is
  // currently typing / dragging; nothing is sent to the backend until a commit
  // event (blur or slider release) pushes them into the URL query.
  const [priceMin, setPriceMin] = useState<number | ''>(urlPriceMin);
  const [priceMax, setPriceMax] = useState<number | ''>(urlPriceMax ?? '');
  const [priceMinInput, setPriceMinInput] = useState<number | ''>(urlPriceMin);
  const [priceMaxInput, setPriceMaxInput] = useState<number | ''>(urlPriceMax ?? '');
  const totalPriceMin = 0;

  const [areaMin, setAreaMin] = useState<number | ''>(urlAreaMin);
  const [areaMax, setAreaMax] = useState<number | ''>(urlAreaMax ?? '');
  const [areaMinInput, setAreaMinInput] = useState<number | ''>(urlAreaMin);
  const [areaMaxInput, setAreaMaxInput] = useState<number | ''>(urlAreaMax ?? '');
  const totalAreaMin = 0;

  const limit = 12;

  const [categories, setCategories] = useState<Array<{ slug: string; title: string }>>([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [comparedItems, setComparedItems] = useState<string[]>([]);

  useEffect(() => {
    setSavedItems(getSaved().filter(p => p.type === 'off-plan').map(p => p.id));
    setComparedItems(getCompared().filter(p => p.type === 'off-plan').map(p => p.id));
  }, []);

  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData || [];

  const { data: floorsData } = useUnitLayoutFloors();
  const floors = floorsData || [];

  const { data: rangeData } = useUnitLayoutRange(currency);
  const totalPriceMax = rangeData?.maxPrice || 1500000;
  const totalAreaMax = rangeData?.maxTotalArea || 10000;

  // Snap the draft controls back to the committed query — on first load, after
  // Reset, and on browser back — and up to the API's real ceiling once the
  // range resolves. A slider drag never lands here because it doesn't touch the
  // URL until release.
  useEffect(() => {
    setPriceMin(urlPriceMin);
    setPriceMinInput(urlPriceMin);
    const pMax = urlPriceMax ?? rangeData?.maxPrice ?? '';
    setPriceMax(pMax);
    setPriceMaxInput(pMax);
    setAreaMin(urlAreaMin);
    setAreaMinInput(urlAreaMin);
    const aMax = urlAreaMax ?? rangeData?.maxTotalArea ?? '';
    setAreaMax(aMax);
    setAreaMaxInput(aMax);
  }, [urlPriceMin, urlPriceMax, urlAreaMin, urlAreaMax, rangeData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (floorRef.current && !floorRef.current.contains(e.target as Node)) setFloorOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Source the project list from the CMS (same as the homepage hero) so every
    // project shows up here, with a proper localized title and a clean slug
    // (e.g. "marina-village" instead of Profitbase's "sabah-towers-57259").
    // Projects that don't have a matching listing yet simply return an empty
    // result set from the API rather than being filtered out of the dropdown.
    fetch(`${CMS_API}/layihelerimiz/categories/visible`)
      .then((res) => res.json())
      .then((raw) => {
        const data = Array.isArray(raw) ? raw : raw.value || [];
        const next = data
          .map((cat: any) => {
            const rawTitle = cat.title;
            const titleObj = (rawTitle && typeof rawTitle === 'object') ? rawTitle : { az: rawTitle, en: rawTitle, ru: rawTitle };
            const slug = String(cat?.slug || '');
            return { slug, title: getCatTitle(titleObj, locale) || slug };
          })
          .filter((item: any) => item.slug);
        setCategories(next);
      })
      .catch(() => {});
  }, [locale]);

  // Everything the query needs is read straight from the URL, so `filters`
  // changes identity only when the committed query changes — that is the one
  // and only trigger for a backend request.
  const filters = useMemo(() => ({
    page,
    limit,
    // The API only filters on `archived` when it is asked to, so the listing
    // has to say so: archiving is how the panel takes a unit off the site
    // (parkings are archived wholesale), and without this they came back in
    // the results anyway.
    archived: false,
    currency,
    ...(selectedCategorySlug && { categorySlug: selectedCategorySlug }),
    ...(floor && { floor: parseInt(floor) }),
    ...(selectedStatus && { status: selectedStatus }),
    ...(selectedRooms && { rooms: selectedRooms }),
    ...(urlPriceMin > 0 && { minPrice: urlPriceMin }),
    ...(urlPriceMax != null && { maxPrice: urlPriceMax }),
    ...(urlAreaMin > 0 && { minArea: urlAreaMin }),
    ...(urlAreaMax != null && { maxArea: urlAreaMax }),
  }), [page, limit, currency, selectedCategorySlug, floor, selectedStatus, selectedRooms, urlPriceMin, urlPriceMax, urlAreaMin, urlAreaMax]);

  const { data: response, isLoading, isFetching } = useUnitLayouts(filters);

  // A fetch with page > 1 is always a "show more" append (every filter change
  // resets page to 1). Those must not dim or overlay the already-visible cards
  // — only the button gets a loading state.
  const isAppending = (isFetching || isLoading) && page > 1;
  const showSpinner = (isLoading || isFetching) && !isAppending;

  const pageLayouts = response?.data || [];
  const pagination = response?.pagination;
  const [layouts, setLayouts] = useState<UnitLayout[]>([]);

  useEffect(() => {
    if (!response?.data) return;

    if (page === 1) {
      setLayouts(pageLayouts);
      return;
    }

    setLayouts((prev) => {
      const merged = [...prev, ...pageLayouts];
      const byId = new Map<string, UnitLayout>();
      merged.forEach((item) => byId.set(item.id, item));
      return Array.from(byId.values());
    });
  }, [page, response?.data]);

  const safePriceMin = typeof priceMin === 'number' ? priceMin : 0;
  const safePriceMax = typeof priceMax === 'number' ? priceMax : totalPriceMax;
  const safeAreaMin = typeof areaMin === 'number' ? areaMin : 0;
  const safeAreaMax = typeof areaMax === 'number' ? areaMax : totalAreaMax;

  // Push the current price/area drafts into the URL query. Called on a slider
  // release or an input blur — never mid-drag. A bound sitting at the far end
  // of the range is written as "no limit" (param removed).
  const commitPriceRange = (min = safePriceMin, max = safePriceMax) => {
    commit({
      priceMin: min > 0 ? Math.round(min) : null,
      priceMax: max < totalPriceMax ? Math.round(max) : null,
    });
  };
  const commitAreaRange = (min = safeAreaMin, max = safeAreaMax) => {
    commit({
      areaMin: min > 0 ? Math.round(min * 100) / 100 : null,
      areaMax: max < totalAreaMax ? Math.round(max * 100) / 100 : null,
    });
  };

  const priceLeftPercent = ((safePriceMin - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;
  const priceRightPercent = 100 - ((safePriceMax - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;

  const areaLeftPercent = ((safeAreaMin - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;
  const areaRightPercent = 100 - ((safeAreaMax - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;

  const formatNumber = (num: number | '') => {
    if (num === '') return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatPrice = (prices: Record<string, number>, curr: string) => {
    const price = prices?.[curr] || 0;
    return `${curr} ${formatNumber(price)}`;
  };

  const formatFloor = (floorValue: string | number) => `${floorValue} ${t.floorSuffix}`;
  const formatFloorRange = (layout: UnitLayout) => {
    const start = (layout as any)?.numberOfFloors?.start;
    const end = (layout as any)?.numberOfFloors?.end;
    if (typeof start === 'number' && typeof end === 'number') {
      const label = start !== end ? `${start}-${end}` : `${start}`;
      return `${label} ${t.floorSuffix}`;
    }
    return `${layout.floor} ${t.floorSuffix}`;
  };

  const formatRooms = (rooms?: number) => {
    if (!rooms || rooms <= 0) return '';
    if (locale === 'ru') return `${rooms} комн.`;
    if (locale === 'en') return `${rooms} ${rooms === 1 ? 'room' : 'rooms'}`;
    return `${rooms} otaqlı`;
  };

  const handleReset = () => {
    // Clear the query (the draft-sync effect snaps the sliders back), and also
    // reset the drafts here so the thumbs move immediately.
    setPriceMin(0);
    setPriceMinInput(0);
    setPriceMax(rangeData?.maxPrice ?? '');
    setPriceMaxInput(rangeData?.maxPrice ?? '');
    setAreaMin(0);
    setAreaMinInput(0);
    setAreaMax(rangeData?.maxTotalArea ?? '');
    setAreaMaxInput(rangeData?.maxTotalArea ?? '');
    router.replace(window.location.pathname, { scroll: false });
  };

  const getCardCode = (layout: UnitLayout) => {
    return layout.title || layout.name;
  };

  const toggleSave = (layout: UnitLayout) => {
    if (savedItems.includes(layout.id)) {
      removeSaved(layout.id);
      setSavedItems(prev => prev.filter(id => id !== layout.id));
    } else {
      addSaved({
        id: layout.id,
        slug: layout.slug,
        type: 'off-plan',
        image: (layout.coverImage || layout.mainImage)?.url ? getAssetUrl((layout.coverImage || layout.mainImage)!.url) : '',
        price: layout.prices?.[currency] || 0,
        currency,
        rooms: String(layout.number ?? ''),
        area: String(layout.totalArea ?? ''),
        floor: formatFloorRange(layout),
        building: layout.entrance,
        location: layout.category?.title || '',
        project: layout.category?.title || '',
        title: getCardCode(layout),
      });
      setSavedItems(prev => [...prev, layout.id]);
    }
  };

  const toggleCompare = (layout: UnitLayout) => {
    if (comparedItems.includes(layout.id)) {
      removeCompared(layout.id);
      setComparedItems(prev => prev.filter(id => id !== layout.id));
    } else {
      addCompared({
        id: layout.id,
        slug: layout.slug,
        type: 'off-plan',
        image: (layout.coverImage || layout.mainImage)?.url ? getAssetUrl((layout.coverImage || layout.mainImage)!.url) : '',
        price: layout.prices?.[currency] || 0,
        currency,
        rooms: String(layout.number ?? ''),
        area: String(layout.totalArea ?? ''),
        floor: formatFloorRange(layout),
        building: layout.entrance,
        project: layout.category?.title || '',
        title: getCardCode(layout),
      });
      setComparedItems(prev => [...prev, layout.id]);
    }
  };

  return (
    <section className="layout-section">
        
        {/* HEADER */}
        <div className="layout-header">
          <h2 className="layout-title">
            <span className="layout-title-thin">{t.titleThin}</span>
            <span className="layout-title-bold">{t.titleBold}</span>
            <span className="layout-count">({pagination?.total || 0})</span>
          </h2>
        </div>

        {/* FILTERS CONTAINER */}
        <div className="filters-grid">

          <div className="filter-group filter-group--project">
            <label className="filter-label">{t.project}</label>
            <div className="custom-select" ref={categoryRef}>
              <button type="button" className="custom-select__trigger" aria-expanded={categoryOpen} onClick={() => setCategoryOpen((p) => !p)}>
                <span>{selectedCategorySlug ? (categories.find((c) => c.slug === selectedCategorySlug)?.title || selectedCategorySlug) : t.all}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {categoryOpen && (
                <div className="custom-select__dropdown">
                  <button type="button" className={`custom-select__option ${!selectedCategorySlug ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ category: null }); setCategoryOpen(false); }}>
                    {t.all}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      className={`custom-select__option ${selectedCategorySlug === cat.slug ? 'custom-select__option--active' : ''}`}
                      onClick={() => { commit({ category: cat.slug }); setCategoryOpen(false); }}
                    >
                      {cat.title || cat.slug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Price Filter */}
          <div className="filter-group filter-group--price">
            <label className="filter-label">{t.price}</label>
            <div className="filter-inputs-wrapper">
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>{t.from}</span>
                  <input
                    type="text"
                    value={priceMinInput}
                    onChange={(e) => {
                      // Echo the keystrokes only; the value is committed (and
                      // clamped) on blur so typing a number that is briefly out
                      // of range isn't fought character by character.
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setPriceMinInput(''); return; }
                      if (!/^\d+(\.\d+)?$/.test(raw)) return;
                      setPriceMinInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = priceMinInput === '' ? 0 : Number(priceMinInput);
                      const val = Math.max(totalPriceMin, Math.min(raw, safePriceMax - 1000));
                      setPriceMin(val);
                      setPriceMinInput(val);
                      commitPriceRange(val, safePriceMax);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>{t.to}</span>
                  <input
                    type="text"
                    value={priceMaxInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setPriceMaxInput(''); return; }
                      if (!/^\d+(\.\d+)?$/.test(raw)) return;
                      setPriceMaxInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = priceMaxInput === '' ? totalPriceMax : Number(priceMaxInput);
                      const val = Math.max(safePriceMin + 1000, Math.min(raw, totalPriceMax));
                      setPriceMax(val);
                      setPriceMaxInput(val);
                      commitPriceRange(safePriceMin, val);
                    }}
                  />
                </div>
              </div>
              <div className="custom-select currency-select" ref={currencyRef}>
                <button type="button" className="custom-select__trigger" aria-expanded={currencyOpen} onClick={() => setCurrencyOpen((p) => !p)}>
                  <span>{currency || 'AZN'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {currencyOpen && (
                  <div className="custom-select__dropdown">
                    {(currencies.length ? currencies.map(c => c.value) : ['AZN', 'USD']).map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`custom-select__option ${currency === c ? 'custom-select__option--active' : ''}`}
                        onClick={() => { commit({ currency: c === 'AZN' ? null : c }); setCurrencyOpen(false); }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="slider-container">
              <div className="slider-base-track"></div>
              <div 
                className="slider-active-track" 
                style={{ left: `${priceLeftPercent}%`, right: `${priceRightPercent}%` }}
              ></div>
              <input
                type="range"
                min={totalPriceMin}
                max={totalPriceMax}
                value={safePriceMin}
                className="thumb thumb--left"
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), safePriceMax - 1000);
                  setPriceMin(val);
                  setPriceMinInput(val);
                }}
                onMouseUp={() => commitPriceRange()}
                onTouchEnd={() => commitPriceRange()}
                onBlur={() => commitPriceRange()}
              />
              <input
                type="range"
                min={totalPriceMin}
                max={totalPriceMax}
                value={safePriceMax}
                className="thumb thumb--right"
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), safePriceMin + 1000);
                  setPriceMax(val);
                  setPriceMaxInput(val);
                }}
                onMouseUp={() => commitPriceRange()}
                onTouchEnd={() => commitPriceRange()}
                onBlur={() => commitPriceRange()}
              />
            </div>
          </div>

          {/* Area & Floor Wrapper */}
          <div className="mobile-flex-row filter-group--area-floor">
            <div className="filter-group filter-group--area">
              <label className="filter-label">{t.area}</label>
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>{t.from}</span>
                  <input
                    type="text"
                    value={areaMinInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setAreaMinInput(''); return; }
                      if (!/^\d+(\.\d+)?$/.test(raw)) return;
                      setAreaMinInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = areaMinInput === '' ? 0 : Number(areaMinInput);
                      const val = Math.max(totalAreaMin, Math.min(raw, safeAreaMax - 5));
                      setAreaMin(val);
                      setAreaMinInput(val);
                      commitAreaRange(val, safeAreaMax);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>{t.to}</span>
                  <input
                    type="text"
                    value={areaMaxInput}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setAreaMaxInput(''); return; }
                      if (!/^\d+(\.\d+)?$/.test(raw)) return;
                      setAreaMaxInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = areaMaxInput === '' ? totalAreaMax : Number(areaMaxInput);
                      const val = Math.max(safeAreaMin + 5, Math.min(raw, totalAreaMax));
                      setAreaMax(val);
                      setAreaMaxInput(val);
                      commitAreaRange(safeAreaMin, val);
                    }}
                  />
                </div>
              </div>
              
              <div className="slider-container">
                <div className="slider-base-track"></div>
                <div 
                  className="slider-active-track" 
                  style={{ left: `${areaLeftPercent}%`, right: `${areaRightPercent}%` }}
                ></div>
                <input
                  type="range"
                  step="0.01"
                  min={totalAreaMin}
                  max={totalAreaMax}
                  value={safeAreaMin}
                  className="thumb thumb--left"
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), safeAreaMax - 5);
                    setAreaMin(val);
                    setAreaMinInput(val);
                  }}
                  onMouseUp={() => commitAreaRange()}
                  onTouchEnd={() => commitAreaRange()}
                  onBlur={() => commitAreaRange()}
                />
                <input
                  type="range"
                  step="0.01"
                  min={totalAreaMin}
                  max={totalAreaMax}
                  value={safeAreaMax}
                  className="thumb thumb--right"
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), safeAreaMin + 5);
                    setAreaMax(val);
                    setAreaMaxInput(val);
                  }}
                  onMouseUp={() => commitAreaRange()}
                  onTouchEnd={() => commitAreaRange()}
                  onBlur={() => commitAreaRange()}
                />
              </div>
            </div>

            <div className="filter-group filter-group--floor">
              <label className="filter-label">{t.floor}</label>
              <div className="custom-select" ref={floorRef}>
                <button type="button" className="custom-select__trigger" aria-expanded={floorOpen} onClick={() => setFloorOpen((p) => !p)}>
                  <span>{floor || t.all}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {floorOpen && (
                  <div className="custom-select__dropdown">
                    <button type="button" className={`custom-select__option ${!floor || floor === 'All' ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ floor: null }); setFloorOpen(false); }}>
                      {t.all}
                    </button>
                    {floors.map((f, idx) => {
                      let val = typeof f === 'object' ? (f as any).value || (f as any).floor || (f as any).name : f;
                      if (typeof val === 'object') val = JSON.stringify(val);
                      const valStr = String(val);
                      return (
                        <button key={idx} type="button" className={`custom-select__option ${floor === valStr ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ floor: valStr }); setFloorOpen(false); }}>
                          {valStr}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Wrapper */}
          <div className="mobile-flex-row filter-group--view-status">
            <div className="filter-group filter-group--status">
              <label className="filter-label">{t.status}</label>
              <div className="custom-select" ref={statusRef}>
                <button type="button" className="custom-select__trigger" aria-expanded={statusOpen} onClick={() => setStatusOpen((p) => !p)}>
                  <span>{statusOptions.find(s => s.id === selectedStatus)?.value || t.all}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {statusOpen && (
                  <div className="custom-select__dropdown">
                    <button type="button" className={`custom-select__option ${!selectedStatus ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ status: null }); setStatusOpen(false); }}>
                      {t.all}
                    </button>
                    {statusOptions.map((opt) => (
                      <button key={opt.id} type="button" className={`custom-select__option ${selectedStatus === opt.id ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ status: opt.id }); setStatusOpen(false); }}>
                        {opt.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Number of Rooms Filter */}
          <div className="filter-group filter-group--rooms">
            <label className="filter-label">{t.rooms}</label>
            <div className="rooms-group">
              {ROOM_COUNT_OPTIONS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className={`room-btn ${room.labelKey === 'studio' ? 'room-btn--studio' : ''} ${selectedRooms === room.id ? 'room-btn--active' : ''}`}
                  onClick={() => commit({ rooms: selectedRooms === room.id ? null : room.id })}
                >
                  <span className="room-btn__text">{room.labelKey ? t[room.labelKey] : room.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RESULTS & RESET ROW */}
        <div className="results-row">
          <span className="results-count">{pagination?.total || 0} {t.results}</span>
          <button type="button" className="reset-btn" onClick={handleReset}>{t.reset}</button>
        </div>

        {/* BANNER CARD */}
        <div className="complex-banner">
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h3 className="banner-title">{t.bannerTitle}</h3>
            <div className="banner-actions">
              <a href="tel:+994502772662" className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{t.consultation}</span>
              </a>
              <a href="tel:+994502772662" className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <line x1="9" y1="22" x2="9" y2="16"/>
                  <line x1="15" y1="22" x2="15" y2="16"/>
                  <line x1="9" y1="16" x2="15" y2="16"/>
                  <path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01"/>
                </svg>
                <span>{t.complexInfo}</span>
              </a>
            </div>
          </div>
        </div>

        {/* APARTMENT CARDS GRID */}
        <div style={{ position: 'relative', minHeight: '300px' }}>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .spinner-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.6); display: flex; justify-content: center; align-items: center; z-index: 10; border-radius: 12px; }
            .spinner-icon { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3F4249; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            .cards-grid--fadein { animation: fadeIn 0.35s ease-out; }
          `}</style>

          {isLoading && layouts.length === 0 ? (
            <div className="spinner-overlay">
              <div className="spinner-icon"></div>
            </div>
          ) : layouts.length === 0 && !showSpinner ? (
            <div className="empty-state">
              <p>{t.noResults}</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {showSpinner && (
                <div className="spinner-overlay">
                  <div className="spinner-icon"></div>
                </div>
              )}
              <div className={`cards-grid${!showSpinner ? ' cards-grid--fadein' : ''}`} style={{ opacity: showSpinner ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: '300px' }}>
                {layouts.map((layout: UnitLayout) => {
                  const cover = layout.coverImage || layout.mainImage;
                  return (
                    <UnitCardV2
                      key={layout.id}
                      href={`/${locale}/off-plan/${layout.slug}`}
                      image={cover ? getAssetUrl(cover.url) : undefined}
                      alt={cover?.alt || layout.title}
                      price={formatPrice(layout.prices, currency)}
                      developer={getCardCode(layout)}
                      specs={[
                        layout.unitTypeOption?.title,
                        formatRooms(layout.number),
                        `${layout.totalArea} m²`,
                        formatFloorRange(layout),
                      ]}
                      saved={savedItems.includes(layout.id)}
                      compared={comparedItems.includes(layout.id)}
                      onSave={() => toggleSave(layout)}
                      onCompare={() => toggleCompare(layout)}
                      labels={{
                        save: t.saveListing,
                        saved: t.removeFromSaved,
                        compare: t.compareListing,
                        compared: t.removeFromCompare,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {pagination && (
          <div className="pagination-mobile">
            <span className="pagination-shown">
              {t.shown} {Math.min(layouts.length, pagination.total)} {t.outOf} {pagination.total}
            </span>
            <div className="pagination-progress">
              <div
                className="pagination-progress__fill"
                style={{ width: `${pagination.total ? (Math.min(layouts.length, pagination.total) / pagination.total) * 100 : 0}%` }}
              ></div>
            </div>
            {page < pagination.totalPages && (
              <button
                type="button"
                className="pagination-show-more"
                onClick={() => commit({ page: page + 1 }, true)}
                disabled={isAppending}
              >
                {t.showMore}
              </button>
            )}
          </div>
        )}
    </section>
  );
}
