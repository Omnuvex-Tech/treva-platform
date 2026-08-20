'use client';

import React from 'react';
import type { ResaleApartment } from '@/lib/resale.types';
import './property-info-cards.css';
import RequestViewingCard from './RequestViewingCard';
import RichHtml from '@/app/components/RichHtml/RichHtml';

interface PropertyInfoCardsProps {
  apartment: ResaleApartment;
  mapEmbedUrl?: string;
  locationTitle?: string;
  showViewingCard?: boolean;
  locale?: string;
}

/**
 * Kart başlıqları və standart təsvir mətni.
 * Əvvəl hamısı sabit ingiliscə idi — üç dilin hamısında ingilis görünürdü.
 */
const infoDictionary = {
  az: {
    about: 'Mənzil haqqında',
    details: 'Mənzilin detalları',
    location: 'Yerləşmə',
    showMore: 'Daha çox',
    mapLabel: 'Mənzilin xəritədə yeri',
    fallbackDescription:
      'Şəhərin ən köklü və tələb olunan yaşayış rayonlarından birində yerləşir — prestij və şəhər əlçatanlığının balansı.',
  },
  en: {
    about: 'About the Apartment',
    details: 'Apartment Details',
    location: 'Location',
    showMore: 'Show more',
    mapLabel: 'Resale property location map',
    fallbackDescription:
      "Situated in one of the city's most established and sought-after residential districts, providing a perfect balance of prestige and urban connectivity.",
  },
  ru: {
    about: 'О квартире',
    details: 'Детали квартиры',
    location: 'Расположение',
    showMore: 'Показать ещё',
    mapLabel: 'Расположение объекта на карте',
    fallbackDescription:
      'Расположена в одном из самых престижных и востребованных жилых районов города — идеальный баланс статуса и городской доступности.',
  },
} as const;

export default function PropertyInfoCards({ apartment, mapEmbedUrl, locationTitle, showViewingCard = true, locale = 'az' }: PropertyInfoCardsProps) {
  const t = infoDictionary[locale as keyof typeof infoDictionary] ?? infoDictionary.az;

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
        <h2 className="ap-info-title">{t.about}</h2>
        
        <div className="ap-about-section">
          <RichHtml
            className="ap-about-text"
            html={apartment.description || 'Situated in one of the city\'s most established and sought-after residential districts, providing a perfect balance of prestige and urban connectivity.'}
          />
        </div>

        <button type="button" className="ap-show-more-link" style={{ display: 'none' }}>
          {t.showMore}
        </button>
      </section>

      <section className="ap-info-card">
        <h2 className="ap-info-title">{t.details}</h2>
        
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
          {t.showMore}
        </button>
      </section>

      {mapEmbedUrl && (
        <section className="ap-info-card ap-map-card">
          <h2 className="ap-info-title">{t.location}</h2>
          {locationTitle && <p className="ap-map-address">{locationTitle}</p>}
          <div className="ap-map-frame-wrap">
            <iframe
              src={mapEmbedUrl}
              className="ap-map-frame"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t.mapLabel}
            />
          </div>
        </section>
      )}

      {showViewingCard && <RequestViewingCard />}

    </div>
    </>
  );
}
