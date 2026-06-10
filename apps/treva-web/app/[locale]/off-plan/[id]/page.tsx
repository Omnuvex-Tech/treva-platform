'use client';

import React from 'react';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import "../off-plan.css";
import "./apartment-card.css";
import "./panorama-card.css";
import "./similar-apartments.css";

export default function ApartmentCard() {
  return (
    <div className="page-wrapper">
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer>
          <div className="apt-wrapper">
            {/* Breadcrumbs */}
            {/* Breadcrumbs - above card */}
            <nav className="apt-breadcrumbs">
              <span>Main</span> <span className="apt-separator">/</span>
              <span>Panorama by ELIE SAAB</span> <span className="apt-separator">/</span>
              <span className="apt-crumb-active">N° 1</span>
            </nav>

            {/* Main Container */}
            <div className="apt-main-card">
              
              {/* Left Side: Blueprint Image Section */}
              <div className="apt-image-section">
                <div className="apt-blueprint-box">
                  <img 
                    src="/images/offplan-details/eliesaab.jpg" 
                    alt="1 Bedroom Junior Apartment Floor Plan" 
                    className="apt-plan-img"
                  />
                </div>
              </div>

              {/* Right Side: Data and Details (Justified to End) */}
              <div className="apt-details-section">
                <div className="apt-header">
                  <h1 className="apt-title">
                    1 Bedroom Junior <span className="apt-title-sub">Apartment</span>
                  </h1>
                  
                  {/* Badges Row - Aligned to the Right */}
                  <div className="apt-badge-row">
                    <span className="apt-badge badge-available">Available</span>
                    <button type="button" className="apt-badge badge-btn">PDF</button>
                    <button type="button" className="apt-share-btn" aria-label="Share">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Specs Table */}
                <div className="apt-specs-list">
                  <div className="apt-spec-item">
                    <span className="apt-label">Floor</span>
                    <span className="apt-value">23</span>
                  </div>
                  <div className="apt-spec-item">
                    <span className="apt-label">Total Area</span>
                    <span className="apt-value">50.5 m²</span>
                  </div>
                  <div className="apt-spec-item">
                    <span className="apt-label">Internal Area</span>
                    <span className="apt-value">43.0 m²</span>
                  </div>
                  <div className="apt-spec-item">
                    <span className="apt-label">Balcony</span>
                    <span className="apt-value">7.5 m²</span>
                  </div>
                </div>

                {/* Footer Pricing - Aligned to the Right */}
                <div className="apt-footer">
                  <div className="apt-currency-select">
                    <span>USD</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                  <div className="apt-price">186 004</div>
                </div>

              </div>

            </div>
          </div>

          {/* Panorama Section */}
          <div className="panorama-section">
            <div className="panorama-banner">
              <div className="panorama-overlay"></div>
              <div className="panorama-content">
                <h3 className="panorama-title">Panorama by ELIE SAAB</h3>
                <div className="panorama-button-group">
                  <button className="panorama-btn">
                    <svg className="panorama-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Get a Consultation
                  </button>
                  <button className="panorama-btn">
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
                  </button>
                </div>
              </div>
            </div>

            {/* Info Table */}
            <div className="panorama-info-table">
              <div className="panorama-row">
                <span className="panorama-label">Location</span>
                <span className="panorama-value">Sea Breeze Resort, Nardaran District, Baku, Azerbaijan</span>
              </div>
              
              <div className="panorama-row">
                <span className="panorama-label">Real Estate Type</span>
                <span className="panorama-value">Apartment</span>
              </div>
              
              <div className="panorama-row">
                <span className="panorama-label">Year of Completion</span>
                <span className="panorama-value">2030</span>
              </div>
              
              <div className="panorama-row">
                <span className="panorama-label">Number of Floors</span>
                <span className="panorama-value">From 3 to 30 Floors</span>
              </div>
            </div>
          </div>

          {/* Similar Apartments Section */}
          <div className="similar-section">
            <div className="similar-header">
              <h2 className="similar-title">
                <span className="similar-title-thin">SIMILAR</span>
                <span className="similar-title-bold">APARTMENTS</span>
              </h2>
            </div>

            <div className="similar-grid">
              {/* Card 1 */}
              <div className="layout-card">
                <div className="layout-card__header">
                  <div className="layout-card__title-block">
                    <span className="layout-card__code">1BR Junior</span>
                    <span className="layout-card__floor">23 floor</span>
                  </div>
                  <div className="layout-card__number-block">
                    <span className="layout-card__number">N° 1</span>
                    <span className="layout-card__status">Available</span>
                  </div>
                </div>
                <div className="layout-card__visual">
                  <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
                    <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
                    <line x1="10" y1="110" x2="190" y2="110" stroke="#2b3541" strokeWidth="2"/>
                    <line x1="190" y1="10" x2="190" y2="170" stroke="#2b3541" strokeWidth="2"/>
                    <line x1="190" y1="170" x2="290" y2="170" stroke="#2b3541" strokeWidth="2"/>
                    <rect x="25" y="20" width="65" height="50" fill="none" stroke="#8e949a" strokeDasharray="2,2"/>
                    <circle cx="57" cy="45" r="3" fill="#8e949a"/>
                    <path d="M110,35 Q130,55 110,75" fill="none" stroke="#8e949a"/>
                    <text x="70" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living + Kitchen</text>
                    <text x="70" y="155" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">6.9 x 2.6</text>
                    <text x="70" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
                    <text x="70" y="60" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">4.4 x 2.6</text>
                    <text x="240" y="65" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bathroom</text>
                    <text x="240" y="78" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">2.4 x 1.8</text>
                    <rect x="20" y="170" width="80" height="30" fill="none" stroke="#8e949a"/>
                    <circle cx="190" cy="140" r="14" fill="none" stroke="#8e949a"/>
                    <rect x="255" y="125" width="25" height="35" fill="none" stroke="#8e949a"/>
                  </svg>
                </div>
                <div className="layout-card__footer">
                  <h2 className="layout-card__name">1 Bedroom Junior, 50.5 m²</h2>
                  <span className="layout-card__price">$186 004</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="layout-card">
                <div className="layout-card__header">
                  <div className="layout-card__title-block">
                    <span className="layout-card__code">1BR-A</span>
                    <span className="layout-card__floor">23 floor</span>
                  </div>
                  <div className="layout-card__number-block">
                    <span className="layout-card__number">N° 2</span>
                    <span className="layout-card__status">Reserved</span>
                  </div>
                </div>
                <div className="layout-card__visual">
                  <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
                    <rect x="30" y="10" width="240" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
                    <line x1="155" y1="10" x2="155" y2="150" stroke="#2b3541" strokeWidth="2"/>
                    <line x1="155" y1="150" x2="270" y2="150" stroke="#2b3541" strokeWidth="2"/>
                    <line x1="155" y1="170" x2="155" y2="210" stroke="#2b3541" strokeWidth="2"/>
                    <circle cx="90" cy="65" r="28" fill="none" stroke="#8e949a"/>
                    <text x="95" y="95" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
                    <text x="95" y="110" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.7 x 7.3</text>
                    <rect x="175" y="30" width="75" height="70" fill="none" stroke="#8e949a"/>
                    <text x="212" y="115" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
                    <text x="212" y="128" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.4 x 4.5</text>
                    <text x="245" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
                    <text x="245" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.0 x 2.2</text>
                    <text x="185" y="180" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
                    <text x="185" y="192" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">1.3 x 2.2</text>
                  </svg>
                </div>
                <div className="layout-card__footer">
                  <h2 className="layout-card__name">1 Bedroom Type A, 67.8 m²</h2>
                  <span className="layout-card__price">$230 214</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="layout-card">
                <div className="layout-card__header">
                  <div className="layout-card__title-block">
                    <span className="layout-card__code">2BR+A</span>
                    <span className="layout-card__floor">24 floor</span>
                  </div>
                  <div className="layout-card__number-block">
                    <span className="layout-card__number">N° 6</span>
                    <span className="layout-card__status">Reserved</span>
                  </div>
                </div>
                <div className="layout-card__visual">
                  <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
                    <rect x="10" y="10" width="280" height="200" fill="none" stroke="#2b3541" strokeWidth="3"/>
                    <line x1="120" y1="10" x2="120" y2="130" stroke="#2b3541" strokeWidth="2"/>
                    <line x1="10" y1="130" x2="160" y2="130" stroke="#2b3541" strokeWidth="2"/>
                    <line x1="160" y1="10" x2="160" y2="210" stroke="#2b3541" strokeWidth="2"/>
                    <line x1="160" y1="100" x2="290" y2="100" stroke="#2b3541" strokeWidth="2"/>
                    <text x="65" y="70" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
                    <text x="65" y="83" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.1 x 3.5</text>
                    <text x="65" y="160" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
                    <text x="65" y="173" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">5.8 x 6.1</text>
                    <text x="225" y="45" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Master Bed</text>
                    <text x="225" y="58" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.9 x 3.6</text>
                    <text x="225" y="145" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
                    <text x="225" y="158" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">3.1 x 3.5</text>
                    <text x="225" y="195" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Master Bath</text>
                    <text x="225" y="206" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">2.0 x 3.0</text>
                  </svg>
                </div>
                <div className="layout-card__footer">
                  <h2 className="layout-card__name">2 Bedroom+ Type A, 148.7 m²</h2>
                  <span className="layout-card__price">$369 180</span>
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
