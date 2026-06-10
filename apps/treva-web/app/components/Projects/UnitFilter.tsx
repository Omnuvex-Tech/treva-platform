'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUnitLayouts } from '@/hooks/use-unit-layouts';
import { getAssetUrl } from '@/lib/asset-url';
import type { UnitLayout } from '@/lib/unit-layout.types';
import './unit-filter.css';

export default function UnitLayout() {
  const params = useParams();
  const locale = params?.locale || 'az';

  const [currency, setCurrency] = useState('USD');
  const [floor, setFloor] = useState('');
  const [view, setView] = useState('');
  const [status, setStatus] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string>('');

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(1500000);
  const totalPriceMin = 0;
  const totalPriceMax = 1500000;

  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(600);
  const totalAreaMin = 0;
  const totalAreaMax = 600;

  const [page, setPage] = useState(1);
  const limit = 12;

  const roomOptions = ['S', '1', '2', '3', '4+'];

  const filters = useMemo(() => ({
    page,
    limit,
    ...(floor && { floor: parseInt(floor) }),
    ...(view && { view }),
    ...(status && { status: status.toLowerCase() }),
    ...(priceMin > 0 && { minPrice: priceMin }),
    ...(priceMax < totalPriceMax && { maxPrice: priceMax }),
    ...(areaMin > 0 && { minArea: areaMin }),
    ...(areaMax < totalAreaMax && { maxArea: areaMax }),
  }), [page, floor, view, status, priceMin, priceMax, areaMin, areaMax]);

  const { data: response, isLoading } = useUnitLayouts(filters);

  const layouts = response?.data || [];
  const pagination = response?.pagination;

  const priceLeftPercent = ((priceMin - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;
  const priceRightPercent = 100 - ((priceMax - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;

  const areaLeftPercent = ((areaMin - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;
  const areaRightPercent = 100 - ((areaMax - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatPrice = (price: number) => {
    return `$${formatNumber(price)}`;
  };

  const handleReset = () => {
    setFloor('');
    setView('');
    setStatus('');
    setSelectedRooms('');
    setPriceMin(0);
    setPriceMax(totalPriceMax);
    setAreaMin(0);
    setAreaMax(totalAreaMax);
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
                    value={formatNumber(priceMin)} 
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\s+/g, ''));
                      if (!isNaN(val)) setPriceMin(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={formatNumber(priceMax)} 
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\s+/g, ''));
                      if (!isNaN(val)) setPriceMax(val);
                    }}
                  />
                </div>
              </div>
              
              <div className="select-wrapper currency-select">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="AZN">AZN</option>
                  <option value="EUR">EUR</option>
                </select>
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
                value={priceMin}
                className="thumb thumb--left"
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceMax - 1000);
                  setPriceMin(val);
                }}
              />
              <input 
                type="range" 
                min={totalPriceMin} 
                max={totalPriceMax} 
                value={priceMax}
                className="thumb thumb--right"
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceMin + 1000);
                  setPriceMax(val);
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
                    value={areaMin} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setAreaMin(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={areaMax} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setAreaMax(val);
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
                  value={areaMin}
                  className="thumb thumb--left"
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), areaMax - 5);
                    setAreaMin(val);
                  }}
                />
                <input 
                  type="range" 
                  min={totalAreaMin} 
                  max={totalAreaMax} 
                  value={areaMax}
                  className="thumb thumb--right"
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), areaMin + 5);
                    setAreaMax(val);
                  }}
                />
              </div>
            </div>

            <div className="filter-group filter-group--floor">
              <label className="filter-label">Floor</label>
              <div className="select-wrapper">
                <select value={floor} onChange={(e) => { setFloor(e.target.value); setPage(1); }}>
                  <option value="">All</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </div>

          {/* View & Status Wrapper */}
          <div className="mobile-flex-row filter-group--view-status">
            <div className="filter-group filter-group--view">
              <label className="filter-label">View</label>
              <div className="select-wrapper">
                <select value={view} onChange={(e) => { setView(e.target.value); setPage(1); }}>
                  <option value="">All</option>
                  <option value="Sea view">Sea view</option>
                  <option value="City view">City view</option>
                  <option value="Garden view">Garden view</option>
                </select>
              </div>
            </div>

            <div className="filter-group filter-group--status">
              <label className="filter-label">Status</label>
              <div className="select-wrapper">
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Number of Rooms Filter */}
          <div className="filter-group filter-group--rooms">
            <label className="filter-label">Number of rooms</label>
            <div className="rooms-group">
              {roomOptions.map((room) => (
                <button
                  key={room}
                  type="button"
                  className={`room-btn ${selectedRooms === room ? 'room-btn--active' : ''}`}
                  onClick={() => setSelectedRooms(selectedRooms === room ? '' : room)}
                >
                  {room}
                </button>
              ))}
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
            <h3 className="banner-title">Panorama by ELIE SAAB</h3>
            <div className="banner-actions">
              <button className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Get a Consultation</span>
              </button>
              <button className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <line x1="9" y1="22" x2="9" y2="16"/>
                  <line x1="15" y1="22" x2="15" y2="16"/>
                  <line x1="9" y1="16" x2="15" y2="16"/>
                  <path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01"/>
                </svg>
                <span>More About the Residential Complex</span>
              </button>
            </div>
          </div>
        </div>

        {/* APARTMENT CARDS GRID */}
        {isLoading ? (
          <div className="loading-state">
            <p>Loading apartments...</p>
          </div>
        ) : (
          <div className="cards-grid">
            {layouts.map((layout: UnitLayout) => (
              <div key={layout.id} className="layout-card-wrapper">
                <div className="layout-card">
                  <div className="layout-card__header">
                    <div className="layout-card__title-block">
                      <span className="layout-card__code">{getCardCode(layout)}</span>
                      <span className="layout-card__floor">{layout.floor} floor</span>
                    </div>
                    <div className="layout-card__number-block">
                      <span className="layout-card__number">N° {layout.number || layout.id.slice(-2)}</span>
                      <span className="layout-card__status">{layout.status}</span>
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
                    <span className="layout-card__price">{formatPrice(layout.priceUsd)}</span>
                  </div>
                </div>
                <Link href={`/${locale}/off-plan/${layout.id}`} className="layout-card__cta">View Apartment Details</Link>
              </div>
            ))}
            {layouts.length === 0 && (
              <div className="empty-state">
                <p>No apartments found matching your filters.</p>
              </div>
            )}
          </div>
        )}

        {/* DESKTOP PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination-desktop">
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <span
                  key={p}
                  className={`pagination-num ${p === pagination.page ? 'pagination-num--active' : ''}`}
                  onClick={() => setPage(p)}
                  style={{ cursor: 'pointer' }}
                >
                  {p}
                </span>
              ))}
              {pagination.totalPages > 5 && (
                <>
                  <span className="pagination-dots">...</span>
                  <span
                    className="pagination-num"
                    onClick={() => setPage(pagination.totalPages)}
                    style={{ cursor: 'pointer' }}
                  >
                    {pagination.totalPages}
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              className="pagination-next-btn"
              aria-label="Next page"
              onClick={() => setPage(Math.min(page + 1, pagination.totalPages))}
              disabled={page >= pagination.totalPages}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        )}

        {/* MOBILE PAGINATION */}
        {pagination && (
          <div className="pagination-mobile">
            <span className="pagination-shown">
              Shown {Math.min(page * limit, pagination.total)} out of {pagination.total}
            </span>
            <div className="pagination-progress">
              <div
                className="pagination-progress__fill"
                style={{ width: `${(pagination.page / pagination.totalPages) * 100}%` }}
              ></div>
            </div>
            {page < pagination.totalPages && (
              <button type="button" className="pagination-show-more" onClick={() => setPage(page + 1)}>
                Show more
              </button>
            )}
          </div>
        )}
    </section>
  );
}
