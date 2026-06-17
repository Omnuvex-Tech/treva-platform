'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import ResaleFilter, { ResaleFilterState } from './ResaleFilter';
import { useResaleApartments } from '@/hooks/use-resale-apartments';
import './resale-listing.css';

export default function ResalePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ResaleFilterState>({});

  const { data: response, isLoading } = useResaleApartments({
    ...filters,
    page,
    limit: 12,
  });

  const apartments = response?.data ?? [];
  const pagination = response?.pagination;

  const toggleSave = (id: string) => {
    setSavedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFilterChange = useCallback((f: ResaleFilterState) => {
    setFilters(f);
    setPage(1);
  }, []);

  const formatPrice = (p: number) =>
    p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return (
    <div className="re-page-wrapper">
      <Navbar variant="solid" />
      <main className="re-main-wrapper">
        <PageContainer>
          <ResaleFilter onFilterChange={handleFilterChange} totalCount={pagination?.total ?? 0} />

          <header className="re-header">
            <h1 className="re-main-title">PURCHASE APARTMENTS IN BAKU</h1>

            <div className="re-controls-row">
              <div className="re-property-count">{pagination?.total ?? 0} properties</div>

              <div className="re-sort-wrapper">
                <span className="re-sort-label">Sort:</span>
                <div className="re-sort-dropdown">
                  <span>Recommended</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="py-16 text-center text-white/50">Loading...</div>
          ) : apartments.length === 0 ? (
            <div className="py-16 text-center text-white/50">No apartments found</div>
          ) : (
            <main className="re-grid">
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
                        <h2 className="re-main-price">{formatPrice(apt.priceTotal)} AZN</h2>
                        <div className="re-sqm-price">{formatPrice(apt.priceByArea)} AZN/m²</div>
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
      <HomeFooter />
    </div>
  );
}
