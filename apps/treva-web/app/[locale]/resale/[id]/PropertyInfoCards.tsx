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
  const [countryFlag, setCountryFlag] = useState('https://flagcdn.com/w40/az.png');
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
    { code: '+994', flag: 'https://flagcdn.com/w40/az.png', name: 'Azerbaijan' },
    { code: '+1', flag: 'https://flagcdn.com/w40/us.png', name: 'United States' },
    { code: '+44', flag: 'https://flagcdn.com/w40/gb.png', name: 'United Kingdom' },
    { code: '+7', flag: 'https://flagcdn.com/w40/ru.png', name: 'Russia' },
    { code: '+90', flag: 'https://flagcdn.com/w40/tr.png', name: 'Turkey' },
    { code: '+49', flag: 'https://flagcdn.com/w40/de.png', name: 'Germany' },
    { code: '+33', flag: 'https://flagcdn.com/w40/fr.png', name: 'France' },
    { code: '+39', flag: 'https://flagcdn.com/w40/it.png', name: 'Italy' },
    { code: '+34', flag: 'https://flagcdn.com/w40/es.png', name: 'Spain' },
    { code: '+971', flag: 'https://flagcdn.com/w40/ae.png', name: 'UAE' },
    { code: '+966', flag: 'https://flagcdn.com/w40/sa.png', name: 'Saudi Arabia' },
    { code: '+98', flag: 'https://flagcdn.com/w40/ir.png', name: 'Iran' },
    { code: '+998', flag: 'https://flagcdn.com/w40/uz.png', name: 'Uzbekistan' },
    { code: '+77', flag: 'https://flagcdn.com/w40/kz.png', name: 'Kazakhstan' },
    { code: '+996', flag: 'https://flagcdn.com/w40/kg.png', name: 'Kyrgyzstan' },
    { code: '+992', flag: 'https://flagcdn.com/w40/tj.png', name: 'Tajikistan' },
    { code: '+993', flag: 'https://flagcdn.com/w40/tm.png', name: 'Turkmenistan' },
    { code: '+995', flag: 'https://flagcdn.com/w40/ge.png', name: 'Georgia' },
    { code: '+374', flag: 'https://flagcdn.com/w40/am.png', name: 'Armenia' },
    { code: '+48', flag: 'https://flagcdn.com/w40/pl.png', name: 'Poland' },
    { code: '+380', flag: 'https://flagcdn.com/w40/ua.png', name: 'Ukraine' },
    { code: '+36', flag: 'https://flagcdn.com/w40/hu.png', name: 'Hungary' },
    { code: '+381', flag: 'https://flagcdn.com/w40/rs.png', name: 'Serbia' },
    { code: '+385', flag: 'https://flagcdn.com/w40/hr.png', name: 'Croatia' },
    { code: '+420', flag: 'https://flagcdn.com/w40/cz.png', name: 'Czech Republic' },
    { code: '+421', flag: 'https://flagcdn.com/w40/sk.png', name: 'Slovakia' },
    { code: '+40', flag: 'https://flagcdn.com/w40/ro.png', name: 'Romania' },
    { code: '+359', flag: 'https://flagcdn.com/w40/bg.png', name: 'Bulgaria' },
    { code: '+30', flag: 'https://flagcdn.com/w40/gr.png', name: 'Greece' },
    { code: '+86', flag: 'https://flagcdn.com/w40/cn.png', name: 'China' },
    { code: '+81', flag: 'https://flagcdn.com/w40/jp.png', name: 'Japan' },
    { code: '+82', flag: 'https://flagcdn.com/w40/kr.png', name: 'South Korea' },
    { code: '+91', flag: 'https://flagcdn.com/w40/in.png', name: 'India' },
    { code: '+20', flag: 'https://flagcdn.com/w40/eg.png', name: 'Egypt' },
    { code: '+212', flag: 'https://flagcdn.com/w40/ma.png', name: 'Morocco' },
    { code: '+234', flag: 'https://flagcdn.com/w40/ng.png', name: 'Nigeria' },
    { code: '+27', flag: 'https://flagcdn.com/w40/za.png', name: 'South Africa' },
    { code: '+61', flag: 'https://flagcdn.com/w40/au.png', name: 'Australia' },
    { code: '+64', flag: 'https://flagcdn.com/w40/nz.png', name: 'New Zealand' },
    { code: '+55', flag: 'https://flagcdn.com/w40/br.png', name: 'Brazil' },
    { code: '+52', flag: 'https://flagcdn.com/w40/mx.png', name: 'Mexico' },
    { code: '+54', flag: 'https://flagcdn.com/w40/ar.png', name: 'Argentina' },
    { code: '+57', flag: 'https://flagcdn.com/w40/co.png', name: 'Colombia' },
    { code: '+56', flag: 'https://flagcdn.com/w40/cl.png', name: 'Chile' },
    { code: '+51', flag: 'https://flagcdn.com/w40/pe.png', name: 'Peru' },
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
                      key={c.code}
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
