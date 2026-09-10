'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useResaleApartmentRange, useResaleCurrencies, useResaleLocationOptions, useResaleRooms, useResaleApartmentTypes } from '@/hooks/use-resale-apartments';
import type { ResaleLocationOption } from '@/lib/resale.types';
import './unit-filter.css';

export interface ResaleFilterState {
  apartmentTypeId?: string;
  city?: string;
  region?: string;
  purpose?: "sale" | "rent";
  mortgage?: boolean;
  extract?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  roomCount?: number;
  currency?: string;
  status?: string;
}

const filterDictionary = {
  az: {
    sectionTop: 'Təkrar satış',
    sectionBottom: 'mənzillər',
    price: 'Qiymət',
    area: 'Sahə (m²)',
    city: 'Şəhər',
    region: 'Rayon',
    category: 'Kateqoriya',
    offerType: 'Elan növü',
    mortgage: 'İpoteka',
    extract: 'Çıxarış',
    status: 'Status',
    rooms: 'Otaq sayı',
    from: 'min',
    to: 'max',
    allCities: 'Bütün şəhərlər',
    allRegions: 'Bütün rayonlar',
    allProjects: 'Bütün layihələr',
    all: 'Hamısı',
    sale: 'Satış',
    rent: 'Kirayə',
    yes: 'Bəli',
    no: 'Xeyr',
    active: 'Aktiv',
    reserved: 'Bron edilib',
    sold: 'Satılıb',
    noRooms: 'Otaq yoxdur',
    results: 'mənzil tapıldı',
    reset: 'Filtrləri sıfırla',
  },
  en: {
    sectionTop: 'Resale',
    sectionBottom: 'apartments',
    price: 'Price',
    area: 'Area (m²)',
    city: 'City',
    region: 'Region',
    category: 'Category',
    offerType: 'Offer type',
    mortgage: 'Mortgage',
    extract: 'Extract',
    status: 'Status',
    rooms: 'Number of rooms',
    from: 'from',
    to: 'to',
    allCities: 'All cities',
    allRegions: 'All regions',
    allProjects: 'All projects',
    all: 'All',
    sale: 'Sale',
    rent: 'Rent',
    yes: 'Yes',
    no: 'No',
    active: 'Active',
    reserved: 'Reserved',
    sold: 'Sold',
    noRooms: 'No rooms',
    results: 'apartments found',
    reset: 'Reset filters',
  },
  ru: {
    sectionTop: 'Вторичное жилье',
    sectionBottom: 'квартиры',
    price: 'Цена',
    area: 'Площадь (м²)',
    city: 'Город',
    region: 'Район',
    category: 'Категория',
    offerType: 'Тип предложения',
    mortgage: 'Ипотека',
    extract: 'Выписка',
    status: 'Статус',
    rooms: 'Количество комнат',
    from: 'от',
    to: 'до',
    allCities: 'Все города',
    allRegions: 'Все районы',
    allProjects: 'Все проекты',
    all: 'Все',
    sale: 'Продажа',
    rent: 'Аренда',
    yes: 'Да',
    no: 'Нет',
    active: 'Активный',
    reserved: 'Забронировано',
    sold: 'Продано',
    noRooms: 'Комнат нет',
    results: 'квартир найдено',
    reset: 'Сбросить фильтры',
  },
} as const;

function getLocalizedApartmentTypeLabel(
  apartmentType: { slug?: string; title?: string } | undefined,
  locale: 'az' | 'en' | 'ru'
) {
  const normalized = String(apartmentType?.slug || apartmentType?.title || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

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
      en: 'New Construction',
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
      en: 'Old Construction',
      ru: 'Старый фонд',
    },
  } as const;

  return translations[normalized as keyof typeof translations]?.[locale] ?? apartmentType?.title ?? '';
}

