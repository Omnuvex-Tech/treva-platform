'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UnitCardV2 from '@/app/components/UnitCardV2';
import Navbar from '@/app/components/Home/TrevaHero/navbar';
import { HomeFooter } from '@/app/components/Home/HomeFooter';
import CallbackForm from '@/app/components/Home/Callback/CallbackForm';
import PageContainer from '@/app/components/Container/PageContainer';
import { getSaved, removeSaved, type SavedProperty } from '@/lib/saved-properties';
import { getTrevaAssetUrl as getAssetUrl } from '@/lib/asset-url';
import { getCompared, addCompared, removeCompared } from '@/lib/compare-properties';
import '../resale/resale-listing.css';
import './wishlist.css';

function getLocalizedApartmentTypeLabel(
  apartmentType: { slug?: string; title?: string } | undefined,
  locale: 'az' | 'en' | 'ru'
) {
  const normalized = String(apartmentType?.slug || apartmentType?.title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const translations = {
    country_house: {
      az: 'Həyət evi/Bağ evi',
      en: 'Country House',
      ru: 'Отдельный дом',
    },
    detached_house: {
      az: 'Həyət evi/Bağ evi',
      en: 'Country House',
      ru: 'Отдельный дом',
    },
    new_constructed: {
      az: 'Yeni tikili',
      en: 'New Constructed',
      ru: 'Новостройка',
    },
    object: {
      az: 'Obyekt',
      en: 'Object',
      ru: 'Объект',
    },
    ofice: {
      az: 'Ofis',
      en: 'Office',
      ru: 'Офис',
    },
    old_constructed: {
      az: 'Köhnə tikili',
      en: 'Old Constructed',
      ru: 'Старый фонд',
    },
  } as const;

  return translations[normalized as keyof typeof translations]?.[locale] ?? apartmentType?.title ?? '';
}

const savedDictionary = {
  az: {
    titleThin: 'SEÇİLMİŞ',
    titleBold: 'ƏMLAKLAR',
    properties: 'əmlak',
    loading: 'Yüklənir...',
    emptyTitle: 'Hələ saxlanılmış əmlak yoxdur',
    browse: 'ƏMLAKLARA BAX',
    removeLabel: 'Seçilmişlərdən sil',
    compareListing: 'Müqayisəyə əlavə et',
    removeFromCompare: 'Müqayisədən çıxar',
    viewDetails: 'Mənzilə bax',
    room: 'otaqlı',
    floor: 'mərtəbə',
    offPlanTitle: 'Tikilməkdə',
    resaleTitle: 'Təkrar satış',
  },
  en: {
    titleThin: 'SAVED',
    titleBold: 'PROPERTIES',
    properties: 'properties',
    loading: 'Loading...',
    emptyTitle: 'No saved properties yet',
    browse: 'BROWSE PROPERTIES',
    removeLabel: 'Remove from saved',
    compareListing: 'Add to comparison',
    removeFromCompare: 'Remove from comparison',
    viewDetails: 'View Apartment Details',
    room: 'room',
    floor: 'floor',
    offPlanTitle: 'Off-Plan',
    resaleTitle: 'Resale',
  },
  ru: {
    titleThin: 'ИЗБРАННАЯ',
    titleBold: 'НЕДВИЖИМОСТЬ',
    properties: 'объектов',
    loading: 'Загрузка...',
    emptyTitle: 'Сохраненных объектов пока нет',
    browse: 'СМОТРЕТЬ ОБЪЕКТЫ',
    removeLabel: 'Удалить из сохраненных',
    compareListing: 'Добавить к сравнению',
    removeFromCompare: 'Убрать из сравнения',
    viewDetails: 'Смотреть квартиру',
    room: 'комн.',
    floor: 'этаж',
    offPlanTitle: 'Новостройки',
    resaleTitle: 'Вторичное',
  },
} as const;

export default function SavedPage() {
  const params = useParams();
  const locale = ((params?.locale as string) || 'az') as 'az' | 'en' | 'ru';
  const content = savedDictionary[locale as keyof typeof savedDictionary] ?? savedDictionary.az;
  const [items, setItems] = useState<SavedProperty[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(getSaved());
    setComparedIds(getCompared().map((p) => p.id));
    setLoaded(true);
  }, []);

  const handleRemove = (id: string) => {
    removeSaved(id);
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const toggleCompare = (item: SavedProperty) => {
    if (comparedIds.includes(item.id)) {
      removeCompared(item.id);
      setComparedIds(prev => prev.filter(id => id !== item.id));
    } else {
      addCompared({
        id: item.id,
        slug: item.slug,
        type: item.type,
        image: item.image,
        price: item.price,
        currency: item.currency,
        rooms: item.rooms,
        area: item.area,
        floor: item.floor,
        project: item.project || item.location,
        title: item.title,
      });
      setComparedIds(prev => [...prev, item.id]);
    }
  };

  const formatPrice = (p: number) =>
    p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const getPriceByArea = (item: SavedProperty) => {
    if (typeof item.priceByArea === 'number' && item.priceByArea > 0) return item.priceByArea;
    const numericArea = Number(String(item.area).replace(',', '.'));
    if (!Number.isFinite(numericArea) || numericArea <= 0) return 0;
    return Math.round(item.price / numericArea);
  };

  const offPlanItems = items.filter((item) => item.type === 'off-plan');
  const resaleItems = items.filter((item) => item.type === 'resale');

  const renderCard = (item: SavedProperty) => {
    const detailHref = item.type === 'off-plan'
      ? `/${locale}/off-plan/${item.slug}`
      : `/${locale}/resale/${item.slug}`;
    const badge = item.type === 'off-plan'
      ? (item.project || '')
      : (getLocalizedApartmentTypeLabel(
          { slug: item.apartmentTypeSlug, title: item.apartmentTypeTitle },
          locale
        ) || (item.rooms ? `${item.rooms} ${content.room}` : ''));

    return (
      <UnitCardV2
        key={item.id}
        href={detailHref}
        image={getAssetUrl(item.image) || undefined}
        alt={item.location || item.title}
        price={`${formatPrice(item.price)} ${item.currency}`}
        developer={item.location || item.project || undefined}
        specs={[
          badge,
          item.rooms ? `${item.rooms}-${content.room}` : '',
          item.area ? `${item.area} m²` : '',
          item.floor ? `${item.floor} ${content.floor}` : '',
        ]}
        saved
        compared={comparedIds.includes(item.id)}
        onSave={() => handleRemove(item.id)}
        onCompare={() => toggleCompare(item)}
        labels={{
          save: content.removeLabel,
          saved: content.removeLabel,
          compare: content.compareListing,
          compared: content.removeFromCompare,
        }}
      />
    );
  };

  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <main className="main-wrapper">
        <PageContainer className="saved-page-container">
          <header className="saved-header">
            <div className="saved-title-wrap">
              <h1 className="saved-title">
                <span className="saved-title-thin">{content.titleThin}</span>
                <span className="saved-title-bold">{content.titleBold}</span>
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
            <>
              {offPlanItems.length > 0 && (
                <section className="saved-section">
                  <h2 className="saved-section-title">{content.offPlanTitle}</h2>
                  <main className="re-grid">{offPlanItems.map(renderCard)}</main>
                </section>
              )}

              {resaleItems.length > 0 && (
                <section className="saved-section">
                  <h2 className="saved-section-title">{content.resaleTitle}</h2>
                  <main className="re-grid">{resaleItems.map(renderCard)}</main>
                </section>
              )}
            </>
          )}
        </PageContainer>
      </main>
      <CallbackForm allowedRoles={['Client']} />
      <HomeFooter locale={locale} />
    </div>
  );
}
