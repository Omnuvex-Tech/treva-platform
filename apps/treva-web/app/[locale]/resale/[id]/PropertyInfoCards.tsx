'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ResaleApartment } from '@/lib/resale.types';
import './property-info-cards.css';

interface PropertyInfoCardsProps {
  apartment: ResaleApartment;
}

export default function PropertyInfoCards({ apartment }: PropertyInfoCardsProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+994');
  const [countryFlag, setCountryFlag] = useState('/images/flags/az.png');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const flagRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flagRef.current && !flagRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countries = [
    { code: '+994', flag: '/images/flags/az.png', name: 'Azerbaijan' },
    { code: '+90', flag: '/images/flags/tr.png', name: 'Turkey' },
    { code: '+7', flag: '/images/flags/ru.png', name: 'Russia' },
    { code: '+1', flag: '/images/flags/us.png', name: 'United States' },
    { code: '+44', flag: '/images/flags/gb.png', name: 'United Kingdom' },
    { code: '+49', flag: '/images/flags/de.png', name: 'Germany' },
    { code: '+33', flag: '/images/flags/fr.png', name: 'France' },
    { code: '+39', flag: '/images/flags/it.png', name: 'Italy' },
    { code: '+34', flag: '/images/flags/es.png', name: 'Spain' },
    { code: '+31', flag: '/images/flags/nl.png', name: 'Netherlands' },
    { code: '+32', flag: '/images/flags/be.png', name: 'Belgium' },
    { code: '+48', flag: '/images/flags/pl.png', name: 'Poland' },
    { code: '+380', flag: '/images/flags/ua.png', name: 'Ukraine' },
    { code: '+40', flag: '/images/flags/ro.png', name: 'Romania' },
    { code: '+995', flag: '/images/flags/ge.png', name: 'Georgia' },
    { code: '+7', flag: '/images/flags/kz.png', name: 'Kazakhstan' },
    { code: '+998', flag: '/images/flags/uz.png', name: 'Uzbekistan' },
    { code: '+98', flag: '/images/flags/ir.png', name: 'Iran' },
    { code: '+964', flag: '/images/flags/iq.png', name: 'Iraq' },
    { code: '+966', flag: '/images/flags/sa.png', name: 'Saudi Arabia' },
    { code: '+971', flag: '/images/flags/ae.png', name: 'UAE' },
    { code: '+974', flag: '/images/flags/qa.png', name: 'Qatar' },
    { code: '+965', flag: '/images/flags/kw.png', name: 'Kuwait' },
    { code: '+972', flag: '/images/flags/il.png', name: 'Israel' },
    { code: '+20', flag: '/images/flags/eg.png', name: 'Egypt' },
    { code: '+91', flag: '/images/flags/in.png', name: 'India' },
    { code: '+86', flag: '/images/flags/cn.png', name: 'China' },
    { code: '+81', flag: '/images/flags/jp.png', name: 'Japan' },
    { code: '+82', flag: '/images/flags/kr.png', name: 'South Korea' },
    { code: '+92', flag: '/images/flags/pk.png', name: 'Pakistan' },
    { code: '+55', flag: '/images/flags/br.png', name: 'Brazil' },
    { code: '+52', flag: '/images/flags/mx.png', name: 'Mexico' },
    { code: '+54', flag: '/images/flags/ar.png', name: 'Argentina' },
    { code: '+1', flag: '/images/flags/ca.png', name: 'Canada' },
    { code: '+61', flag: '/images/flags/au.png', name: 'Australia' },
    { code: '+27', flag: '/images/flags/za.png', name: 'South Africa' },
    { code: '+234', flag: '/images/flags/ng.png', name: 'Nigeria' },
    { code: '+212', flag: '/images/flags/ma.png', name: 'Morocco' },
    { code: '+30', flag: '/images/flags/gr.png', name: 'Greece' },
    { code: '+351', flag: '/images/flags/pt.png', name: 'Portugal' },
    { code: '+36', flag: '/images/flags/hu.png', name: 'Hungary' },
    { code: '+420', flag: '/images/flags/cz.png', name: 'Czech Republic' },
    { code: '+43', flag: '/images/flags/at.png', name: 'Austria' },
    { code: '+41', flag: '/images/flags/ch.png', name: 'Switzerland' },
    { code: '+46', flag: '/images/flags/se.png', name: 'Sweden' },
    { code: '+47', flag: '/images/flags/no.png', name: 'Norway' },
    { code: '+45', flag: '/images/flags/dk.png', name: 'Denmark' },
    { code: '+358', flag: '/images/flags/fi.png', name: 'Finland' },
    { code: '+353', flag: '/images/flags/ie.png', name: 'Ireland' },
    { code: '+359', flag: '/images/flags/bg.png', name: 'Bulgaria' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Viewing request submitted:', { name, phone });
  };

  const fallbackIcons = [
    '/images/resale/img1.png',
    '/images/resale/img2.png',
    '/images/resale/img3.png',
    '/images/resale/img4.png',
    '/images/resale/img5.png',
    '/images/resale/img6.png',
  ];

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
          {(apartment.attributes || []).map((attr, index) => (
            <div className={`ap-details-item ${index >= 4 ? 'ap-desktop-only' : ''}`} key={attr.id}>
              <div className="ap-icon-box">
                <img src={attr.icon || fallbackIcons[index]} alt="" width="18" height="18" />
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
            <div className="ap-flag-selector" ref={flagRef} onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
              <img src={countryFlag} alt="" className="ap-flag-img" />
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 9l6 6 6-6"/>
              </svg>
              {showCountryDropdown && (
                <div className="ap-country-dropdown">
                  {countries.map((c) => (
                    <div
                      key={`${c.code}-${c.name}`}
                      className="ap-country-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCountryCode(c.code);
                        setCountryFlag(c.flag);
                        setShowCountryDropdown(false);
                      }}
                    >
                      <img src={c.flag} alt="" className="ap-country-flag-img" />
                      <span className="ap-country-name">{c.name}</span>
                      <span className="ap-country-code">{c.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input 
              type="tel" 
              placeholder={countryCode} 
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
