'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useUnitLayouts, useUnitLayoutRange, useUnitLayoutFloors } from '@/hooks/use-unit-layouts';
import { useRoomOptions } from '@/hooks/use-room-options';
import { useViewOptions } from '@/hooks/use-view-options';
import { useStatusOptions } from '@/hooks/use-status-options';
import { useCurrencies } from '@/hooks/use-currencies';
import { useDebounce } from '@/hooks/use-debounce';
import { getTrevaAssetUrl as getAssetUrl } from '@/lib/asset-url';
import type { UnitLayout } from '@/lib/unit-layout.types';
import './unit-filter.css';

export default function UnitLayout() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale || 'az';
  const categorySlug = searchParams.get('category') || '';

  const [currency, setCurrency] = useState('USD');
  const [floor, setFloor] = useState('');
  const [selectedView, setSelectedView] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string>('');

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [priceMin, setPriceMin] = useState<number | ''>(0);
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [priceMinInput, setPriceMinInput] = useState<number | ''>(0);
  const [priceMaxInput, setPriceMaxInput] = useState<number | ''>('');
  const totalPriceMin = 0;

  const [areaMin, setAreaMin] = useState<number | ''>(0);
  const [areaMax, setAreaMax] = useState<number | ''>('');
  const [areaMinInput, setAreaMinInput] = useState<number | ''>(0);
  const [areaMaxInput, setAreaMaxInput] = useState<number | ''>('');
  const totalAreaMin = 0;

  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: roomOptionsData } = useRoomOptions('off-plan');
  const roomOptions = roomOptionsData || [];

  const { data: viewOptionsData } = useViewOptions();
  const viewOptions = viewOptionsData || [];

  const { data: statusOptionsData } = useStatusOptions();
  const statusOptions = statusOptionsData || [];

  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData || [];

  const { data: floorsData } = useUnitLayoutFloors();
  const floors = floorsData || [];

  const { data: rangeData } = useUnitLayoutRange(currency);
  const totalPriceMax = rangeData?.maxPrice || 1500000;
  const totalAreaMax = rangeData?.maxTotalArea || 10000;

  useEffect(() => {
    if (rangeData) {
      setPriceMax(rangeData.maxPrice);
      setPriceMaxInput(rangeData.maxPrice);
      setAreaMax(rangeData.maxTotalArea);
      setAreaMaxInput(rangeData.maxTotalArea);
    }
  }, [rangeData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (floorRef.current && !floorRef.current.contains(e.target as Node)) setFloorOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedPriceMin = useDebounce(priceMin, 1000);
  const debouncedPriceMax = useDebounce(priceMax, 1000);
  const debouncedAreaMin = useDebounce(areaMin, 1000);
  const debouncedAreaMax = useDebounce(areaMax, 1000);

  const filters = useMemo(() => ({
    page,
    limit,
    ...(categorySlug && { categorySlug }),
    ...(floor && { floor: parseInt(floor) }),
    ...(selectedView && { viewOptionId: selectedView }),
    ...(selectedStatus && { statusOptionId: selectedStatus }),
    ...(selectedRooms && { roomOptionId: selectedRooms }),
    ...(typeof debouncedPriceMin === 'number' && debouncedPriceMin > 0 && { minPrice: debouncedPriceMin }),
    ...(typeof debouncedPriceMax === 'number' && debouncedPriceMax < totalPriceMax && { maxPrice: debouncedPriceMax }),
    currency,
    ...(typeof debouncedAreaMin === 'number' && debouncedAreaMin > 0 && { minArea: debouncedAreaMin }),
    ...(typeof debouncedAreaMax === 'number' && debouncedAreaMax < totalAreaMax && { maxArea: debouncedAreaMax }),
  }), [page, limit, categorySlug, floor, selectedView, selectedStatus, selectedRooms, debouncedPriceMin, debouncedPriceMax, debouncedAreaMin, debouncedAreaMax, currency]);

  const { data: response, isLoading, isFetching } = useUnitLayouts(filters);

  const isDebouncing = priceMin !== debouncedPriceMin || priceMax !== debouncedPriceMax || areaMin !== debouncedAreaMin || areaMax !== debouncedAreaMax;
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
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  };

  const handleReset = () => {
    setFloor('');
    setSelectedView('');
    setSelectedStatus('');
    setSelectedRooms('');
    setPriceMin(0);
    setPriceMinInput(0);
    setPriceMax(totalPriceMax);
    setPriceMaxInput(totalPriceMax);
    setAreaMin(0);
    setAreaMinInput(0);
    setAreaMax(totalAreaMax);
    setAreaMaxInput(totalAreaMax);
    setPage(1);
  };

  const getCardCode = (layout: UnitLayout) => {
    return layout.name || layout.title;
  };

  return (
    <section className="layout-section">
        
        {/* HEADER */}
        <div className="layout-header">
          <h2 className="layout-title">
            <span className="layout-title-thin">UnIt</span>
            <span className="layout-title-bold">layouts</span>
            <span className="layout-count">({pagination?.total || 0})</span>
          </h2>
        </div>

        {/* FILTERS CONTAINER */}
        <div className="filters-grid">
          
          {/* Price Filter */}
          <div className="filter-group filter-group--price">
            <label className="filter-label">Price</label>
            <div className="filter-inputs-wrapper">
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>from</span>
                  <input 
                    type="text" 
                    value={priceMinInput} 
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setPriceMinInput(''); return; }
                      if (!/^\d+$/.test(raw)) return;
                      setPriceMinInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = priceMinInput === '' ? 0 : Number(priceMinInput);
                      const val = Math.max(totalPriceMin, Math.min(raw, safePriceMax - 1000));
                      setPriceMin(val);
                      setPriceMinInput(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={priceMaxInput} 
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setPriceMaxInput(''); return; }
                      if (!/^\d+$/.test(raw)) return;
                      setPriceMaxInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = priceMaxInput === '' ? totalPriceMax : Number(priceMaxInput);
                      const val = Math.max(safePriceMin + 1000, Math.min(raw, totalPriceMax));
                      setPriceMax(val);
                      setPriceMaxInput(val);
                    }}
                  />
                </div>
              </div>
              
              <div className="custom-select currency-select" ref={currencyRef}>
                <button type="button" className="custom-select__trigger" aria-expanded={currencyOpen} onClick={() => setCurrencyOpen((p) => !p)}>
                  <span>{currency}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {currencyOpen && (
                  <div className="custom-select__dropdown">
                    {(currencies.length ? currencies.map((c) => ({ value: c.value, label: c.value })) : [{ value: "USD", label: "USD" }, { value: "AZN", label: "AZN" }]).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`custom-select__option ${currency === opt.value ? "custom-select__option--active" : ""}`}
                        onClick={() => {
                          setCurrency(opt.value);
                          setPage(1);
                          setCurrencyOpen(false);
                        }}
                      >
                        {opt.label}
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
              />
            </div>
          </div>

          {/* Area & Floor Wrapper */}
          <div className="mobile-flex-row filter-group--area-floor">
            <div className="filter-group filter-group--area">
              <label className="filter-label">Area (m²)</label>
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>from</span>
                  <input 
                    type="text" 
                    value={areaMinInput} 
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setAreaMinInput(''); return; }
                      if (!/^\d+$/.test(raw)) return;
                      setAreaMinInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = areaMinInput === '' ? 0 : Number(areaMinInput);
                      const val = Math.max(totalAreaMin, Math.min(raw, safeAreaMax - 5));
                      setAreaMin(val);
                      setAreaMinInput(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={areaMaxInput} 
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s+/g, '');
                      if (raw === '') { setAreaMaxInput(''); return; }
                      if (!/^\d+$/.test(raw)) return;
                      setAreaMaxInput(Number(raw));
                    }}
                    onBlur={() => {
                      const raw = areaMaxInput === '' ? totalAreaMax : Number(areaMaxInput);
                      const val = Math.max(safeAreaMin + 5, Math.min(raw, totalAreaMax));
                      setAreaMax(val);
                      setAreaMaxInput(val);
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
                  min={totalAreaMin} 
                  max={totalAreaMax} 
                  value={safeAreaMin}
                  className="thumb thumb--left"
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), safeAreaMax - 5);
                    setAreaMin(val);
                    setAreaMinInput(val);
                  }}
                />
                <input 
                  type="range" 
                  min={totalAreaMin} 
                  max={totalAreaMax} 
                  value={safeAreaMax}
                  className="thumb thumb--right"
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), safeAreaMin + 5);
                    setAreaMax(val);
                    setAreaMaxInput(val);
                  }}
                />
              </div>
            </div>

            <div className="filter-group filter-group--floor">
              <label className="filter-label">Floor</label>
              <div className="custom-select" ref={floorRef}>
                <button type="button" className="custom-select__trigger" aria-expanded={floorOpen} onClick={() => setFloorOpen((p) => !p)}>
                  <span>{floor || 'All'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {floorOpen && (
                  <div className="custom-select__dropdown">
                    {[{ value: '', label: 'All' }, ...floors.map((f) => ({ value: String(f), label: String(f) }))].map((opt) => (
                      <button key={opt.value} type="button" className={`custom-select__option ${floor === opt.value ? 'custom-select__option--active' : ''}`} onClick={() => { setFloor(opt.value); setPage(1); setFloorOpen(false); }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View & Status Wrapper */}
          <div className="mobile-flex-row filter-group--view-status">
            <div className="filter-group filter-group--view">
              <label className="filter-label">View</label>
              <div className="custom-select" ref={viewRef}>
                <button type="button" className="custom-select__trigger" aria-expanded={viewOpen} onClick={() => setViewOpen((p) => !p)}>
                  <span>{viewOptions.find(v => v.id === selectedView)?.value || 'All'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {viewOpen && (
                  <div className="custom-select__dropdown">
                    <button type="button" className={`custom-select__option ${!selectedView ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedView(''); setPage(1); setViewOpen(false); }}>
                      All
                    </button>
                    {viewOptions.map((opt) => (
                      <button key={opt.id} type="button" className={`custom-select__option ${selectedView === opt.id ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedView(opt.id); setPage(1); setViewOpen(false); }}>
                        {opt.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group filter-group--status">
              <label className="filter-label">Status</label>
              <div className="custom-select" ref={statusRef}>
                <button type="button" className="custom-select__trigger" aria-expanded={statusOpen} onClick={() => setStatusOpen((p) => !p)}>
                  <span>{statusOptions.find(s => s.id === selectedStatus)?.value || 'All'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {statusOpen && (
                  <div className="custom-select__dropdown">
                    <button type="button" className={`custom-select__option ${!selectedStatus ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedStatus(''); setPage(1); setStatusOpen(false); }}>
                      All
                    </button>
                    {statusOptions.map((opt) => (
                      <button key={opt.id} type="button" className={`custom-select__option ${selectedStatus === opt.id ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedStatus(opt.id); setPage(1); setStatusOpen(false); }}>
                        {opt.value}
                      </button>
                    ))}
                    {statusOptions.length === 0 && (
                      <span className="custom-select__option" style={{ color: '#9ca3af', cursor: 'default' }}>Status yoxdur</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Number of Rooms Filter */}
          <div className="filter-group filter-group--rooms">
            <label className="filter-label">Number of rooms</label>
            <div className="rooms-group">
              {roomOptions.length === 0 ? (
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Otaq yoxdur</span>
              ) : (
                roomOptions.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    className={`room-btn ${selectedRooms === room.id ? 'room-btn--active' : ''}`}
                    onClick={() => { setSelectedRooms(selectedRooms === room.id ? '' : room.id); setPage(1); }}
                  >
                    {room.value}
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RESULTS & RESET ROW */}
        <div className="results-row">
          <span className="results-count">{pagination?.total || 0} apartments found</span>
          <button type="button" className="reset-btn" onClick={handleReset}>Reset filters</button>
        </div>

        {/* BANNER CARD */}
        <div className="complex-banner">
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h3 className="banner-title">Get More Information</h3>
            <div className="banner-actions">
              <a href="tel:+994502772662" className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Get a Consultation</span>
              </a>
              <a href="tel:+994502772662" className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <line x1="9" y1="22" x2="9" y2="16"/>
                  <line x1="15" y1="22" x2="15" y2="16"/>
                  <line x1="9" y1="16" x2="15" y2="16"/>
                  <path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01"/>
                </svg>
                <span>More About the Residential Complex</span>
              </a>
            </div>
          </div>
        </div>

        {/* APARTMENT CARDS GRID */}
        <div style={{ position: 'relative', minHeight: '300px' }}>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .spinner-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.6); display: flex; justify-content: center; align-items: flex-start; padding-top: 80px; z-index: 10; border-radius: 12px; }
            .spinner-icon { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3F4249; border-radius: 50%; animation: spin 1s linear infinite; }
          `}</style>
          
          {showSpinner && (
            <div className="spinner-overlay">
              <div className="spinner-icon"></div>
            </div>
          )}
          
          <div className="cards-grid" style={{ opacity: showSpinner ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: '300px' }}>
            {layouts.map((layout: UnitLayout) => (
              <Link key={layout.id} href={`/${locale}/off-plan/${layout.slug}`} className="layout-card-wrapper">
                <div className="layout-card">
                  <div className="layout-card__header">
                    <div className="layout-card__title-block">
                      <span className="layout-card__code">{getCardCode(layout)}</span>
                      <span className="layout-card__floor">{layout.floor} floor</span>
                    </div>
                    <div className="layout-card__number-block">
                      <span className="layout-card__number">N° {layout.number || layout.id.slice(-2)}</span>
                      <span className="layout-card__status">{formatStatus(layout.statusOption?.value || '')}</span>
                    </div>
                  </div>
                  
                  <div className="layout-card__visual">
                    {layout.mainImage ? (
                      <img src={getAssetUrl(layout.mainImage.url)} alt={layout.mainImage.alt || layout.title} className="layout-card__blueprint" />
                    ) : (
                      <div className="layout-card__blueprint layout-card__blueprint--placeholder">
                        <span>No image</span>
                      </div>
                    )}
                  </div>

                  <div className="layout-card__footer">
                    <h2 className="layout-card__name">{layout.title}, {layout.totalArea} m²</h2>
                    <span className="layout-card__price">{formatPrice(layout.prices, currency)}</span>
                  </div>
                </div>
                <span className="layout-card__cta">VIew Apartment DetaIls</span>
              </Link>
            ))}
            {layouts.length === 0 && !showSpinner && (
              <div className="empty-state">
                <p>No apartments found matching your filters.</p>
              </div>
            )}
          </div>
        </div>

        {pagination && (
          <div className="pagination-mobile">
            <span className="pagination-shown">
              Shown {Math.min(layouts.length, pagination.total)} out of {pagination.total}
            </span>
            <div className="pagination-progress">
              <div
                className="pagination-progress__fill"
                style={{ width: `${pagination.total ? (Math.min(layouts.length, pagination.total) / pagination.total) * 100 : 0}%` }}
              ></div>
            </div>
            {page < pagination.totalPages && (
              <button type="button" className="pagination-show-more" onClick={() => setPage((p) => p + 1)}>
                Show more
              </button>
            )}
          </div>
        )}
    </section>
  );
}
