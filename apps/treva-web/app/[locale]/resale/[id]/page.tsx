'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import PageContainer from '@/app/components/Container/PageContainer';
import './resale-detail.css';

export default function ResaleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const locale = (params?.locale as string) || 'az';

  const [showPhone, setShowPhone] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="pdet-page-wrapper">
      <Navbar variant="solid" />
      <main className="pdet-main-wrapper">
        <PageContainer>
          <nav className="pdet-breadcrumb">
            <Link href={`/${locale}`} className="pdet-breadcrumb-link">Main</Link>
            <span className="pdet-breadcrumb-sep">/</span>
            <Link href={`/${locale}/resale`} className="pdet-breadcrumb-link">Resale</Link>
            <span className="pdet-breadcrumb-sep">/</span>
            <span className="pdet-breadcrumb-current">N° {id}</span>
          </nav>

          <div className="pdet-container">
            <div className="pdet-main-grid">
              <div className="pdet-gallery-pane">
                <div className="pdet-image-wrapper">
                  <img
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop"
                    alt="2-Room flat main view"
                    className="pdet-main-img"
                  />
                  <div className="pdet-mobile-counter">1/7</div>
                </div>

                <div className="pdet-thumbnails-grid">
                  <div className="pdet-thumb-box active"><img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=130&fit=crop" alt="View 1" /></div>
                  <div className="pdet-thumb-box"><img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=130&fit=crop" alt="View 2" /></div>
                  <div className="pdet-thumb-box"><img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=130&fit=crop" alt="View 3" /></div>
                  <div className="pdet-thumb-box"><img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=130&fit=crop" alt="View 4" /></div>
                  <div className="pdet-thumb-box"><img src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=200&h=130&fit=crop" alt="View 5" /></div>
                  <div className="pdet-thumb-box pdet-thumb-overlay">
                    <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=200&h=130&fit=crop" alt="More views" />
                    <div className="pdet-overlay-text">+4 photos</div>
                  </div>
                </div>

                <div className="pdet-content-footer pdet-content-footer--desktop">
                  <div className="pdet-desc-block">
                    <h1 className="pdet-main-title">2-ROOM FLAT, 60 M², 8/16 FLOOR</h1>
                    <p className="pdet-address-line">Baku city, Murtuza Mukhtarov str, house 31</p>
                  </div>

                  <div className="pdet-price-block">
                    <div className="pdet-price-tag">175 000 AZN</div>
                    <div className="pdet-sqm-badge">2 917 AZN/m²</div>
                  </div>
                </div>
              </div>

              <div className="pdet-content-footer pdet-content-footer--mobile">
                <div className="pdet-desc-block">
                  <h1 className="pdet-main-title">2-ROOM FLAT, 60 M², 8/16 FLOOR</h1>
                  <p className="pdet-address-line">Baku city, Murtuza Mukhtarov str, house 31</p>
                </div>

                <div className="pdet-price-block">
                  <div className="pdet-price-tag">175 000 AZN</div>
                  <div className="pdet-sqm-badge">2 917 AZN/m²</div>
                </div>
              </div>

              <div className="pdet-sidebar-pane">
                <div className="pdet-action-widget">
                  <button type="button" className="pdet-widget-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    <span>Share</span>
                  </button>
                  <div className="pdet-widget-divider"></div>
                  <button
                    type="button"
                    className={`pdet-widget-btn ${isSaved ? 'saved' : ''}`}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <div className="pdet-agent-card">
                  <div className="pdet-agent-header">
                    <div className="pdet-agent-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="pdet-agent-info">
                      <h3 className="pdet-agent-name">Farid Aliyev</h3>
                      <span className="pdet-agent-role">Agent</span>
                    </div>
                  </div>

                  <div className="pdet-agent-actions">
                    <button
                      type="button"
                      className="pdet-btn-primary"
                      onClick={() => setShowPhone(!showPhone)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{showPhone ? '+994 (50) 123-4567' : 'View phone number'}</span>
                    </button>

                    <button type="button" className="pdet-btn-secondary">
                      Request a call
                    </button>
                  </div>
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
