'use client';

import React from 'react';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import "../off-plan.css";
import "./apartment-card.css";

export default function ApartmentCard() {
  return (
    <div className="page-wrapper">
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer>
          <div className="apt-wrapper">
            {/* Breadcrumbs */}
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
        </PageContainer>
      </main>
      <HomeFooter />
    </div>
  );
}
