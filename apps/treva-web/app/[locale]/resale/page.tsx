'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import CallbackForm from '@/app/components/Home/Callback/CallbackForm';
import PageContainer from '@/app/components/Container/PageContainer';
import ResaleFilter, { ResaleFilterState } from './ResaleFilter';
import { useResaleApartments, useResaleApartmentTypes } from '@/hooks/use-resale-apartments';
import type { ResaleApartment } from '@/lib/resale.types';
import './resale-listing.css';

export default function ResalePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ResaleFilterState>({});
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const { data: apartmentTypes } = useResaleApartmentTypes();

  const { data: response, isLoading, isFetching } = useResaleApartments({
    ...filters,
    apartmentTypeId: selectedTypeId || undefined,
    page,
    limit: 12,
  });

  const apartments = response?.data ?? [];
  const pagination = response?.pagination;
  const showSpinner = isLoading || isFetching || isDebouncing;

  const toggleSave = (id: string) => {
    setSavedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFilterChange = useCallback((f: ResaleFilterState) => {
    setFilters(f);
    setPage(1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="re-page-wrapper">
      <Navbar variant="solid" />
      <main className="re-main-wrapper">
        <PageContainer>
          <ResaleFilter onFilterChange={handleFilterChange} totalCount={pagination?.total ?? 0} onDebouncingChange={setIsDebouncing} />

          <header className="re-header">
            <h1 className="re-main-title">PURCHASE APARTMENTS IN BAKU</h1>

            <div className="re-controls-row">
              <div className="re-property-count">{pagination?.total ?? 0} properties</div>

              <div className="re-sort-wrapper">
                <span className="re-sort-label">Sort:</span>
                <div className="re-sort-dropdown" ref={typeDropdownRef}>
                  <button
                    type="button"
                    className="re-sort-trigger"
                    onClick={() => setTypeDropdownOpen((p) => !p)}
                  >
                    <span>{selectedTypeId ? (apartmentTypes?.find((t: any) => t.id === selectedTypeId)?.title || 'Type') : 'Recommended'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  {typeDropdownOpen && (
                    <div className="re-sort-dropdown-menu">
                      <button
                        type="button"
                        className={`re-sort-dropdown-item ${!selectedTypeId ? 're-sort-dropdown-item--active' : ''}`}
                        onClick={() => { setSelectedTypeId(''); setTypeDropdownOpen(false); setPage(1); }}
                      >
                        Recommended
                      </button>
                      {apartmentTypes?.map((t: any) => (
                        <button
                          key={t.id}
                          type="button"
                          className={`re-sort-dropdown-item ${selectedTypeId === t.id ? 're-sort-dropdown-item--active' : ''}`}
                          onClick={() => { setSelectedTypeId(t.id); setTypeDropdownOpen(false); setPage(1); }}
                        >
                          {t.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="py-16 text-center text-white/50">Loading...</div>
          ) : apartments.length === 0 && !showSpinner ? (
            <div className="py-16 text-center text-white/50">No apartments found</div>
          ) : (
            <div style={{ position: 'relative', minHeight: '300px' }}>
              <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .re-spinner-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                  background: rgba(255, 255, 255, 0.6); display: flex; justify-content: center;
                  align-items: flex-start; padding-top: 80px; z-index: 10; border-radius: 12px; }
                .re-spinner-icon { width: 40px; height: 40px; border: 4px solid #f3f3f3;
                  border-top: 4px solid #3F4249; border-radius: 50%; animation: spin 1s linear infinite; }
              `}</style>

              {showSpinner && (
                <div className="re-spinner-overlay">
                  <div className="re-spinner-icon"></div>
                </div>
              )}

              <main className="re-grid" style={{ opacity: showSpinner ? 0.5 : 1, transition: 'opacity 0.2s', minHeight: '300px' }}>
                {apartments.map((apt) => (
                  <div key={apt.id} className="re-card-wrapper">
                    <article className="re-card">
                      <div className="re-card-media">
                        <img
                          src={apt.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'}
                          alt={apt.locationTitle || apt.title}
                          className="re-card-img"
                        />
                      </div>

                      <div className="re-card-body">
                        <div className="re-card-meta-row">
                          <span className="re-badge">{apt.apartmentType?.title || ''}</span>
                          <button
                            type="button"
                            className={`re-bookmark-btn ${savedItems.includes(apt.id) ? 'active' : ''}`}
                            onClick={() => toggleSave(apt.id)}
                            aria-label="Save listing"
                          >
                            <svg width="15" height="30" viewBox="0 0 20 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2 0C0.89543 0 0 0.89543 0 2V24.5L10 19L20 24.5V2C20 0.89543 19.1046 0 18 0H2Z"/>
                            </svg>
                          </button>
                        </div>

                        <div className="re-price-block">
                          <h2 className="re-main-price">{formatPrice(getAptPrice(apt, 'total'))} {getAptCurrencyValue(apt)}</h2>
                          <div className="re-sqm-price">{formatPrice(getAptPrice(apt, 'byArea'))} {getAptCurrencyValue(apt)}/m²</div>
                        </div>

                        <div className="re-tags-row">
                          <span className="re-tag">{apt.roomCount}-room sq.</span>
                          <span className="re-tag">{apt.area} m²</span>
                          <span className="re-tag">{apt.floorFrom}/{apt.floorTo} floor</span>
                        </div>

                        <p className="re-address">{apt.locationTitle || '—'}</p>
                      </div>
                    </article>

                    <Link href={`/${locale}/resale/${apt.slug}`} className="re-action-btn">
                      VIew Apartment DetaIls
                    </Link>
                  </div>
                ))}
              </main>
            </div>
          )}

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
      <CallbackForm />
      <HomeFooter />
    </div>
  );
}