function getApartmentTypeOrder(apartmentType: { slug?: string; title?: string } | undefined) {
  const normalized = String(apartmentType?.slug || apartmentType?.title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const orderMap: Record<string, number> = {
    new_constructed: 0,
    old_constructed: 1,
    country_house: 2,
    detached_house: 2,
    ofice: 3,
    object: 4,
  };

  return orderMap[normalized] ?? 999;
}

export default function ResaleFilter({ totalCount }: { totalCount?: number }) {
  const params = useParams();
  const locale = ((params?.locale as string) || 'az') as 'az' | 'en' | 'ru';
  const t = filterDictionary[locale] || filterDictionary.az;

  // ── Committed filters live in the URL query. The listing page derives its
  //    fetch from the query, so a backend request goes out only when the query
  //    changes here — a dropdown pick, an input blur, or a slider release. The
  //    home page's search widget deep-links with the same param names
  //    (minPrice/maxPrice/minArea/maxArea/roomCount), so they just work.
  const searchParams = useSearchParams();
  const router = useRouter();

  const qNum = (key: string): number | null => {
    const raw = searchParams.get(key);
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };
  const urlPriceMin = qNum('minPrice') ?? 0;
  const urlPriceMax = qNum('maxPrice');
  const urlAreaMin = qNum('minArea') ?? 0;
  const urlAreaMax = qNum('maxArea');

  const selectedTypeId = searchParams.get('type') || '';
  const selectedCity = searchParams.get('city') || '';
  const selectedRegion = searchParams.get('region') || '';
  const selectedPurpose = searchParams.get('purpose') || '';
  const selectedMortgage = searchParams.get('mortgage') || '';
  const selectedExtract = searchParams.get('extract') || '';
  const selectedStatus = searchParams.get('status') ?? 'active';
  const selectedRooms = searchParams.get('roomCount') || '';
  const currency = searchParams.get('currency') || 'AZN';

  const commit = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === '' || value === null || value === undefined) sp.delete(key);
        else sp.set(key, String(value));
      }
      sp.delete('page'); // any filter change → back to the first page
      const qs = sp.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    },
    [searchParams, router],
  );

  const { data: apartmentTypesData } = useResaleApartmentTypes();
  const { data: locationOptionsData } = useResaleLocationOptions();
  const { data: currenciesData } = useResaleCurrencies();
  const { data: roomCountsData } = useResaleRooms();

  const apartmentTypes = [...(apartmentTypesData || [])].sort((a: any, b: any) => {
    return getApartmentTypeOrder(a) - getApartmentTypeOrder(b);
  });
  const locationOptions = locationOptionsData || [];
  const cities = locationOptions.filter((option) => option.type === 'city');
  const currencies = currenciesData || [];
  const roomButtons = roomCountsData?.length
    ? roomCountsData.map((roomCount) => ({ value: String(roomCount), label: String(roomCount) }))
    : [];

  // Must mirror the values the inventory panel actually stores on an apartment
  // (RESALE_STATUS_OPTIONS): active / reserved / sold. "pending"/"non-active"
  // never matched anything.
  const resaleStatusOptions = [
    { id: 'active', value: t.active },
    { id: 'reserved', value: t.reserved },
    { id: 'sold', value: t.sold },
  ];

  const purposeOptions = [
    { id: 'sale', value: t.sale },
    { id: 'rent', value: t.rent },
  ];

  const booleanOptions = [
    { id: 'true', value: t.yes },
    { id: 'false', value: t.no },
  ];

  const { data: rangeData } = useResaleApartmentRange(currency);

  const totalPriceMax = rangeData?.maxPrice || 1500000;
  const totalAreaMax = rangeData?.maxTotalArea || 500;
  const totalPriceMin = 0;
  const totalAreaMin = 0;

  const [cityOpen, setCityOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [mortgageOpen, setMortgageOpen] = useState(false);
  const [extractOpen, setExtractOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const purposeRef = useRef<HTMLDivElement>(null);
  const mortgageRef = useRef<HTMLDivElement>(null);
  const extractRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Draft values for the price/area controls — what the user is currently
  // typing / dragging. Nothing is committed to the URL (and thus to the
  // backend) until a blur or a slider release.
  const [priceMin, setPriceMin] = useState<number | ''>(urlPriceMin);
  const [priceMax, setPriceMax] = useState<number | ''>(urlPriceMax ?? '');
  const [priceMinInput, setPriceMinInput] = useState<number | ''>(urlPriceMin);
  const [priceMaxInput, setPriceMaxInput] = useState<number | ''>(urlPriceMax ?? '');

  const [areaMin, setAreaMin] = useState<number | ''>(urlAreaMin);
  const [areaMax, setAreaMax] = useState<number | ''>(urlAreaMax ?? '');
  const [areaMinInput, setAreaMinInput] = useState<number | ''>(urlAreaMin);
  const [areaMaxInput, setAreaMaxInput] = useState<number | ''>(urlAreaMax ?? '');

  const regionOptions = selectedCity
    ? locationOptions.filter((option: ResaleLocationOption) => option.type === 'region' && option.city?.title === selectedCity)
    : [];

  // Snap the draft controls back to the committed query (first load, Reset,
  // browser back) and up to the API's real ceiling once the range resolves.
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
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) setRegionOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
      if (purposeRef.current && !purposeRef.current.contains(e.target as Node)) setPurposeOpen(false);
      if (mortgageRef.current && !mortgageRef.current.contains(e.target as Node)) setMortgageOpen(false);
      if (extractRef.current && !extractRef.current.contains(e.target as Node)) setExtractOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safePriceMin = typeof priceMin === 'number' ? priceMin : 0;
  const safePriceMax = typeof priceMax === 'number' ? priceMax : totalPriceMax;
  const safeAreaMin = typeof areaMin === 'number' ? areaMin : 0;
  const safeAreaMax = typeof areaMax === 'number' ? areaMax : totalAreaMax;

  // Push the current price/area drafts into the URL query. Called on a slider
  // release or an input blur — never mid-drag. A bound at the far end of the
  // range is written as "no limit" (param removed).
  const commitPriceRange = (min = safePriceMin, max = safePriceMax) => {
    commit({
      minPrice: min > 0 ? Math.round(min) : null,
      maxPrice: max < totalPriceMax ? Math.round(max) : null,
    });
  };
  const commitAreaRange = (min = safeAreaMin, max = safeAreaMax) => {
    commit({
      minArea: min > 0 ? Math.round(min * 100) / 100 : null,
      maxArea: max < totalAreaMax ? Math.round(max * 100) / 100 : null,
    });
  };

  const priceLeftPercent = ((safePriceMin - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;
  const priceRightPercent = 100 - ((safePriceMax - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;

  const areaLeftPercent = ((safeAreaMin - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;
  const areaRightPercent = 100 - ((safeAreaMax - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;

  const handleReset = () => {
    // Clear the whole query (the draft-sync effect snaps the sliders back), and
    // reset the drafts here too so the thumbs move immediately.
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

  return (
    <section className="layout-section">
      {/* HEADER */}
      <div className="layout-header">
        <h2 className="layout-title">
          <span className="layout-title-thin">{t.sectionTop}</span>
          <span className="layout-title-bold">{t.sectionBottom}</span>
        </h2>
      </div>

      {/* FILTERS CONTAINER */}
      <div className="filters-grid">
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
                  {currencies.length === 0 ? (
                    <span className="custom-select__option" style={{ color: '#9ca3af', pointerEvents: 'none' }}>AZN</span>
                  ) : (
                    currencies.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`custom-select__option ${currency === opt.value ? 'custom-select__option--active' : ''}`}
                        onClick={() => { commit({ currency: opt.value === 'AZN' ? null : opt.value }); setCurrencyOpen(false); }}
                      >
                        {opt.value}
                      </button>
                    ))
                  )}
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

        {/* Area Filter */}
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

        {/* City Filter */}
        <div className="filter-group filter-group--city">
          <label className="filter-label">{t.city}</label>
          <div className="custom-select" ref={cityRef}>
            <button type="button" className="custom-select__trigger" aria-expanded={cityOpen} onClick={() => setCityOpen((p) => !p)}>
              <span>{selectedCity || t.allCities}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {cityOpen && (
              <div className="custom-select__dropdown">
                <button type="button" className={`custom-select__option ${!selectedCity ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ city: null, region: null }); setCityOpen(false); }}>
                  {t.allCities}
                </button>
                {cities.map((city) => (
                  <button key={city.id} type="button" className={`custom-select__option ${selectedCity === city.title ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ city: city.title, region: null }); setCityOpen(false); }}>
                    {city.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Region Filter */}
        <div className="filter-group filter-group--region">
          <label className="filter-label">{t.region}</label>
          <div className="custom-select" ref={regionRef}>
            <button type="button" className="custom-select__trigger" aria-expanded={regionOpen} onClick={() => setRegionOpen((p) => !p)}>
              <span>{selectedRegion || t.allRegions}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {regionOpen && (
              <div className="custom-select__dropdown">
                <button type="button" className={`custom-select__option ${!selectedRegion ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ region: null }); setRegionOpen(false); }}>
                  {t.allRegions}
                </button>
                {regionOptions.map((region) => (
                  <button key={region.id} type="button" className={`custom-select__option ${selectedRegion === region.title ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ region: region.title }); setRegionOpen(false); }}>
                    {region.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-group filter-group--category">
          <label className="filter-label">{t.category}</label>
          <div className="custom-select" ref={typeRef}>
            <button type="button" className="custom-select__trigger" aria-expanded={typeOpen} onClick={() => setTypeOpen((p) => !p)}>
              <span>{getLocalizedApartmentTypeLabel(apartmentTypes.find((type: any) => type.id === selectedTypeId), locale) || t.allProjects}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {typeOpen && (
              <div className="custom-select__dropdown">
                <button type="button" className={`custom-select__option ${!selectedTypeId ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ type: null }); setTypeOpen(false); }}>
                  {t.allProjects}
                </button>
                {apartmentTypes.map((type: any) => (
                  <button key={type.id} type="button" className={`custom-select__option ${selectedTypeId === type.id ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ type: type.id }); setTypeOpen(false); }}>
                    {getLocalizedApartmentTypeLabel(type, locale)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Purpose Filter */}
        <div className="filter-group filter-group--purpose">
          <label className="filter-label">{t.offerType}</label>
          <div className="custom-select" ref={purposeRef}>
            <button type="button" className="custom-select__trigger" aria-expanded={purposeOpen} onClick={() => setPurposeOpen((p) => !p)}>
              <span>{purposeOptions.find((option) => option.id === selectedPurpose)?.value || t.all}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {purposeOpen && (
              <div className="custom-select__dropdown">
                <button type="button" className={`custom-select__option ${!selectedPurpose ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ purpose: null }); setPurposeOpen(false); }}>
                  {t.all}
                </button>
                {purposeOptions.map((option) => (
                  <button key={option.id} type="button" className={`custom-select__option ${selectedPurpose === option.id ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ purpose: option.id }); setPurposeOpen(false); }}>
                    {option.value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mortgage Filter */}
        <div className="filter-group filter-group--mortgage">
          <label className="filter-label">{t.mortgage}</label>
          <div className="custom-select" ref={mortgageRef}>
            <button type="button" className="custom-select__trigger" aria-expanded={mortgageOpen} onClick={() => setMortgageOpen((p) => !p)}>
              <span>{booleanOptions.find((option) => option.id === selectedMortgage)?.value || t.all}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {mortgageOpen && (
              <div className="custom-select__dropdown">
                <button type="button" className={`custom-select__option ${!selectedMortgage ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ mortgage: null }); setMortgageOpen(false); }}>
                  {t.all}
                </button>
                {booleanOptions.map((option) => (
                  <button key={option.id} type="button" className={`custom-select__option ${selectedMortgage === option.id ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ mortgage: option.id }); setMortgageOpen(false); }}>
                    {option.value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Extract Filter */}
        <div className="filter-group filter-group--extract">
          <label className="filter-label">{t.extract}</label>
          <div className="custom-select" ref={extractRef}>
            <button type="button" className="custom-select__trigger" aria-expanded={extractOpen} onClick={() => setExtractOpen((p) => !p)}>
              <span>{booleanOptions.find((option) => option.id === selectedExtract)?.value || t.all}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {extractOpen && (
              <div className="custom-select__dropdown">
                <button type="button" className={`custom-select__option ${!selectedExtract ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ extract: null }); setExtractOpen(false); }}>
                  {t.all}
                </button>
                {booleanOptions.map((option) => (
                  <button key={option.id} type="button" className={`custom-select__option ${selectedExtract === option.id ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ extract: option.id }); setExtractOpen(false); }}>
                    {option.value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="filter-group filter-group--status">
          <label className="filter-label">{t.status}</label>
          <div className="custom-select" ref={statusRef}>
            <button type="button" className="custom-select__trigger" aria-expanded={statusOpen} onClick={() => setStatusOpen((p) => !p)}>
              <span>{resaleStatusOptions.find(s => s.id === selectedStatus)?.value || t.all}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {statusOpen && (
              <div className="custom-select__dropdown">
                <button type="button" className={`custom-select__option ${selectedStatus === 'all' ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ status: 'all' }); setStatusOpen(false); }}>
                  {t.all}
                </button>
                {resaleStatusOptions.map((opt) => (
                  <button key={opt.id} type="button" className={`custom-select__option ${selectedStatus === opt.id ? 'custom-select__option--active' : ''}`} onClick={() => { commit({ status: opt.id === 'active' ? null : opt.id }); setStatusOpen(false); }}>
                    {opt.value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Number of Rooms Filter */}
        <div className="filter-group filter-group--rooms">
          <label className="filter-label">{t.rooms}</label>
          <div className="rooms-group">
            {roomButtons.length === 0 ? (
              <span style={{ fontSize: 13, color: '#9ca3af' }}>{t.noRooms}</span>
            ) : (
              roomButtons.map((room) => (
                <button
                  key={room.value}
                  type="button"
                  className={`room-btn ${selectedRooms === room.value ? 'room-btn--active' : ''}`}
                  onClick={() => commit({ roomCount: selectedRooms === room.value ? null : room.value })}
                  aria-pressed={selectedRooms === room.value}
                >
                  <span className="room-btn__text">{room.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RESULTS & RESET ROW */}
      <div className="results-row">
        <span className="results-count">{totalCount ?? 0} {t.results}</span>
        <button type="button" className="reset-btn" onClick={handleReset}>{t.reset}</button>
      </div>
    </section>
  );
}
