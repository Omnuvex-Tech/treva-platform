'use client';

import React, { useState } from 'react';
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
 * Mobil ekranda ilk bu qədər detal göstərilir, qalanı "Daha çox" ilə açılır.
 * `ap-desktop-only` sinfi yalnız mobil media sorğusunda gizlədir — masaüstündə
 * bütün detallar onsuz da görünür.
 */
const MOBILE_VISIBLE_DETAILS = 4;

/**
 * Kart başlıqları.
 * Əvvəl hamısı sabit ingiliscə idi — üç dilin hamısında ingilis görünürdü.
 */
const infoDictionary = {
  az: {
    about: 'Mənzil haqqında',
    details: 'Mənzilin detalları',
    location: 'Yerləşmə',
    showMore: 'Daha çox',
    showLess: 'Daha az',
    mapLabel: 'Mənzilin xəritədə yeri',
  },
  en: {
    about: 'About the Apartment',
    details: 'Apartment Details',
    location: 'Location',
    showMore: 'Show more',
    showLess: 'Show less',
    mapLabel: 'Resale property location map',
  },
  ru: {
    about: 'О квартире',
    details: 'Детали квартиры',
    location: 'Расположение',
    showMore: 'Показать ещё',
    showLess: 'Свернуть',
    mapLabel: 'Расположение объекта на карте',
  },
} as const;

/** HTML təsvirin içi boşdursa (yalnız teqlər, &nbsp; və s.) bölmə göstərilmir. */
function hasVisibleText(html?: string) {
  if (!html) return false;
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0;
}

export default function PropertyInfoCards({ apartment, mapEmbedUrl, locationTitle, showViewingCard = true, locale = 'az' }: PropertyInfoCardsProps) {
  const t = infoDictionary[locale as keyof typeof infoDictionary] ?? infoDictionary.az;
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const fallbackIcons = [
    '/images/resale/img1.png',
    '/images/resale/img2.png',
    '/images/resale/img3.png',
    '/images/resale/img4.png',
    '/images/resale/img5.png',
    '/images/resale/img6.png',
  ];

  const attributes = apartment.attributes || [];
  // Boş bölmə başlıq kimi qalmasın: mətn yoxdursa kart tamamilə çıxarılır.
  const showAbout = hasVisibleText(apartment.description);
  const showDetails = attributes.length > 0;
  const showLocation = Boolean(mapEmbedUrl);
  // Düymə yalnız mobildə gizlənən detal varsa mənalıdır.
  const hasHiddenDetails = attributes.length > MOBILE_VISIBLE_DETAILS;

  return (
    <>
    <div className="ap-info-container">

      {showAbout && (
        <section className="ap-info-card">
          <h2 className="ap-info-title">{t.about}</h2>

          <div className="ap-about-section">
            <RichHtml className="ap-about-text" html={apartment.description!} />
          </div>
        </section>
      )}

      {showDetails && (
        <section className="ap-info-card">
          <h2 className="ap-info-title">{t.details}</h2>

          <div className="ap-details-grid">
            {attributes.map((attr, index) => (
              <div
                className={`ap-details-item ${index >= MOBILE_VISIBLE_DETAILS && !detailsExpanded ? 'ap-desktop-only' : ''}`}
                key={attr.id}
              >
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

          {hasHiddenDetails && (
            <button
              type="button"
              className="ap-show-more-link ap-mobile-only"
              aria-expanded={detailsExpanded}
              onClick={() => setDetailsExpanded(v => !v)}
            >
              {detailsExpanded ? t.showLess : t.showMore}
            </button>
          )}
        </section>
      )}

      {showLocation && (
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
