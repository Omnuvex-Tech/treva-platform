"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Home } from 'lucide-react';
import './treva-hero.css';
import PageContainer from '@/app/components/Container/PageContainer';
import Navbar from './navbar';

type PillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isPressed?: boolean;
};

function PillButton({ className = '', isPressed = false, ...props }: PillButtonProps) {
  return (
    <button
      className={`treva-pill-button ${isPressed ? 'treva-pill-button--pressed' : ''} ${className}`}
      suppressHydrationWarning
      {...props}
    />
  );
}

interface CategoryOption {
  title: string;
  slug: string;
}

const heroDictionary = {
  az: {
    title: (
      <>
        Daşınmaz Əmlak <br />
        Dünyasında Etibarlı <br />
        Bələdçiniz
      </>
    ),
    subtitle: "Doğru investisiya seçimləri və fərdi həyat tərzi həlləri təqdim edən platforma.",
    location: "MƏKAN",
    dealOptions: ["Resale", "Off-Plan"],
  },
  en: {
    title: (
      <>
        Your Gateway To The <br />
        World's ExclusIve <br />
        PropertIes
      </>
    ),
    subtitle: "Curated real estate investments and tailored lifestyle solutions.",
    location: "LOCATION",
    dealOptions: ["Resale", "Off-Plan"],
  },
  ru: {
    title: (
      <>
        Ваш Надёжный Путеводитель <br />
        В Мире Эксклюзивной <br />
        Недвижимости
      </>
    ),
    subtitle: "Надёжная платформа для правильных инвестиций и индивидуальных решений для жизни.",
    location: "МЕСТОПОЛОЖЕНИЕ",
    dealOptions: ["Resale", "Off-Plan"],
  },
} as const;

