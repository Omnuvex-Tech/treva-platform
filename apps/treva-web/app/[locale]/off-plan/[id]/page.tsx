'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import { useUnitLayoutBySlug, useUnitLayouts } from '@/hooks/use-unit-layouts';
import { useCurrencies } from '@/hooks/use-currencies';
import { getAssetUrl } from '@/lib/asset-url';
import type { UnitLayout } from '@/lib/unit-layout.types';
import "../off-plan.css";
import "./apartment-card.css";
import "./panorama-card.css";
import "./similar-apartments.css";

export default function ApartmentCard() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const locale = params?.locale || 'az';

  const { data: layout, isLoading, error } = useUnitLayoutBySlug(id);
  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData || [];

  const [currency, setCurrency] = useState('USD');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'available': return 'badge-available';
      case 'sold': return 'badge-sold';
      case 'reserved': return 'badge-reserved';
      default: return '';
    }
  };

  const formatStatus = (status: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
  };

  const handleShare = () => {
    if (layout.location?.url) {
      window.open(layout.location.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <Navbar variant="solid" />
        <main className="main-wrapper">
          <PageContainer>
            <div className="loading-state" style={{ padding: '64px 0', textAlign: 'center' }}>
              <p style={{ color: '#6d717a' }}>Loading...</p>
            </div>
          </PageContainer>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="page-wrapper">
        <Navbar variant="solid" />
        <main className="main-wrapper">
          <PageContainer>
            <div className="loading-state" style={{ padding: '64px 0', textAlign: 'center' }}>
              <p style={{ color: '#6d717a' }}>Apartment not found</p>
              <Link href={`/${locale}/off-plan`} style={{ color: '#3F4249', marginTop: 16, display: 'inline-block' }}>
                ← Back to listings
              </Link>
            </div>
          </PageContainer>
        </main>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer>
          <div className="apt-wrapper">
            {/* Breadcrumbs */}
            <nav className="apt-breadcrumbs">
              <Link href={`/${locale}`}>Main</Link> <span className="apt-separator">/</span>
              <Link href={`/${locale}/off-plan`}>{layout.category?.title || 'Off Plan'}</Link> <span className="apt-separator">/</span>
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
                      No image
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Data and Details */}
              <div className="apt-details-section">
                <div className="apt-header">
                  <h1 className="apt-title">
                    {layout.title} <span className="apt-title-sub">Apartment</span>
                  </h1>
                  
                  <div className="apt-badge-row">
                    <span className={`apt-badge ${statusClass(layout.status)}`}>
                      <span className="apt-badge__text">{formatStatus(layout.status)}</span>
                    </span>
                    {layout.documents && layout.documents.length > 0 && layout.documents[0] && (
                      <a href={getAssetUrl(layout.documents[0].url)} target="_blank" rel="noopener noreferrer" className="apt-badge badge-btn">
                        <span className="apt-badge__text">PDF</span>
                      </a>
                    )}
                    <button type="button" className="apt-share-btn" aria-label="Share" onClick={handleShare}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="apt-specs-list">
                  <div className="apt-spec-item">
                    <span className="apt-label">Floor</span>
                    <span className="apt-value">{layout.floor}</span>
                  </div>
                  <div className="apt-spec-item">
                    <span className="apt-label">Total Area</span>
                    <span className="apt-value">{layout.totalArea} m²</span>
                  </div>
                  <div className="apt-spec-item">
                    <span className="apt-label">Internal Area</span>
                    <span className="apt-value">{layout.internalArea} m²</span>
                  </div>
                  {layout.balconyArea && (
                    <div className="apt-spec-item">
                      <span className="apt-label">Balcony</span>
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
                        <path d="M6 9l6 6 6-6"/>
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
          </div>

          {/* Panorama Section */}
          <div className="panorama-section">
            <div className="panorama-banner">
              <div className="panorama-overlay"></div>
              <div className="panorama-content">
                <h3 className="panorama-title">{layout.category?.title || 'Panorama'}</h3>
                <div className="panorama-button-group">
                  <a href="tel:+994502772662" className="panorama-btn">
                    <svg className="panorama-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Get a Consultation
                  </a>
                  <a href="tel:+994502772662" className="panorama-btn">
                    <svg className="panorama-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                      <line x1="9" y1="22" x2="9" y2="16"/>
                      <line x1="15" y1="22" x2="15" y2="16"/>
                      <line x1="9" y1="16" x2="15" y2="16"/>
                      <path d="M9 6h.01"/>
                      <path d="M15 6h.01"/>
                      <path d="M9 10h.01"/>
                      <path d="M15 10h.01"/>
                    </svg>
                    More About the Residential Complex
                  </a>
                </div>
              </div>
            </div>

            <div className="panorama-info-table">
              {layout.location && (
                <div className="panorama-row">
                  <span className="panorama-label">Location</span>
                  <span className="panorama-value">{layout.location.title}</span>
                </div>
              )}
              
              {layout.location && (
                <div className="panorama-row">
                  <span className="panorama-label">Real Estate Type</span>
                  <span className="panorama-value">{layout.location.type}</span>
                </div>
              )}
              
              <div className="panorama-row">
                <span className="panorama-label">Year of Completion</span>
                <span className="panorama-value">{layout.completionYear}</span>
              </div>
              
              <div className="panorama-row">
                <span className="panorama-label">Number of Floors</span>
                <span className="panorama-value">From {layout.numberOfFloors.start} to {layout.numberOfFloors.end} Floors</span>
              </div>
            </div>
          </div>

          {/* Similar Apartments Section */}
          {layout.similarApartments && layout.similarApartments.length > 0 && (
            <div className="similar-section">
              <div className="similar-header">
                <h2 className="similar-title">
                  <span className="similar-title-thin">SIMILAR</span>
                  <span className="similar-title-bold">APARTMENTS</span>
                </h2>
              </div>

              <div className="similar-grid">
                {layout.similarApartments.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/${locale}/off-plan/${apt.slug}`}
                    className="layout-card"
                  >
                    <div className="layout-card__header">
                      <div className="layout-card__title-block">
                        <span className="layout-card__code">{apt.title}</span>
                        <span className="layout-card__floor">{apt.floor} floor</span>
                      </div>
                      <div className="layout-card__number-block">
                        <span className="layout-card__number">N° {apt.number || '?'}</span>
                        <span className="layout-card__status">{formatStatus(apt.status)}</span>
                      </div>
                    </div>
                    <div className="layout-card__visual">
                      {apt.mainImage ? (
                        <img
                          src={getAssetUrl(apt.mainImage.url)}
                          alt={apt.mainImage.alt || apt.title}
                          style={{ maxWidth: '100%', maxHeight: 260, objectFit: 'contain' }}
                        />
                      ) : (
                        <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
                          <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
                          <line x1="10" y1="110" x2="190" y2="110" stroke="#2b3541" strokeWidth="2"/>
                          <line x1="190" y1="10" x2="190" y2="170" stroke="#2b3541" strokeWidth="2"/>
                          <line x1="190" y1="170" x2="290" y2="170" stroke="#2b3541" strokeWidth="2"/>
                          <text x="100" y="60" fontFamily="Inter" fontSize="11" fill="#2b3541" textAnchor="middle" fontWeight="500">{apt.title}</text>
                          <text x="100" y="145" fontFamily="Inter" fontSize="10" fill="#8e949a" textAnchor="middle">{apt.totalArea} m²</text>
                        </svg>
                      )}
                    </div>
                    <div className="layout-card__footer">
                      <h2 className="layout-card__name">{apt.title}, {apt.totalArea} m²</h2>
                      <span className="layout-card__price">{currency} {formatNumber(apt.prices?.[currency] || 0)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="similar-spacer" />
        </PageContainer>
      </main>
      <HomeFooter />
    </div>
  );
}
