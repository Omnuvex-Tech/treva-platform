'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import { useUnitLayoutBySlug } from '@/hooks/use-unit-layouts';
import { useCurrencies } from '@/hooks/use-currencies';
import { getAssetUrl } from '@/lib/asset-url';
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

  const statusClass = (statusValue: string) => {
    switch (statusValue?.toLowerCase()) {
      case 'available': return 'badge-available';
      case 'sold': return 'badge-sold';
      case 'reserved': return 'badge-reserved';
      default: return '';
    }
  };

  const formatStatus = (statusValue: string) => {
    return statusValue ? statusValue.charAt(0).toUpperCase() + statusValue.slice(1) : '';
  };

  const handleShare = () => {
    if (layout?.location?.url) {
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
                    <span className={`apt-badge ${statusClass(layout.statusOption?.value || '')}`}>
                      <span className="apt-badge__text">{formatStatus(layout.statusOption?.value || '')}</span>
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
        </PageContainer>
      </main>
      <HomeFooter />
    </div>
  );
}