'use client';

import React, { useState } from 'react';
import type { ResaleApartment } from '@/lib/resale.types';
import './property-info-cards.css';

interface PropertyInfoCardsProps {
  apartment: ResaleApartment;
}

export default function PropertyInfoCards({ apartment }: PropertyInfoCardsProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Viewing request submitted:', { name, phone });
  };

  return (
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
          {apartment.attributes && apartment.attributes.length > 0 ? (
            apartment.attributes.map((attr, idx) => (
              <div key={attr.id} className={`ap-details-item ${idx >= 4 ? 'ap-desktop-only' : ''}`}>
                <div className="ap-icon-box">
                  {attr.icon ? (
                    <img src={attr.icon} alt="" width="18" height="18" />
                  ) : (
                    <span className="ap-icon-hash">#</span>
                  )}
                </div>
                <div className="ap-details-content">
                  <span className="ap-details-label">{attr.title}</span>
                  <span className="ap-details-value">{attr.value || '—'}</span>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="ap-details-item">
                <div className="ap-icon-box">
                  <img src="/images/resale/img1.png" alt="" width="18" height="18" />
                </div>
                <div className="ap-details-content">
                  <span className="ap-details-label">Object Code</span>
                  <span className="ap-details-value">{apartment.slug || '—'}</span>
                </div>
              </div>
              <div className="ap-details-item">
                <div className="ap-icon-box">
                  <img src="/images/resale/img2.png" alt="" width="18" height="18" />
                </div>
                <div className="ap-details-content">
                  <span className="ap-details-label">Property Size</span>
                  <span className="ap-details-value">{apartment.area} m²</span>
                </div>
              </div>
              <div className="ap-details-item">
                <div className="ap-icon-box">
                  <img src="/images/resale/img3.png" alt="" width="18" height="18" />
                </div>
                <div className="ap-details-content">
                  <span className="ap-details-label">Number of Floors</span>
                  <span className="ap-details-value">{apartment.floorFrom} out of {apartment.floorTo}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <button type="button" className="ap-show-more-link ap-mobile-only">
          Show more
        </button>
      </section>

      <section className="ap-info-card">
        <h2 className="ap-info-title">Request a Viewing</h2>
        <p className="ap-viewing-desc">
          A real estate consultant will confirm your appointment shortly to coordinate the meeting and provide a comprehensive guided tour.
        </p>

        <form onSubmit={handleSubmit} className="ap-viewing-form">
          <input 
            type="text" 
            placeholder="Your Name" 
            className="ap-form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <div className="ap-phone-group">
            <div className="ap-flag-selector">
              <span className="ap-flag-emoji">🇦🇿</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <input 
              type="tel" 
              placeholder="+994" 
              className="ap-form-input ap-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="ap-submit-btn">
            Send request
          </button>
        </form>
      </section>

    </div>
  );
}
