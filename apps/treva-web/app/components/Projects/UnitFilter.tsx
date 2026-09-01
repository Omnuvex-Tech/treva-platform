'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import UnitCardV2 from '@/app/components/UnitCardV2';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useUnitLayouts, useUnitLayoutRange, useUnitLayoutFloors } from '@/hooks/use-unit-layouts';
import { useStatusOptions } from '@/hooks/use-status-options';
import { useCurrencies } from '@/hooks/use-currencies';
import { useDebounce } from '@/hooks/use-debounce';
import { getTrevaAssetUrl as getAssetUrl } from '@/lib/asset-url';
import type { UnitLayout } from '@/lib/unit-layout.types';
import { getSaved, addSaved, removeSaved } from '@/lib/saved-properties';
import { getCompared, addCompared, removeCompared } from '@/lib/compare-properties';
import './unit-filter.css';

const ROOM_COUNT_OPTIONS: Array<{ id: string; label: string }> = [
  { id: '1', label: '1' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '4plus', label: '4+' },
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
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(searchParams.get('category') || '');

  // The range-hydration effect below resets price/area to defaults once the
  // API range loads — captured once here so it knows not to stomp a min/max
  // the URL (e.g. the home page search widget) already asked for.
  const urlDefaults = useRef({
    priceMin: searchParams.get('priceMin'),
    priceMax: searchParams.get('priceMax'),
    areaMin: searchParams.get('areaMin'),
    areaMax: searchParams.get('areaMax'),
  }).current;

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

  const [currency, setCurrency] = useState(searchParams.get('currency') || 'AZN');
  const [floor, setFloor] = useState(searchParams.get('floor') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedRooms, setSelectedRooms] = useState<string>(searchParams.get('rooms') || '');

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [priceMin, setPriceMin] = useState<number | ''>(Number(searchParams.get('priceMin')) || 0);
  const [priceMax, setPriceMax] = useState<number | ''>(Number(searchParams.get('priceMax')) || '');
  const [priceMinInput, setPriceMinInput] = useState<number | ''>(Number(searchParams.get('priceMin')) || 0);
  const [priceMaxInput, setPriceMaxInput] = useState<number | ''>(Number(searchParams.get('priceMax')) || '');
  const totalPriceMin = 0;

  const [areaMin, setAreaMin] = useState<number | ''>(Number(searchParams.get('areaMin')) || 0);
  const [areaMax, setAreaMax] = useState<number | ''>(Number(searchParams.get('areaMax')) || '');
  const [areaMinInput, setAreaMinInput] = useState<number | ''>(Number(searchParams.get('areaMin')) || 0);
  const [areaMaxInput, setAreaMaxInput] = useState<number | ''>(Number(searchParams.get('areaMax')) || '');
  const totalAreaMin = 0;

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 12;

  const [categories, setCategories] = useState<Array<{ slug: string; title: string }>>([]);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [comparedItems, setComparedItems] = useState<string[]>([]);

  useEffect(() => {
    setSavedItems(getSaved().filter(p => p.type === 'off-plan').map(p => p.id));
    setComparedItems(getCompared().filter(p => p.type === 'off-plan').map(p => p.id));
  }, []);

  const { data: statusOptionsData } = useStatusOptions();
  const statusOptions = statusOptionsData || [];

  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData || [];

  const { data: floorsData } = useUnitLayoutFloors();
  const floors = floorsData || [];

  const { data: rangeData } = useUnitLayoutRange(currency);
  const totalPriceMax = rangeData?.maxPrice || 1500000;
  const totalAreaMax = rangeData?.maxTotalArea || 10000;

  // Hydrating the price/area sliders from the fetched range (below) briefly makes
  // `priceMax`/`areaMax` differ from their debounced counterparts, which used to
  // make `isDebouncing` (and therefore the loading spinner) flip on again for a
  // second right after the initial list had already loaded. This ref lets the
  // spinner logic tell "range just loaded" apart from "user is dragging a slider".
  const isHydratingRangeRef = useRef(false);
  const rangeHydratedRef = useRef(false);

  useEffect(() => {
    if (rangeData && !rangeHydratedRef.current) {
      rangeHydratedRef.current = true;
      isHydratingRangeRef.current = true;
      if (urlDefaults.priceMax == null) {
        setPriceMax(rangeData.maxPrice);
        setPriceMaxInput(rangeData.maxPrice);
      }
      if (urlDefaults.areaMax == null) {
        setAreaMax(rangeData.maxTotalArea);
        setAreaMaxInput(rangeData.maxTotalArea);
      }
      if (urlDefaults.priceMin == null) {
        setPriceMin(0);
        setPriceMinInput(0);
      }
      if (urlDefaults.areaMin == null) {
        setAreaMin(0);
        setAreaMinInput(0);
      }
    }
  }, [rangeData, urlDefaults]);

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
    const sp = new URLSearchParams();
    if (selectedCategorySlug) sp.set('category', selectedCategorySlug);
    if (currency && currency !== 'AZN') sp.set('currency', currency);
    if (floor) sp.set('floor', floor);
    if (selectedStatus) sp.set('status', selectedStatus);
    if (selectedRooms) sp.set('rooms', selectedRooms);
    if (typeof priceMin === 'number' && priceMin > 0) sp.set('priceMin', String(priceMin));
    if (typeof priceMax === 'number' && priceMax > 0 && priceMax < totalPriceMax) sp.set('priceMax', String(priceMax));
    if (typeof areaMin === 'number' && areaMin > 0) sp.set('areaMin', String(areaMin));
    if (typeof areaMax === 'number' && areaMax > 0 && areaMax < totalAreaMax) sp.set('areaMax', String(areaMax));
    if (page > 1) sp.set('page', String(page));
    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [selectedCategorySlug, currency, floor, selectedStatus, selectedRooms, priceMin, priceMax, areaMin, areaMax, page, router]);

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

  const debouncedPriceMin = useDebounce(priceMin, 1000);
  const debouncedPriceMax = useDebounce(priceMax, 1000);
  const debouncedAreaMin = useDebounce(areaMin, 1000);
  const debouncedAreaMax = useDebounce(areaMax, 1000);

  const filters = useMemo(() => ({
    page,
    limit,
    // The API only filters on `archived` when it is asked to, so the listing
    // has to say so: archiving is how the panel takes a unit off the site
    // (parkings are archived wholesale), and without this they came back in
    // the results anyway.
    archived: false,
    ...(selectedCategorySlug && { categorySlug: selectedCategorySlug }),
    ...(floor && { floor: parseInt(floor) }),
    ...(selectedStatus && { statusOptionId: selectedStatus }),
    ...(selectedRooms && { rooms: selectedRooms }),
    ...(typeof debouncedPriceMin === 'number' && debouncedPriceMin > 0 && { minPrice: debouncedPriceMin }),
    ...(typeof debouncedPriceMax === 'number' && debouncedPriceMax < totalPriceMax && { maxPrice: debouncedPriceMax }),
    currency,
    ...(typeof debouncedAreaMin === 'number' && debouncedAreaMin > 0 && { minArea: debouncedAreaMin }),
    ...(typeof debouncedAreaMax === 'number' && debouncedAreaMax < totalAreaMax && { maxArea: debouncedAreaMax }),
  }), [page, limit, selectedCategorySlug, floor, selectedStatus, selectedRooms, debouncedPriceMin, debouncedPriceMax, debouncedAreaMin, debouncedAreaMax, currency]);

  const { data: response, isLoading, isFetching } = useUnitLayouts(filters);

  useEffect(() => {
    if (isHydratingRangeRef.current && priceMax === debouncedPriceMax && areaMax === debouncedAreaMax) {
      isHydratingRangeRef.current = false;
    }
  }, [debouncedPriceMax, debouncedAreaMax, priceMax, areaMax]);

  const isDebouncing =
    !isHydratingRangeRef.current &&
    (priceMin !== debouncedPriceMin || priceMax !== debouncedPriceMax || areaMin !== debouncedAreaMin || areaMax !== debouncedAreaMax);
  const showSpinner = isLoading || isFetching || isDebouncing;

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

  const formatStatus = (status: string) => {
    const normalized = status.trim().toLowerCase();
    if (normalized === 'available') return t.available;
    if (normalized === 'sold') return t.sold;
    if (normalized === 'reserved') return t.reserved;
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
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
    setFloor('');
    setSelectedStatus('');
    setSelectedRooms('');
    setSelectedCategorySlug('');
    setPriceMin(0);
    setPriceMinInput(0);
    setPriceMax(totalPriceMax);
    setPriceMaxInput(totalPriceMax);
    setAreaMin(0);
    setAreaMinInput(0);
    setAreaMax(totalAreaMax);
    setAreaMaxInput(totalAreaMax);
    setPage(1);
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
                  <button type="button" className={`custom-select__option ${!selectedCategorySlug ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedCategorySlug(''); setPage(1); setCategoryOpen(false); }}>
                    {t.all}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      className={`custom-select__option ${selectedCategorySlug === cat.slug ? 'custom-select__option--active' : ''}`}
                      onClick={() => { setSelectedCategorySlug(cat.slug); setPage(1); setCategoryOpen(false); }}
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
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setPriceMinInput(''); setPriceMin(0); return; }
                      if (!/^\d+(\.\d+)?$/.test(raw)) return;
                      const val = Number(raw);
                      setPriceMinInput(val);
                      const clamped = Math.max(totalPriceMin, Math.min(val, safePriceMax - 1000));
                      setPriceMin(clamped);
                      setPage(1);
                    }}
                    onBlur={() => {
                      const raw = priceMinInput === '' ? 0 : Number(priceMinInput);
                      const val = Math.max(totalPriceMin, Math.min(raw, safePriceMax - 1000));
                      setPriceMin(val);
                      setPriceMinInput(val);
                      setPage(1);
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
                      const val = Number(raw);
                      setPriceMaxInput(val);
                      const clamped = Math.max(safePriceMin + 1000, Math.min(val, totalPriceMax));
                      setPriceMax(clamped);
                      setPage(1);
                    }}
                    onBlur={() => {
                      const raw = priceMaxInput === '' ? totalPriceMax : Number(priceMaxInput);
                      const val = Math.max(safePriceMin + 1000, Math.min(raw, totalPriceMax));
                      setPriceMax(val);
                      setPriceMaxInput(val);
                      setPage(1);
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
                        onClick={() => { setCurrency(c); setPage(1); setCurrencyOpen(false); }}
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
                  setPage(1);
                }}
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
                  setPage(1);
                }}
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
                      if (raw === '') { setAreaMinInput(''); setAreaMin(0); return; }
                      if (!/^\d+(\.\d+)?$/.test(raw)) return;
                      const val = Number(raw);
                      setAreaMinInput(val);
                      const clamped = Math.max(totalAreaMin, Math.min(val, safeAreaMax - 5));
                      setAreaMin(clamped);
                      setPage(1);
                    }}
                    onBlur={() => {
                      const raw = areaMinInput === '' ? 0 : Number(areaMinInput);
                      const val = Math.max(totalAreaMin, Math.min(raw, safeAreaMax - 5));
                      setAreaMin(val);
                      setAreaMinInput(val);
                      setPage(1);
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
                      const val = Number(raw);
                      setAreaMaxInput(val);
                      const clamped = Math.max(safeAreaMin + 5, Math.min(val, totalAreaMax));
                      setAreaMax(clamped);
                      setPage(1);
                    }}
                    onBlur={() => {
                      const raw = areaMaxInput === '' ? totalAreaMax : Number(areaMaxInput);
                      const val = Math.max(safeAreaMin + 5, Math.min(raw, totalAreaMax));
                      setAreaMax(val);
                      setAreaMaxInput(val);
                      setPage(1);
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
                    setPage(1);
                  }}
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
                    setPage(1);
                  }}
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
                    <button type="button" className={`custom-select__option ${!floor || floor === 'All' ? 'custom-select__option--active' : ''}`} onClick={() => { setFloor(''); setPage(1); setFloorOpen(false); }}>
                      {t.all}
                    </button>
                    {floors.map((f, idx) => {
                      let val = typeof f === 'object' ? (f as any).value || (f as any).floor || (f as any).name : f;
                      if (typeof val === 'object') val = JSON.stringify(val);
                      const valStr = String(val);
                      return (
                        <button key={idx} type="button" className={`custom-select__option ${floor === valStr ? 'custom-select__option--active' : ''}`} onClick={() => { setFloor(valStr); setPage(1); setFloorOpen(false); }}>
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
                  <span>{selectedStatus ? formatStatus(statusOptions.find(s => s.id === selectedStatus)?.value || '') : t.all}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {statusOpen && (
                  <div className="custom-select__dropdown">
                    <button type="button" className={`custom-select__option ${!selectedStatus ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedStatus(''); setPage(1); setStatusOpen(false); }}>
                      {t.all}
                    </button>
                    {statusOptions.map((opt) => (
                      <button key={opt.id} type="button" className={`custom-select__option ${selectedStatus === opt.id ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedStatus(opt.id); setPage(1); setStatusOpen(false); }}>
                        {formatStatus(opt.value)}
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
                  className={`room-btn ${selectedRooms === room.id ? 'room-btn--active' : ''}`}
                  onClick={() => { setSelectedRooms(selectedRooms === room.id ? '' : room.id); setPage(1); }}
                >
                  <span className="room-btn__text">{room.label}</span>
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

          {isLoading ? (
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
              <button type="button" className="pagination-show-more" onClick={() => setPage((p) => p + 1)}>
                {t.showMore}
              </button>
            )}
          </div>
        )}
    </section>
  );
}
