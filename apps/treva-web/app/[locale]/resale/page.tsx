'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import './resale-listing.css';

interface Apartment {
  id: number;
  image: string;
  badge: string;
  price: string;
  pricePerM2: string;
  tags: string[];
  address: string;
}

const apartmentData: Apartment[] = [
  {
    id: 1,
    image: '/images/apt1.png',
    badge: 'MODERN RENOVATION',
    price: '175 000 AZN',
    pricePerM2: '2 917 AZN/m²',
    tags: ['2-room sq.', '60 m²', '8/16 floor'],
    address: 'Baku city, Murtuza Mukhtarov str, house 31'
  },
  {
    id: 2,
    image: '/images/apt2.png',
    badge: 'EURO FURNISH',
    price: '270 000 AZN',
    pricePerM2: '2 967 AZN/m²',
    tags: ['2-room sq.', '91 m²', '15/17 floor'],
    address: 'Baku city, Sabit Rahman str, house 26'
  },
  {
    id: 3,
    image: '/images/apt3.png',
    badge: 'COSMIC RENOVATION',
    price: '225 000 AZN',
    pricePerM2: '2 885 AZN/m²',
    tags: ['3-room sq.', '78 m²', '4/16 floor'],
    address: 'Baku city, General Aliagha Shikhlinski str, house 30'
  }
];

export default function ResalePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const [savedItems, setSavedItems] = useState<number[]>([]);

  const toggleSave = (id: number) => {
    setSavedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="re-page-wrapper">
      <Navbar variant="solid" />
      <main className="re-main-wrapper">
        <PageContainer>
          <header className="re-header">
            <h1 className="re-main-title">PURCHASE APARTMENTS IN BAKU</h1>

            <div className="re-controls-row">
              <div className="re-property-count">1072 properties</div>

              <div className="re-sort-wrapper">
                <span className="re-sort-label">Sort:</span>
                <div className="re-sort-dropdown">
                  <span>Recommended</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
              </div>
            </div>
          </header>

          <main className="re-grid">
            {apartmentData.map((apt) => (
              <div key={apt.id} className="re-card-wrapper">
                <article className="re-card">
                  <div className="re-card-media">
                    <img src={apt.image} alt={apt.address} className="re-card-img" />
                  </div>

                  <div className="re-card-body">
                    <div className="re-card-meta-row">
                      <span className="re-badge">{apt.badge}</span>
                      <button
                        type="button"
                        className={`re-bookmark-btn ${savedItems.includes(apt.id) ? 'active' : ''}`}
                        onClick={() => toggleSave(apt.id)}
                        aria-label="Save listing"
                      >
                        <svg width="15" height="30" viewBox="0 0 20 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 0C0.89543 0 0 0.89543 0 2V24.5L10 19L20 24.5V2C20 0.89543 19.1046 0 18 0H2Z"/>
                        </svg>
                      </button>
                    </div>

                    <div className="re-price-block">
                      <h2 className="re-main-price">{apt.price}</h2>
                      <div className="re-sqm-price">{apt.pricePerM2}</div>
                    </div>

                    <div className="re-tags-row">
                      {apt.tags.map((tag, idx) => (
                        <span key={idx} className="re-tag">{tag}</span>
                      ))}
                    </div>

                    <p className="re-address">{apt.address}</p>
                  </div>
                </article>

                <Link href={`/${locale}/resale/${apt.id}`} className="re-action-btn">
                  VIew Apartment DetaIls
                </Link>
              </div>
            ))}
          </main>

          <footer className="re-pagination">
            <div className="re-pagination-numbers">
              <span className="re-page-num re-page-active">1</span>
              <span className="re-page-num">2</span>
              <span className="re-page-num">3</span>
              <span className="re-page-num">5</span>
              <span className="re-page-num">4</span>
              <span className="re-page-ellipsis">...</span>
              <span className="re-page-num">40</span>
            </div>

            <button type="button" className="re-next-btn" aria-label="Next Page">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </footer>
        </PageContainer>
      </main>
      <HomeFooter />
    </div>
  );
}
