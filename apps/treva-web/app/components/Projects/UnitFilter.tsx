'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './unit-filter.css';

interface Apartment {
  id: string;
  code: string;
  floor: string;
  number: string;
  status: string;
  title: string;
  price: string;
  image: string;
}

const apartments: Apartment[] = [
  {
    id: '1', code: '1BR Junior', floor: '23 floor', number: 'N° 1', status: 'Avaible',
    title: '1 Bedroom Junior, 50.5 m²', price: '$186 004',
    image: '/images/offplan-details/a1.png'
  },
  {
    id: '2', code: '1BR-A', floor: '23 floor', number: 'N° 2', status: 'Reserved',
    title: '1 Bedroom Type A, 67.8 m²', price: '$230 214',
    image: '/images/offplan-details/a2.png'
  },
  {
    id: '3', code: '1BR-B', floor: '1 floor', number: 'N° 3', status: 'Avaible',
    title: '1 Bedroom Type B, 67.8 m²', price: '$224 103',
    image: '/images/offplan-details/a3.png'
  },
  {
    id: '4', code: '2BR-A', floor: '15 floor', number: 'N° 4', status: 'Reserved',
    title: '2 Bedroom Type A, 95.2 m²', price: '$312 500',
    image: '/images/offplan-details/2br-a.jpg'
  },
  {
    id: '5', code: '2BR-B', floor: '18 floor', number: 'N° 5', status: 'Avaible',
    title: '2 Bedroom Type B, 112.5 m²', price: '$378 000',
    image: '/images/offplan-details/2br-b.jpg'
  },
  {
    id: '6', code: '2BR-C', floor: '20 floor', number: 'N° 6', status: 'Reserved',
    title: '2 Bedroom Type C, 128.0 m²', price: '$425 000',
    image: '/images/offplan-details/2br-c.jpg'
  },
  {
    id: '7', code: '3BR-A', floor: '25 floor', number: 'N° 7', status: 'Avaible',
    title: '3 Bedroom Type A, 165.0 m²', price: '$542 000',
    image: '/images/offplan-details/3br-a.jpg'
  },
  {
    id: '8', code: '3BR-B', floor: '28 floor', number: 'N° 8', status: 'Reserved',
    title: '3 Bedroom Type B, 185.0 m²', price: '$612 000',
    image: '/images/offplan-details/3br-b.jpg'
  },
  {
    id: '9', code: '4BR', floor: '30 floor', number: 'N° 9', status: 'Avaible',
    title: '4 Bedroom, 245.0 m²', price: '$849 000',
    image: '/images/offplan-details/4br.jpg'
  },
  {
    id: '10', code: '1BR-D', floor: '5 floor', number: 'N° 10', status: 'Reserved',
    title: '1 Bedroom Type D, 55.0 m²', price: '$198 000',
    image: '/images/offplan-details/1br-d.jpg'
  },
  {
    id: '11', code: '2BR-D', floor: '12 floor', number: 'N° 11', status: 'Avaible',
    title: '2 Bedroom Type D, 108.0 m²', price: '$355 000',
    image: '/images/offplan-details/2br-d.jpg'
  },
  {
    id: '12', code: '3BR-C', floor: '22 floor', number: 'N° 12', status: 'Reserved',
    title: '3 Bedroom Type C, 172.0 m²', price: '$568 000',
    image: '/images/offplan-details/3br-c.jpg'
  },
];

