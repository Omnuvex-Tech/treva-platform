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
          <div className="ap-details-item">
            <div className="ap-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
                <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
              </svg>
            </div>
            <div className="ap-details-content">
              <span className="ap-details-label">Object Code</span>
              <span className="ap-details-value">{apartment.slug || '—'}</span>
            </div>
          </div>

          <div className="ap-details-item">
            <div className="ap-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </div>
            <div className="ap-details-content">
              <span className="ap-details-label">Property Size</span>
              <span className="ap-details-value">{apartment.area} m²</span>
            </div>
          </div>

          <div className="ap-details-item">
            <div className="ap-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 7 16 7 16 12 10 12 10 17 2 17"/>
                <path d="M2 17v4h20v-14z" opacity="0.1" fill="currentColor"/>
              </svg>
            </div>
            <div className="ap-details-content">
              <span className="ap-details-label">Number of Floors</span>
              <span className="ap-details-value">{apartment.floorFrom} out of {apartment.floorTo}</span>
            </div>
          </div>

          <div className="ap-details-item">
            <div className="ap-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div className="ap-details-content">
              <span className="ap-details-label">Renovation</span>
              <span className="ap-details-value">{apartment.renovation || '—'}</span>
            </div>
          </div>

          <div className="ap-details-item ap-desktop-only">
            <div className="ap-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="ap-details-content">
              <span className="ap-details-label">Kitchen Size</span>
              <span className="ap-details-value">{apartment.kitchenSize ? `${apartment.kitchenSize} m²` : '—'}</span>
            </div>
          </div>

          <div className="ap-details-item ap-desktop-only">
            <div className="ap-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="12" y1="3" x2="12" y2="21"/>
              </svg>
            </div>
            <div className="ap-details-content">
              <span className="ap-details-label">Wall Material</span>
              <span className="ap-details-value">{apartment.wallMaterial || '—'}</span>
            </div>
          </div>
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
