'use client';

import React from 'react';
import PageContainer from '@/app/components/Container/PageContainer';
import { DirectionButton, ViewAllButton } from '@/app/components/Buttons/PortfolioButtons';
import './features-properties.css';

const FeaturedProperties: React.FC = () => {
  return (
    <main>
      <PageContainer>
        <section className="featured">
          
          {/* ========================================================
              1. DESKTOP HEADER (Vahid sətir, mərkəzləşdirilmiş hiza)
             ======================================================== */}
          <div className="featured__header d-desktop">
            <div className="featured__desktop-row">
              <p className="featured__subtitle">
                Strategic portfolio of the city's top venues. Our focus <br />
                remains on architectural landmarks and long-term <br />
                capital growth for investors.
              </p>

              <h2 className="featured__title">
                <span className="featured__title-featured">FEATURED</span>{" "}
                <span className="featured__title-properties">PROPERTIES</span>
              </h2>
            </div>

            <div className="featured__title-wrapper">
              <ViewAllButton className="featured__view-all" />
            </div>
          </div>


          {/* ========================================================
              2. MOBİL HEADER
             ======================================================== */}
          <div className="featured__header-mobile d-mobile">
            <h2 className="featured__title-mobile">
              <span className="featured__title-mobile-featured">FEATURED</span><br />
              <span className="featured__title-mobile-properties">PROPERTIES</span>
            </h2>

            <p className="featured__subtitle-mobile">
              Strategic portfolio of the city’s top <br />
              venues. Our focus remains on <br />
              architectural landmarks and long- <br />
              term capital growth for investors.
            </p>

            <ViewAllButton mobile className="featured__view-all-mobile" />
          </div>


          {/* ========================================================
              3. SLIDER & CARDS GRID (Yenilənmiş Mətn Tipli Loqolar)
             ======================================================== */}
          <div className="featured__slider-container">
            <div className="featured__grid">
              
              {/* Card 1 - Sea Breeze */}
              <a href="#" className="property-card">
                <img
                  className="property-card__bg"
                  src="/images/features-pro/feat1.jpg"
                  alt="Marina Village background"
                />
                <div className="property-card__overlay"></div>
                
                {/* Şəkildəki kimi Böyük Ağ Mətn Loqo */}
                <div className="property-card__brand-text brand-seabreeze">
                  SEA BREEZE
                  <span>REAL ESTATE</span>
                </div>

                <h3 className="property-card__title">
                  Marina <br />
                  Village
                </h3>

                <span className="property-card__action">
                  Learn More
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 1L13 5M13 5L9 9M13 5H1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>

              {/* Card 2 - Reportage */}
              <a href="#" className="property-card">
                <img
                  className="property-card__bg"
                  src="/images/features-pro/feat2.jpg"
                  alt="Panorama background"
                />
                <div className="property-card__overlay"></div>
                
                {/* Şəkildəki kimi Böyük Ağ Mətn Loqo */}
                <div className="property-card__brand-text brand-reportage">
                  Reportage.
                  <span>Properties</span>
                </div>

                <h3 className="property-card__title">
                  Panorama By <br />
                  Elie Saab
                </h3>

                <span className="property-card__action">
                  Learn More
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 1L13 5M13 5L9 9M13 5H1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>

              {/* Card 3 - Reportage */}
              <a href="#" className="property-card">
                <img
                  className="property-card__bg"
                  src="/images/features-pro/feat3.jpg"
                  alt="Brabus Island background"
                />
                <div className="property-card__overlay"></div>
                
                {/* Şəkildəki kimi Böyük Ağ Mətn Loqo */}
                <div className="property-card__brand-text brand-reportage">
                  Reportage.
                  <span>Properties</span>
                </div>

                <h3 className="property-card__title">
                  Brabus <br />
                  Island
                </h3>

                <span className="property-card__action">
                  Learn More
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 1L13 5M13 5L9 9M13 5H1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>

              {/* Card 4 - Sea Breeze */}
              <a href="#" className="property-card property-card--highlighted">
                <img
                  className="property-card__bg"
                  src="/images/features-pro/feat4.jpg"
                  alt="Arabian Ranches background"
                />
                <div className="property-card__overlay"></div>
                
                {/* Şəkildəki kimi Böyük Ağ Mətn Loqo */}
                <div className="property-card__brand-text brand-seabreeze">
                  SEA BREEZE
                  <span>REAL ESTATE</span>
                </div>

                <h3 className="property-card__title">
                  Arabian <br />
                  Ranches
                </h3>

                <span className="property-card__action">
                  Learn More
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 1L13 5M13 5L9 9M13 5H1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>

            </div>

            {/* Slider Naviqasiya Oxları */}
            <div className="featured__controls">
              <DirectionButton direction="previous" label="Previous property" />
              <DirectionButton direction="next" label="Next property" />
            </div>
          </div>

        </section>
      </PageContainer>
    </main>
  );
};

export default FeaturedProperties;
