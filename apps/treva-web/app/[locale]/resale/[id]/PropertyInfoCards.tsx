'use client';

import React from 'react';
import type { ResaleApartment } from '@/lib/resale.types';
import './property-info-cards.css';
import RequestViewingCard from './RequestViewingCard';

interface PropertyInfoCardsProps {
  apartment: ResaleApartment;
  mapEmbedUrl?: string;
  locationTitle?: string;
  showViewingCard?: boolean;
}

export default function PropertyInfoCards({ apartment, mapEmbedUrl, locationTitle, showViewingCard = true }: PropertyInfoCardsProps) {

  const fallbackIcons = [
    '/images/resale/img1.png',
    '/images/resale/img2.png',
    '/images/resale/img3.png',
    '/images/resale/img4.png',
    '/images/resale/img5.png',
    '/images/resale/img6.png',
  ];

  return (
    <>
    <div className="ap-info-container">
      
      <section className="ap-info-card">
        <h2 className="ap-info-title">About the Apartment</h2>
        
        <div className="ap-about-section">
          <p className="ap-about-text"
            dangerouslySetInnerHTML={{
              __html: apartment.description || 'Situated in one of the city\'s most established and sought-after residential districts, providing a perfect balance of prestige and urban connectivity.'
            }}
          />
        </div>

        <button type="button" className="ap-show-more-link" style={{ display: 'none' }}>
          Show more
        </button>
      </section>

      <section className="ap-info-card">
        <h2 className="ap-info-title">Apartment Details</h2>
        
        <div className="ap-details-grid">
          {(apartment.attributes || []).map((attr, index) => (
            <div className={`ap-details-item ${index >= 4 ? 'ap-desktop-only' : ''}`} key={attr.id}>
              <div className="ap-icon-box">
                <img src={attr.icon || fallbackIcons[index]} alt="" width="19" height="19" />
              </div>
              <div className="ap-details-content">
                <span className="ap-details-label">{attr.title}</span>
                <span className="ap-details-value">{attr.value}</span>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="ap-show-more-link ap-mobile-only">
          Show more
        </button>
      </section>

      {mapEmbedUrl && (
        <section className="ap-info-card ap-map-card">
          <h2 className="ap-info-title">Location</h2>
          {locationTitle && <p className="ap-map-address">{locationTitle}</p>}
          <div className="ap-map-frame-wrap">
            <iframe
              src={mapEmbedUrl}
              className="ap-map-frame"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Resale Property Location Map"
            />
          </div>
        </section>
      )}

      {showViewingCard && <RequestViewingCard />}

    </div>
    </>
  );
}
