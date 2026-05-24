'use client';

import React from 'react';
import PageContainer from '@/app/components/Container/PageContainer';
import './features-properties.css';

const FeaturedProperties: React.FC = () => {
  return (
    <main>
      <PageContainer>
        <section className="featured">
          
          {/* ========================================================
              1. DESKTOP STRUKTURU
             ======================================================== */}
          <div className="featured__header d-desktop">
            {/* Sol tərəf: Alt mətn */}
            <p className="featured__subtitle">
              Strategic portfolio of the city's top venues. Our focus <br />
              remains on architectural landmarks and long-term <br />
              capital growth for investors.
            </p>

            {/* Sağ tərəf: Başlıq və altındakı mövqeləndirilmiş düymə */}
            <div className="featured__title-wrapper">
              <h2 className="featured__title">
                <span className="featured__title-featured">FEATURED</span>{" "}
                <span className="featured__title-properties">PROPERTIES</span>
              </h2>
              <a href="#" className="featured__view-all">
                View All
              </a>
            </div>
          </div>


          {/* ========================================================
              2. MOBİL STRUKTUR (Tamamilə fərqli ardıcıllıq)
             ======================================================== */}
          <div className="featured__header-mobile d-mobile">
            {/* 1. Ən üstdə: Başlıq - SAĞDA */}
            <h2 className="featured__title-mobile">
              <span className="featured__title-mobile-featured">FEATURED</span><br />
              <span className="featured__title-mobile-properties">PROPERTIES</span>
            </h2>

            {/* 2. Ortada: Alt mətn - SOLDA */}
            <p className="featured__subtitle-mobile">
              Strategic portfolio of the city’s top <br />
              venues. Our focus remains on <br />
              architectural landmarks and long- <br />
              term capital growth for investors.
            </p>

            {/* 3. Ən altdada: View All Düyməsi - SAĞDA */}
            <a href="#" className="featured__view-all-mobile">
              View All
            </a>
          </div>


          {/* ========================================================
              3. SLIDER & CARDS GRID (Dəyişilməz stabil blok)
             ======================================================== */}
          <div className="featured__slider-container">
            <div className="featured__grid">
              {/* Card 1 */}
              <a href="#" className="property-card">
                <img
                  className="property-card__bg"
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
                  alt="Marina Village Tower"
                />
                <div className="property-card__overlay"></div>
                <span className="property-card__brand">Sea Breeze Real Estate</span>
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

              {/* Card 2 */}
              <a href="#" className="property-card">
                <img
                  className="property-card__bg"
                  src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80"
                  alt="Panorama Skyscraper"
                />
                <div className="property-card__overlay"></div>
                <span className="property-card__brand">Reportage. Properties</span>
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

              {/* Card 3 */}
              <a href="#" className="property-card">
                <img
                  className="property-card__bg"
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
                  alt="Brabus Island Waterfront"
                />
                <div className="property-card__overlay"></div>
                <span className="property-card__brand">Reportage. Properties</span>
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

              {/* Card 4 */}
              <a href="#" className="property-card property-card--highlighted">
                <img
                  className="property-card__bg"
                  src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80"
                  alt="Arabian Ranches Luxury Complex"
                />
                <div className="property-card__overlay"></div>
                <span className="property-card__brand">Sea Breeze Real Estate</span>
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

            {/* Slider Naviqasiya Kontrolları */}
            <div className="featured__controls">
              <button className="featured__btn" aria-label="Previous property">
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7 13L1 7M1 7L7 1M1 7H17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="featured__btn" aria-label="Next property">
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11 13L17 7M17 7L11 1M17 7H1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </PageContainer>
    </main>
  );
};

export default FeaturedProperties;