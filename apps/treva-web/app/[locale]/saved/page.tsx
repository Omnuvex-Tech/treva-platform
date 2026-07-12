'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import CallbackForm from '@/app/components/Home/Callback/CallbackForm';
import PageContainer from '@/app/components/Container/PageContainer';
import { getSaved, removeSaved, type SavedProperty } from '@/lib/saved-properties';
import './saved.css';

const savedDictionary = {
  az: {
    properties: 'əmlak',
    loading: 'Yüklənir...',
    emptyTitle: 'Hələ saxlanılmış əmlak yoxdur',
    browse: 'ƏMLAKLARA BAX',
    removeLabel: 'Seçilmişlərdən sil',
    viewDetails: 'Mənzil detallarına bax',
  },
  en: {
    properties: 'properties',
    loading: 'Loading...',
    emptyTitle: 'No saved properties yet',
    browse: 'BROWSE PROPERTIES',
    removeLabel: 'Remove from saved',
    viewDetails: 'View apartment details',
  },
  ru: {
    properties: 'объектов',
    loading: 'Загрузка...',
    emptyTitle: 'Сохраненных объектов пока нет',
    browse: 'СМОТРЕТЬ ОБЪЕКТЫ',
    removeLabel: 'Удалить из сохраненных',
    viewDetails: 'Смотреть детали квартиры',
  },
} as const;

export default function SavedPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'az';
  const content = savedDictionary[locale as keyof typeof savedDictionary] ?? savedDictionary.az;
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
    <div className="page-wrapper">
      <Navbar variant="solid" />
      <main className="main-wrapper">
        <PageContainer className="saved-page-container">
          <header className="saved-header">
            <div className="saved-title-wrap">
              <h1 className="saved-title">
                <span className="saved-title-thin">SEÇİLMİŞ</span>
                <span className="saved-title-bold">ƏMLAKLAR</span>
              </h1>
              <span className="saved-count">({items.length})</span>
            </div>
          </header>

          {!loaded ? (
            <div className="saved-empty-shell">
              <div className="saved-empty">
                <p>{content.loading}</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="saved-empty-shell">
              <div className="saved-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <p>{content.emptyTitle}</p>
                <Link href={`/${locale}/resale`} className="saved-browse-btn">
                  {content.browse}
                </Link>
              </div>
            </div>
          ) : (
            <main className="saved-grid">
              {items.map((item) => (
                <div key={item.id} className="saved-card-wrapper">
                  <article className="saved-card">
                    <div className="saved-card-media">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop'}
                        alt={item.location || item.title}
                        className="saved-card-img"
                      />
                    </div>

                    <div className="saved-card-body">
                      <div className="saved-card-meta-row">
                        <span className="saved-badge">{item.rooms ? `${item.rooms} ROOM` : ''}</span>
                        <button
                          type="button"
                          className="saved-bookmark-btn active"
                          onClick={() => handleRemove(item.id)}
                          aria-label={content.removeLabel}
                        >
                          <svg width="15" height="30" viewBox="0 0 20 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 0C0.89543 0 0 0.89543 0 2V24.5L10 19L20 24.5V2C20 0.89543 19.1046 0 18 0H2Z"/>
                          </svg>
                        </button>
                      </div>

                      <div className="saved-price-block">
                        <h2 className="saved-main-price">{formatPrice(item.price)} {item.currency}</h2>
                      </div>

                      <div className="saved-tags-row">
                        {item.rooms && <span className="saved-tag">{item.rooms}-room sq.</span>}
                        {item.area && <span className="saved-tag">{item.area} m²</span>}
                        {item.floor && <span className="saved-tag">{item.floor} floor</span>}
                      </div>

                      <p className="saved-address">{item.location || '—'}</p>
                    </div>
                  </article>

                  <Link href={`/${locale}/resale/${item.slug}`} className="saved-action-btn">
                    {content.viewDetails}
                  </Link>
                </div>
              ))}
            </main>
          )}
        </PageContainer>
      </main>
      <CallbackForm allowedRoles={['Client']} />
      <HomeFooter />
    </div>
  );
}
