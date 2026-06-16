'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import './resale-detail.css';

interface ApartmentDetail {
  id: number;
  image: string;
  badge: string;
  price: string;
  pricePerM2: string;
  tags: string[];
  address: string;
  description: string;
  features: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
  };
}

const apartmentDetails: Record<number, ApartmentDetail> = {
  1: {
    id: 1,
    image: '/images/apt1.png',
    badge: 'MODERN RENOVATION',
    price: '175 000 AZN',
    pricePerM2: '2 917 AZN/m²',
    tags: ['2-room sq.', '60 m²', '8/16 floor'],
    address: 'Baku city, Murtuza Mukhtarov str, house 31',
    description: 'Modern renovation apartment in the heart of Baku. This spacious 2-room apartment features high-quality finishes, modern kitchen with all appliances, and beautiful city views. The apartment is located in a newly constructed building with 24/7 security and underground parking.',
    features: ['Central heating', 'Air conditioning', 'Elevator', 'Parking', 'Security', 'Balcony'],
    agent: {
      name: 'Elvin Mammadov',
      phone: '+994 50 123 45 67',
      email: 'elvin@treva.az'
    }
  },
  2: {
    id: 2,
    image: '/images/apt2.png',
    badge: 'EURO FURNISH',
    price: '270 000 AZN',
    pricePerM2: '2 967 AZN/m²',
    tags: ['2-room sq.', '91 m²', '15/17 floor'],
    address: 'Baku city, Sabit Rahman str, house 26',
    description: 'Premium euro furnish apartment with stunning panoramic views. This luxurious 2-room apartment features European-standard finishes, designer kitchen, and spacious living areas. Located in a premium residential complex with world-class amenities.',
    features: ['Underfloor heating', 'Smart home', 'Concierge', 'Gym', 'Pool', 'Parking'],
    agent: {
      name: 'Elvin Mammadov',
      phone: '+994 50 123 45 67',
      email: 'elvin@treva.az'
    }
  },
  3: {
    id: 3,
    image: '/images/apt3.png',
    badge: 'COSMIC RENOVATION',
    price: '225 000 AZN',
    pricePerM2: '2 885 AZN/m²',
    tags: ['3-room sq.', '78 m²', '4/16 floor'],
    address: 'Baku city, General Aliagha Shikhlinski str, house 30',
    description: 'Unique cosmic renovation design in a prime location. This 3-room apartment features exceptional interior design, high ceilings, and premium materials throughout. Perfect for families seeking comfort and style in the city center.',
    features: ['Designer renovation', 'High ceilings', 'Walk-in closet', 'Laundry room', 'Storage', 'Parking'],
    agent: {
      name: 'Elvin Mammadov',
      phone: '+994 50 123 45 67',
      email: 'elvin@treva.az'
    }
  }
};

export default function ResaleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const locale = (params?.locale as string) || 'az';
  const apartment = apartmentDetails[parseInt(id)] || apartmentDetails[1];

  return (
    <div className="rd-page">
      <Navbar variant="solid" />

      <div className="rd-container">
        <nav className="rd-breadcrumb">
          <Link href={`/${locale}`} className="rd-breadcrumb-link">Main</Link>
          <span className="rd-breadcrumb-sep">/</span>
          <Link href={`/${locale}/resale`} className="rd-breadcrumb-link">Resale</Link>
          <span className="rd-breadcrumb-sep">/</span>
          <span className="rd-breadcrumb-current">N° {id}</span>
        </nav>

        <div className="rd-content">
          <div className="rd-image-section">
            <img src={apartment.image} alt={apartment.address} className="rd-main-image" />
            <span className="rd-badge">{apartment.badge}</span>
          </div>

          <div className="rd-details-section">
            <div className="rd-price-block">
              <h1 className="rd-price">{apartment.price}</h1>
              <div className="rd-price-m2">{apartment.pricePerM2}</div>
            </div>

            <div className="rd-tags">
              {apartment.tags.map((tag, idx) => (
                <span key={idx} className="rd-tag">{tag}</span>
              ))}
            </div>

            <div className="rd-address-block">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{apartment.address}</span>
            </div>

            <p className="rd-description">{apartment.description}</p>

            <div className="rd-features">
              <h3 className="rd-features-title">Features</h3>
              <div className="rd-features-grid">
                {apartment.features.map((feature, idx) => (
                  <div key={idx} className="rd-feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rd-agent-block">
              <h3 className="rd-agent-title">Contact Agent</h3>
              <div className="rd-agent-info">
                <div className="rd-agent-name">{apartment.agent.name}</div>
                <div className="rd-agent-contact">
                  <a href={`tel:${apartment.agent.phone}`} className="rd-agent-phone">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {apartment.agent.phone}
                  </a>
                  <a href={`mailto:${apartment.agent.email}`} className="rd-agent-email">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {apartment.agent.email}
                  </a>
                </div>
              </div>
            </div>

            <Link href={`/${locale}/resale`} className="rd-back-btn">
              ← Back to Listings
            </Link>
          </div>
        </div>
      </div>

      <HomeFooter />
    </div>
  );
}
