'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import PropertyInfoCards from './PropertyInfoCards';
import { useResaleApartmentBySlug } from '@/hooks/use-resale-apartments';
import './resale-detail.css';

export default function ResaleDetailPage() {
  const params = useParams();
  const slug = params?.id as string;
  const locale = (params?.locale as string) || 'az';

  const { data: apartment, isLoading, error } = useResaleApartmentBySlug(slug);

  const [showPhone, setShowPhone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  if (isLoading) {
    return (
      <div className="pdet-page-wrapper">
        <Navbar variant="solid" />
        <main className="pdet-main-wrapper">
          <PageContainer>
            <div className="py-16 text-center text-white/50">Loading...</div>
          </PageContainer>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="pdet-page-wrapper">
        <Navbar variant="solid" />
        <main className="pdet-main-wrapper">
          <PageContainer>
            <div className="py-16 text-center text-white/50">Apartment not found</div>
          </PageContainer>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const gallery: string[] = apartment.gallery?.length
    ? apartment.gallery.map((g: any) => g.url || g)
    : [apartment.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop'];

  const mainImage = gallery[activeThumb] || gallery[0];
  const extraCount = Math.max(0, gallery.length - 5);
  const formatPrice = (p: number) => p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const title = `${apartment.roomCount}-ROOM FLAT, ${apartment.area} M², ${apartment.floorFrom}/${apartment.floorTo} FLOOR`;

  return (
    <div className="pdet-page-wrapper">
      <Navbar variant="solid" />
      <main className="pdet-main-wrapper">
        <PageContainer>
          <nav className="pdet-breadcrumb">
            <Link href={`/${locale}`} className="pdet-breadcrumb-link">Main</Link>
            <span className="pdet-breadcrumb-sep">/</span>
            <Link href={`/${locale}/resale`} className="pdet-breadcrumb-link">Resale</Link>
            <span className="pdet-breadcrumb-sep">/</span>
            <span className="pdet-breadcrumb-current">N° {apartment.slug || apartment.id.slice(0, 6)}</span>
          </nav>

          <div className="pdet-container">
            <div className="pdet-main-grid">
              <div className="pdet-gallery-pane">
                <div className="pdet-image-wrapper">
                  <img
                    src={mainImage}
                    alt={title}
                    className="pdet-main-img"
                  />
                  <div className="pdet-mobile-counter">{activeThumb + 1}/{gallery.length}</div>
                </div>

                <div className="pdet-thumbnails-grid">
                  {gallery.slice(0, 4).map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className={`pdet-thumb-box ${activeThumb === idx ? 'active' : ''}`}
                      onClick={() => setActiveThumb(idx)}
                    >
                      <img src={img} alt={`View ${idx + 1}`} />
                    </div>
                  ))}
                  {gallery.length > 5 && (
                    <div className="pdet-thumb-box pdet-thumb-overlay" onClick={() => setActiveThumb(4)}>
                      <img src={gallery[4]} alt="More views" />
                      <div className="pdet-overlay-text">+{extraCount} photos</div>
                    </div>
                  )}
                </div>

                <div className="pdet-content-footer pdet-content-footer--desktop">
                  <div className="pdet-desc-block">
                    <h1 className="pdet-main-title">{title}</h1>
                    <p className="pdet-address-line">{apartment.locationTitle || '—'}</p>
                  </div>

                  <div className="pdet-price-block">
                    <div className="pdet-price-tag">{formatPrice(apartment.priceTotal)} AZN</div>
                    <div className="pdet-sqm-badge">{formatPrice(apartment.priceByArea)} AZN/m²</div>
                  </div>
                </div>

                <PropertyInfoCards apartment={apartment} />
              </div>

              <div className="pdet-sidebar-pane">
                <div className="pdet-action-widget">
                  <button type="button" className="pdet-widget-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    <span>Share</span>
                  </button>
                  <div className="pdet-widget-divider"></div>
                  <button
                    type="button"
                    className={`pdet-widget-btn ${isSaved ? 'saved' : ''}`}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <div className="pdet-agent-card">
                  <div className="pdet-agent-header">
                    <div className="pdet-agent-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="pdet-agent-info">
                      <h3 className="pdet-agent-name">
                        {apartment.owner ? `${apartment.owner.firstName} ${apartment.owner.lastName}` : 'Owner'}
                      </h3>
                      <span className="pdet-agent-role">{apartment.owner?.profession || 'Owner'}</span>
                    </div>
                  </div>

                  <div className="pdet-agent-actions">
                    <button
                      type="button"
                      className="pdet-btn-primary"
                      onClick={() => setShowPhone(!showPhone)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{showPhone ? (apartment.owner?.phoneNumber || '—') : 'View phone number'}</span>
                    </button>

                    <button type="button" className="pdet-btn-secondary">
                      Request a call
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pdet-content-footer pdet-content-footer--mobile">
              <div className="pdet-desc-block">
                <h1 className="pdet-main-title">{title}</h1>
                <p className="pdet-address-line">{apartment.locationTitle || '—'}</p>
              </div>

              <div className="pdet-price-block">
                <div className="pdet-price-tag">{formatPrice(apartment.priceTotal)} AZN</div>
                <div className="pdet-sqm-badge">{formatPrice(apartment.priceByArea)} AZN/m²</div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>
      <HomeFooter />
    </div>
  );
}