export default function UnitLayout() {
  const [currency, setCurrency] = useState('USD');
  const [floor, setFloor] = useState('3');
  const [view, setView] = useState('Sea view');
  const [status, setStatus] = useState('Available');
  const [selectedRooms, setSelectedRooms] = useState<string>('1');

  const [priceMin, setPriceMin] = useState(188874);
  const [priceMax, setPriceMax] = useState(849849);
  const totalPriceMin = 50000;
  const totalPriceMax = 1500000;

  const [areaMin, setAreaMin] = useState(35);
  const [areaMax, setAreaMax] = useState(430);
  const totalAreaMin = 10;
  const totalAreaMax = 600;

  const roomOptions = ['S', '1', '2', '3', '4+'];

  const priceLeftPercent = ((priceMin - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;
  const priceRightPercent = 100 - ((priceMax - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;

  const areaLeftPercent = ((areaMin - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;
  const areaRightPercent = 100 - ((areaMax - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <section className="layout-section">
        
        {/* HEADER */}
        <div className="layout-header">
          <h2 className="layout-title">
            <span className="layout-title-thin">UnIt</span>
            <span className="layout-title-bold">layouts</span>
            <span className="layout-count">(124)</span>
          </h2>
        </div>

        {/* FILTERS CONTAINER */}
        <div className="filters-grid">
          
          {/* Price Filter */}
          <div className="filter-group filter-group--price">
            <label className="filter-label">Price</label>
            <div className="filter-inputs-wrapper">
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>from</span>
                  <input 
                    type="text" 
                    value={formatNumber(priceMin)} 
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\s+/g, ''));
                      if (!isNaN(val)) setPriceMin(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={formatNumber(priceMax)} 
                    onChange={(e) => {
                      const val = Number(e.target.value.replace(/\s+/g, ''));
                      if (!isNaN(val)) setPriceMax(val);
                    }}
                  />
                </div>
              </div>
              
              <div className="select-wrapper currency-select">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="AZN">AZN</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            <div className="slider-container">
              <div className="slider-base-track"></div>
              <div 
                className="slider-active-track" 
                style={{ left: `${priceLeftPercent}%`, right: `${priceRightPercent}%` }}
              ></div>
              <input 
                type="range" 
                min={totalPriceMin} 
                max={totalPriceMax} 
                value={priceMin}
                className="thumb thumb--left"
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceMax - 1000);
                  setPriceMin(val);
                }}
              />
              <input 
                type="range" 
                min={totalPriceMin} 
                max={totalPriceMax} 
                value={priceMax}
                className="thumb thumb--right"
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceMin + 1000);
                  setPriceMax(val);
                }}
              />
            </div>
          </div>

          {/* Area & Floor Wrapper */}
          <div className="mobile-flex-row filter-group--area-floor">
            <div className="filter-group filter-group--area">
              <label className="filter-label">Area (m²)</label>
              <div className="dual-inputs">
                <div className="input-with-prefix">
                  <span>from</span>
                  <input 
                    type="text" 
                    value={areaMin} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setAreaMin(val);
                    }}
                  />
                </div>
                <div className="input-with-prefix">
                  <span>to</span>
                  <input 
                    type="text" 
                    value={areaMax} 
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) setAreaMax(val);
                    }}
                  />
                </div>
              </div>
              
              <div className="slider-container">
                <div className="slider-base-track"></div>
                <div 
                  className="slider-active-track" 
                  style={{ left: `${areaLeftPercent}%`, right: `${areaRightPercent}%` }}
                ></div>
                <input 
                  type="range" 
                  min={totalAreaMin} 
                  max={totalAreaMax} 
                  value={areaMin}
                  className="thumb thumb--left"
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), areaMax - 5);
                    setAreaMin(val);
                  }}
                />
                <input 
                  type="range" 
                  min={totalAreaMin} 
                  max={totalAreaMax} 
                  value={areaMax}
                  className="thumb thumb--right"
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), areaMin + 5);
                    setAreaMax(val);
                  }}
                />
              </div>
            </div>

            <div className="filter-group filter-group--floor">
              <label className="filter-label">Floor</label>
              <div className="select-wrapper">
                <select value={floor} onChange={(e) => setFloor(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>
          </div>

          {/* View & Status Wrapper */}
          <div className="mobile-flex-row filter-group--view-status">
            <div className="filter-group filter-group--view">
              <label className="filter-label">View</label>
              <div className="select-wrapper">
                <select value={view} onChange={(e) => setView(e.target.value)}>
                  <option value="Sea view">Sea view</option>
                  <option value="City view">City view</option>
                  <option value="Garden view">Garden view</option>
                </select>
              </div>
            </div>

            <div className="filter-group filter-group--status">
              <label className="filter-label">Status</label>
              <div className="select-wrapper">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>
          </div>

          {/* Number of Rooms Filter */}
          <div className="filter-group filter-group--rooms">
            <label className="filter-label">Number of rooms</label>
            <div className="rooms-group">
              {roomOptions.map((room) => (
                <button
                  key={room}
                  type="button"
                  className={`room-btn ${selectedRooms === room ? 'room-btn--active' : ''}`}
                  onClick={() => setSelectedRooms(room)}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RESULTS & RESET ROW */}
        <div className="results-row">
          <span className="results-count">24 apartments found</span>
          <button type="button" className="reset-btn">Reset filters</button>
        </div>

        {/* BANNER CARD */}
        <div className="complex-banner">
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h3 className="banner-title">Panorama by ELIE SAAB</h3>
            <div className="banner-actions">
              <button className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Get a Consultation</span>
              </button>
              <button className="action-btn">
                <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                  <line x1="9" y1="22" x2="9" y2="16"/>
                  <line x1="15" y1="22" x2="15" y2="16"/>
                  <line x1="9" y1="16" x2="15" y2="16"/>
                  <path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01"/>
                </svg>
                <span>More About the Residential Complex</span>
              </button>
            </div>
          </div>
        </div>

        {/* APARTMENT CARDS GRID */}
        <div className="cards-grid">
          {apartments.map((apt) => (
            <div key={apt.id} className="layout-card-wrapper">
              <div className="layout-card">
                <div className="layout-card__header">
                  <div className="layout-card__title-block">
                    <span className="layout-card__code">{apt.code}</span>
                    <span className="layout-card__floor">{apt.floor}</span>
                  </div>
                  <div className="layout-card__number-block">
                    <span className="layout-card__number">{apt.number}</span>
                    <span className="layout-card__status">{apt.status}</span>
                  </div>
                </div>
                
                <div className="layout-card__visual">
                  <img src={apt.image} alt={apt.title} className="layout-card__blueprint" />
                </div>

                <div className="layout-card__footer">
                  <h2 className="layout-card__name">{apt.title}</h2>
                  <span className="layout-card__price">{apt.price}</span>
                </div>
              </div>
              <Link href={`/az/off-plan/${apt.id}`} className="layout-card__cta">View Apartment Details</Link>
            </div>
          ))}
        </div>

        {/* DESKTOP PAGINATION */}
        <div className="pagination-desktop">
          <div className="pagination-numbers">
            <span className="pagination-num pagination-num--active">1</span>
            <span className="pagination-num">2</span>
            <span className="pagination-num">3</span>
            <span className="pagination-num">4</span>
            <span className="pagination-num">5</span>
            <span className="pagination-dots">...</span>
            <span className="pagination-num">40</span>
          </div>
          <button type="button" className="pagination-next-btn" aria-label="Next page">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        {/* MOBILE PAGINATION */}
        <div className="pagination-mobile">
          <span className="pagination-shown">Shown 12 out of 24</span>
          <div className="pagination-progress">
            <div className="pagination-progress__fill"></div>
          </div>
          <button type="button" className="pagination-show-more">Show more</button>
        </div>
    </section>
  );
}
