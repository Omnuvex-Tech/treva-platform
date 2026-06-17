'use client';

import React, { useState, useRef, useEffect } from 'react';
import './unit-filter.css';

const CURRENCIES = ['USD', 'AZN'];
const FLOOR_OPTIONS = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
const VIEW_OPTIONS = ['All', 'City', 'Sea', 'Mountain', 'Park', 'Courtyard'];
const STATUS_OPTIONS = ['All', 'Renovated', 'Without renovation', 'Euro renovation', 'Cosmic renovation', 'Designer renovation'];
const ROOM_OPTIONS = ['1', '2', '3', '4', '5+'];

export default function ResaleFilter() {
  const [currency, setCurrency] = useState('USD');
  const [floor, setFloor] = useState('All');
  const [selectedView, setSelectedView] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRooms, setSelectedRooms] = useState('');

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const currencyRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [priceMin, setPriceMin] = useState<number | ''>(0);
  const [priceMax, setPriceMax] = useState<number | ''>(1500000);
  const [priceMinInput, setPriceMinInput] = useState<number | ''>(0);
  const [priceMaxInput, setPriceMaxInput] = useState<number | ''>(1500000);
  const totalPriceMin = 0;
  const totalPriceMax = 1500000;

  const [areaMin, setAreaMin] = useState<number | ''>(0);
  const [areaMax, setAreaMax] = useState<number | ''>(500);
  const [areaMinInput, setAreaMinInput] = useState<number | ''>(0);
  const [areaMaxInput, setAreaMaxInput] = useState<number | ''>(500);
  const totalAreaMin = 0;
  const totalAreaMax = 500;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (floorRef.current && !floorRef.current.contains(e.target as Node)) setFloorOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safePriceMin = typeof priceMin === 'number' ? priceMin : 0;
  const safePriceMax = typeof priceMax === 'number' ? priceMax : totalPriceMax;
  const safeAreaMin = typeof areaMin === 'number' ? areaMin : 0;
  const safeAreaMax = typeof areaMax === 'number' ? areaMax : totalAreaMax;

  const priceLeftPercent = ((safePriceMin - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;
  const priceRightPercent = 100 - ((safePriceMax - totalPriceMin) / (totalPriceMax - totalPriceMin)) * 100;

  const areaLeftPercent = ((safeAreaMin - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;
  const areaRightPercent = 100 - ((safeAreaMax - totalAreaMin) / (totalAreaMax - totalAreaMin)) * 100;

  const handleReset = () => {
    setFloor('All');
    setSelectedView('All');
    setSelectedStatus('All');
    setSelectedRooms('');
    setPriceMin(0);
    setPriceMinInput(0);
    setPriceMax(totalPriceMax);
    setPriceMaxInput(totalPriceMax);
    setAreaMin(0);
    setAreaMinInput(0);
    setAreaMax(totalAreaMax);
    setAreaMaxInput(totalAreaMax);
  };

  return (
    <section className="layout-section">
      {/* HEADER */}
      <div className="layout-header">
        <h2 className="layout-title">
          <span className="layout-title-thin">Resale</span>
          <span className="layout-title-bold">apartments</span>
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
                  value={priceMinInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s+/g, '');
                    if (raw === '') { setPriceMinInput(''); return; }
                    if (!/^\d+$/.test(raw)) return;
                    setPriceMinInput(Number(raw));
                  }}
                  onBlur={() => {
                    const raw = priceMinInput === '' ? 0 : Number(priceMinInput);
                    const val = Math.max(totalPriceMin, Math.min(raw, safePriceMax - 1000));
                    setPriceMin(val);
                    setPriceMinInput(val);
                  }}
                />
              </div>
              <div className="input-with-prefix">
                <span>to</span>
                <input
                  type="text"
                  value={priceMaxInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s+/g, '');
                    if (raw === '') { setPriceMaxInput(''); return; }
                    if (!/^\d+$/.test(raw)) return;
                    setPriceMaxInput(Number(raw));
                  }}
                  onBlur={() => {
                    const raw = priceMaxInput === '' ? totalPriceMax : Number(priceMaxInput);
                    const val = Math.max(safePriceMin + 1000, Math.min(raw, totalPriceMax));
                    setPriceMax(val);
                    setPriceMaxInput(val);
                  }}
                />
              </div>
            </div>

            <div className="custom-select currency-select" ref={currencyRef}>
              <button type="button" className="custom-select__trigger" onClick={() => setCurrencyOpen((p) => !p)}>
                <span>{currency}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {currencyOpen && (
                <div className="custom-select__dropdown">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`custom-select__option ${currency === c ? 'custom-select__option--active' : ''}`}
                      onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
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
              value={safePriceMin}
              className="thumb thumb--left"
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), safePriceMax - 1000);
                setPriceMin(val);
                setPriceMinInput(val);
              }}
            />
            <input
              type="range"
              min={totalPriceMin}
              max={totalPriceMax}
              value={safePriceMax}
              className="thumb thumb--right"
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), safePriceMin + 1000);
                setPriceMax(val);
                setPriceMaxInput(val);
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
                  value={areaMinInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s+/g, '');
                    if (raw === '') { setAreaMinInput(''); return; }
                    if (!/^\d+$/.test(raw)) return;
                    setAreaMinInput(Number(raw));
                  }}
                  onBlur={() => {
                    const raw = areaMinInput === '' ? 0 : Number(areaMinInput);
                    const val = Math.max(totalAreaMin, Math.min(raw, safeAreaMax - 5));
                    setAreaMin(val);
                    setAreaMinInput(val);
                  }}
                />
              </div>
              <div className="input-with-prefix">
                <span>to</span>
                <input
                  type="text"
                  value={areaMaxInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s+/g, '');
                    if (raw === '') { setAreaMaxInput(''); return; }
                    if (!/^\d+$/.test(raw)) return;
                    setAreaMaxInput(Number(raw));
                  }}
                  onBlur={() => {
                    const raw = areaMaxInput === '' ? totalAreaMax : Number(areaMaxInput);
                    const val = Math.max(safeAreaMin + 5, Math.min(raw, totalAreaMax));
                    setAreaMax(val);
                    setAreaMaxInput(val);
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
                value={safeAreaMin}
                className="thumb thumb--left"
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), safeAreaMax - 5);
                  setAreaMin(val);
                  setAreaMinInput(val);
                }}
              />
              <input
                type="range"
                min={totalAreaMin}
                max={totalAreaMax}
                value={safeAreaMax}
                className="thumb thumb--right"
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), safeAreaMin + 5);
                  setAreaMax(val);
                  setAreaMaxInput(val);
                }}
              />
            </div>
          </div>

          <div className="filter-group filter-group--floor">
            <label className="filter-label">Floor</label>
            <div className="custom-select" ref={floorRef}>
              <button type="button" className="custom-select__trigger" onClick={() => setFloorOpen((p) => !p)}>
                <span>{floor}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {floorOpen && (
                <div className="custom-select__dropdown">
                  {FLOOR_OPTIONS.map((f) => (
                    <button key={f} type="button" className={`custom-select__option ${floor === f ? 'custom-select__option--active' : ''}`} onClick={() => { setFloor(f); setFloorOpen(false); }}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View & Status Wrapper */}
        <div className="mobile-flex-row filter-group--view-status">
          <div className="filter-group filter-group--view">
            <label className="filter-label">View</label>
            <div className="custom-select" ref={viewRef}>
              <button type="button" className="custom-select__trigger" onClick={() => setViewOpen((p) => !p)}>
                <span>{selectedView}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {viewOpen && (
                <div className="custom-select__dropdown">
                  {VIEW_OPTIONS.map((v) => (
                    <button key={v} type="button" className={`custom-select__option ${selectedView === v ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedView(v); setViewOpen(false); }}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-group filter-group--status">
            <label className="filter-label">Status</label>
            <div className="custom-select" ref={statusRef}>
              <button type="button" className="custom-select__trigger" onClick={() => setStatusOpen((p) => !p)}>
                <span>{selectedStatus}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {statusOpen && (
                <div className="custom-select__dropdown">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} type="button" className={`custom-select__option ${selectedStatus === s ? 'custom-select__option--active' : ''}`} onClick={() => { setSelectedStatus(s); setStatusOpen(false); }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Number of Rooms Filter */}
        <div className="filter-group filter-group--rooms">
          <label className="filter-label">Number of rooms</label>
          <div className="rooms-group">
            {ROOM_OPTIONS.map((room) => (
              <button
                key={room}
                type="button"
                className={`room-btn ${selectedRooms === room ? 'room-btn--active' : ''}`}
                onClick={() => setSelectedRooms(selectedRooms === room ? '' : room)}
              >
                {room}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS & RESET ROW */}
      <div className="results-row">
        <span className="results-count">1072 apartments found</span>
        <button type="button" className="reset-btn" onClick={handleReset}>Reset filters</button>
      </div>
    </section>
  );
}
