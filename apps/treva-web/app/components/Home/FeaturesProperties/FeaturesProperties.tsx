'use client';

import React from 'react';
import PageContainer from '@/app/components/Container/PageContainer';
import './features-properties.css';

const FeaturedProperties: React.FC = () => {
  return (
    <main>
      <PageContainer>
        <section className="featured">
          <div className="featured__header">
            <p className="featured__subtitle">
              Strategic portfolio of the city's top venues. Our focus remains on architectural landmarks and
              long-term capital growth for investors.
            </p>
            <div className="featured__title-wrapper">
              <h2 className="featured__title">
                <span className="featured__title-featured">FEATURED</span>
                <span className="featured__title-properties">PROPERTIES</span>
              </h2>
              <a href="#" className="featured__view-all">
                View All
              </a>
            </div>
          </div>
          <div className="featured__slider-container">
            <div className="featured__grid">
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