'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import CallbackForm from '@/app/components/Home/Callback/CallbackForm';
import PageContainer from '@/app/components/Container/PageContainer';
import { getSaved, removeSaved, type SavedProperty } from '@/lib/saved-properties';
import '@/app/[locale]/resale/resale-listing.css';
import './saved.css';

export default function SavedPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const [items, setItems] = useState<SavedProperty[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(getSaved());
    setLoaded(true);
  }, []);

  const handleRemove = (id: string) => {
    removeSaved(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const formatPrice = (p: number) =>
    p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return (
    <div className="re-page-wrapper">
      <Navbar variant="solid" />
      <main className="re-main-wrapper">
        <PageContainer>
          <header className="re-header">
            <h1 className="re-main-title">SAVED PROPERTIES</h1>
            <div className="re-controls-row">
              <div className="re-property-count">{items.length} properties</div>
            </div>
          </header>

          {!loaded ? (
            <div className="py-16 text-center text-white/50">Loading...</div>
          ) : items.length === 0 ? (
            <div className="saved-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <p>No saved properties yet</p>
              <Link href={`/${locale}/resale`} className="saved-browse-btn">
                Browse Properties
              </Link>
            </div>
          ) : (
            <main className="re-grid">
              {items.map((item) => (
                <div key={item.id} className="re-card-wrapper">
                  <article className="re-card">
                    <div className="re-card-media">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'}
                        alt={item.location || item.title}
                        className="re-card-img"
                      />
                    </div>

                    <div className="re-card-body">
                      <div className="re-card-meta-row">
                        <span className="re-badge">{item.rooms ? `${item.rooms} ROOM` : ''}</span>
                        <button
                          type="button"
                          className="re-bookmark-btn active"
                          onClick={() => handleRemove(item.id)}
                          aria-label="Remove from saved"
                        >
                          <svg width="15" height="30" viewBox="0 0 20 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 0C0.89543 0 0 0.89543 0 2V24.5L10 19L20 24.5V2C20 0.89543 19.1046 0 18 0H2Z"/>
                          </svg>
                        </button>
                      </div>

                      <div className="re-price-block">
                        <h2 className="re-main-price">{formatPrice(item.price)} {item.currency}</h2>
                      </div>

                      <div className="re-tags-row">
                        {item.rooms && <span className="re-tag">{item.rooms}-room sq.</span>}
                        {item.area && <span className="re-tag">{item.area} m²</span>}
                        {item.floor && <span className="re-tag">{item.floor} floor</span>}
                      </div>

                      <p className="re-address">{item.location || '—'}</p>
                    </div>
                  </article>

                  <Link href={`/${locale}/resale/${item.slug}`} className="re-action-btn">
                    VIew Apartment DetaIls
                  </Link>
                </div>
              ))}
            </main>
          )}
        </PageContainer>
      </main>
      <CallbackForm />
      <HomeFooter />
    </div>
  );
}
