'use client';

import React from 'react';
import { DirectionButton } from '@/app/components/Buttons/PortfolioButtons';
import './unit-layout.css';

export default function UnitLayout() {
  return (
    <main className="layouts-section">
      {/* Header Controls */}
      <header className="layouts-header">
        <h1 className="layouts-header__title">
          Unit <span>Layouts</span>
        </h1>
        
        <div className="layouts-controls">
          <nav className="layouts-controls__nav" aria-label="Carousel Navigation">
            <DirectionButton direction="previous" label="Previous layout" />
            <DirectionButton direction="next" label="Next layout" />
          </nav>
          <button className="layouts-controls__view-all">View All</button>
        </div>
      </header>

      {/* Layouts Grid */}
      <div className="layouts-grid">
        
        {/* Card 1 */}
        <article className="layout-card">
          <div className="layout-card__header">
            <div className="layout-card__title-block">
              <span className="layout-card__code">1BR Junior</span>
              <span className="layout-card__floor">23 floor</span>
            </div>
            <span className="layout-card__number">N° 1</span>
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
        </article>

        {/* Card 2 */}
        <article className="layout-card">
          <div className="layout-card__header">
            <div className="layout-card__title-block">
              <span className="layout-card__code">1BR-A</span>
              <span className="layout-card__floor">23 floor</span>
            </div>
            <span className="layout-card__number">N° 2</span>
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
        </article>

        {/* Card 3 */}
        <article className="layout-card">
          <div className="layout-card__header">
            <div className="layout-card__title-block">
              <span className="layout-card__code">1BR-B</span>
              <span className="layout-card__floor">1 floor</span>
            </div>
            <span className="layout-card__number">N° 3</span>
          </div>
          
          <div className="layout-card__visual">
            <svg className="layout-card__blueprint" viewBox="0 0 300 220" width="100%" height="100%">
              <path d="M30,10 L270,10 C270,10 270,170 270,170 C270,170 240,200 190,160 L30,40 Z" fill="none" stroke="#2b3541" strokeWidth="3"/>
              <path d="M30,10 L30,40 M270,10 L270,180 C270,195 250,210 230,195 L65,55" fill="none" stroke="#2b3541" strokeWidth="3"/>
              <line x1="110" y1="10" x2="110" y2="75" stroke="#2b3541" strokeWidth="2"/>
              <line x1="110" y1="75" x2="270" y2="75" stroke="#2b3541" strokeWidth="2"/>
              <text x="75" y="28" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Bath</text>
              <text x="75" y="38" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.6 x 1.6</text>
              <text x="75" y="60" fontFamily="Inter" fontSize="8" fill="#2b3541" textAnchor="middle" fontWeight="500">Powder</text>
              <text x="75" y="70" fontFamily="Inter" fontSize="7" fill="#8e949a" textAnchor="middle">2.2 x 1.4</text>
              <text x="210" y="32" fontFamily="Inter" fontSize="9" fill="#2b3541" textAnchor="middle" fontWeight="500">Bedroom</text>
              <text x="210" y="44" fontFamily="Inter" fontSize="8" fill="#8e949a" textAnchor="middle">4.7 x 3.1</text>
              <text x="180" y="140" fontFamily="Inter" fontSize="10" fill="#2b3541" textAnchor="middle" fontWeight="500">Living & Kitchen</text>
              <text x="180" y="152" fontFamily="Inter" fontSize="9" fill="#8e949a" textAnchor="middle">8.3 x 6.8</text>
              <circle cx="165" cy="110" r="14" fill="none" stroke="#8e949a"/>
              <rect x="185" y="85" width="65" height="25" fill="none" stroke="#8e949a"/>
            </svg>
          </div>

          <div className="layout-card__footer">
            <h2 className="layout-card__name">1 Bedroom Type B, 67.8 m²</h2>
            <span className="layout-card__price">$224 103</span>
          </div>
        </article>

      </div>
    </main>
  );
}