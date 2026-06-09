'use client';

import React, { useState } from 'react';
import './unit-layout.css';

export default function UnitLayout() {
  // Seçim State-ləri
  const [currency, setCurrency] = useState('USD');
  const [floor, setFloor] = useState('3');
  const [view, setView] = useState('Sea view');
  const [status, setStatus] = useState('Available');
  const [selectedRooms, setSelectedRooms] = useState<string>('1');

  // İnteraktiv Qiymət Slider State-ləri
  const [priceMin, setPriceMin] = useState(188874);
  const [priceMax, setPriceMax] = useState(849849);
  const totalPriceMin = 50000;
  const totalPriceMax = 1500000;

  // İnteraktiv Sahə Slider State-ləri
  const [areaMin, setAreaMin] = useState(35);
  const [areaMax, setAreaMax] = useState(430);
  const totalAreaMin = 10;
  const totalAreaMax = 600;

  const roomOptions = ['S', '1', '2', '3', '4+'];

  // Track fill faizləri
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

          {/* Area & Floor Wrapper (Mobildə yan-yana durması üçün) */}
          <div className="mobile-flex-row filter-group--area-floor">
            {/* Area Filter */}
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

            {/* Floor Filter */}
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

          {/* View & Status Wrapper (Mobildə yan-yana durması üçün) */}
          <div className="mobile-flex-row filter-group--view-status">
            {/* View Filter */}
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

            {/* Status Filter */}
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
    </section>
  );
}