export default function TrevaHero() {
  const pathname = usePathname();
  const router = useRouter();
  const detectedLocale = pathname?.split("/")[1];
  const locale = (detectedLocale && detectedLocale in heroDictionary) ? detectedLocale as keyof typeof heroDictionary : "az";
  const content = heroDictionary[locale];

  const [dealType, setDealType] = useState<string>(content.dealOptions[0]);
  const [dealMenuOpen, setDealMenuOpen] = useState(false);
  const dealDropdownRef = useRef<HTMLDivElement>(null);

  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCategory = localStorage.getItem('treva_selectedCategory');
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
    const savedDeal = localStorage.getItem('treva_dealType');
    if (savedDeal && content.dealOptions.includes(savedDeal as any)) {
      setDealType(savedDeal);
    }
  }, []);

  useEffect(() => {
    setDealType(content.dealOptions[0]);
  }, [locale]);

  useEffect(() => {
    const trevaApiUrl = process.env.NEXT_PUBLIC_TREVA_API_URL || "http://localhost:10011/api/v1";
    fetch(`${trevaApiUrl}/categories/featured`)
      .then((res) => res.json())
      .then((raw) => {
        const data = Array.isArray(raw) ? raw : raw.value || [];
        const cats = data.map((cat: any) => ({ title: cat.title, slug: cat.slug }));
        setCategories(cats);
        const saved = localStorage.getItem('treva_selectedCategory');
        if (saved) {
          setSelectedCategory(saved);
        } else if (cats.length > 0 && !selectedCategory) {
          setSelectedCategory(cats[0].title);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dealDropdownRef.current && !dealDropdownRef.current.contains(event.target as Node)) {
        setDealMenuOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = useCallback(() => {
    const path = dealType === "Resale" ? "resale" : "off-plan";
    const selectedCat = categories.find((c) => c.title === selectedCategory);
    const categoryParam = selectedCat ? `?category=${selectedCat.slug}` : '';
    router.push(`/${locale}/${path}${categoryParam}`);
  }, [dealType, locale, router, categories, selectedCategory]);

  const handleCategoryClick = useCallback((slug: string, title: string) => {
    setLocationMenuOpen(false);
    setSelectedCategory(title);
    localStorage.setItem('treva_selectedCategory', title);
  }, []);

  return (
    <>
      <Navbar />

      {/* ========== HERO SECTION ========== */}
      <div className="treva-hero-container">
        <div className="treva-hero-bg">
          <img
            src="/images/treva-hero-bg.jpg"
            alt="Luxury coastal skyline and modern residence architecture"
            className="treva-hero-bg__image"
          />
          <div className="treva-hero-bg__overlay" />
        </div>

        <PageContainer as="main" className="treva-hero-content">
          <h1 className="treva-hero-title">
            {content.title}
          </h1>

          <p className="treva-hero-subtitle">
            {content.subtitle}
          </p>

          <div className="treva-filter-bar">
            {/* MƏKAN dropdown */}
            <div className="treva-filter-bar__location-group" ref={locationDropdownRef}>
              <PillButton
                className="treva-filter-bar__input-group treva-filter-bar__input-group--clickable"
                isPressed={locationMenuOpen}
                onClick={() => { setLocationMenuOpen((prev) => !prev); setDealMenuOpen(false); }}
              >
                <svg width="21" height="21" viewBox="0 0 23 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="treva-filter-bar__icon">
                  <path d="M11.5 30C17.3333 22.1923 22 15.5 22 11.0385C22 8.3761 20.8938 5.82277 18.9246 3.9402C16.9555 2.05762 14.2848 1 11.5 1C8.71523 1 6.04451 2.05762 4.07538 3.9402C2.10625 5.82277 1 8.3761 1 11.0385C1 15.5 5.66667 22.1923 11.5 30Z" stroke="#ffffff" strokeWidth="2"/>
                  <path d="M15 11.5C15 12.4283 14.6313 13.3185 13.9749 13.9749C13.3185 14.6313 12.4283 15 11.5 15C10.5717 15 9.6815 14.6313 9.02513 13.9749C8.36875 13.3185 8 12.4283 8 11.5C8 10.5717 8.36875 9.6815 9.02513 9.02513C9.6815 8.36875 10.5717 8 11.5 8C12.4283 8 13.3185 8.36875 13.9749 9.02513C14.6313 9.6815 15 10.5717 15 11.5Z" stroke="#ffffff" strokeWidth="2"/>
                </svg>
                <span className="treva-filter-bar__location-text">{selectedCategory || content.location}</span>
                <ChevronDown size={14} strokeWidth={2} className="treva-filter-bar__location-chevron" />
              </PillButton>

              {locationMenuOpen && categories.length > 0 && (
                <div className="treva-filter-bar__deal-menu treva-filter-bar__deal-menu--location" role="listbox">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      className={`treva-filter-bar__deal-option ${selectedCategory === cat.title ? 'treva-filter-bar__deal-option--active' : ''}`}
                      type="button"
                      role="option"
                      onClick={() => handleCategoryClick(cat.slug, cat.title)}
                    >
                      {cat.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Deal type dropdown */}
            <div className="treva-filter-bar__deal" ref={dealDropdownRef}>
              <PillButton
                className="treva-filter-bar__dropdown-btn"
                isPressed={dealMenuOpen}
                aria-haspopup="listbox"
                aria-expanded={dealMenuOpen}
                onClick={() => { setDealMenuOpen((prev) => !prev); setLocationMenuOpen(false); }}
              >
                <span>{dealType}</span>
                <ChevronDown size={14} strokeWidth={2} />
              </PillButton>

              {dealMenuOpen && (
                <div className="treva-filter-bar__deal-menu" role="listbox">
                  {content.dealOptions.map((option) => (
                    <button
                      key={option}
                      className="treva-filter-bar__deal-option"
                      type="button"
                      role="option"
                      aria-selected={dealType === option}
                      onClick={() => {
                        setDealType(option);
                        localStorage.setItem('treva_dealType', option);
                        setDealMenuOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Home button — navigates based on deal type */}
            <PillButton className="treva-filter-bar__home-btn" aria-label="Go to section" onClick={handleHomeClick}>
              <Home size={24} strokeWidth={2} />
            </PillButton>
          </div>
        </PageContainer>
      </div>
    </>
  );
}
