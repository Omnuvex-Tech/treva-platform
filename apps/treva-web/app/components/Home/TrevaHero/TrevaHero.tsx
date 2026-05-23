"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Home } from 'lucide-react';
import './treva-hero.css';
import PageContainer from '@/app/components/Container/PageContainer';

type PillButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isPressed?: boolean;
};

function PillButton({ className = '', isPressed = false, ...props }: PillButtonProps) {
  return (
    <button
      className={`treva-pill-button ${isPressed ? 'treva-pill-button--pressed' : ''} ${className}`}
      {...props}
    />
  );
}

function TrevaNavbarLogo() {
  return (
    <svg
      width="110"
      height="27"
      viewBox="0 0 121 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern
          id="treva-navbar-logo-pattern"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <image
            href="/images/treva-logo.png"
            width="594"
            height="420"
            preserveAspectRatio="none"
            transform="matrix(0.00281244 0 0 0.0126485 -0.335294 -1.889)"
          />
        </pattern>
      </defs>
      <rect width="121" height="27" fill="url(#treva-navbar-logo-pattern)" />
    </svg>
  );
}

export default function TrevaHero() {
  // Mobile menyu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dealType, setDealType] = useState('Buy');
  const [dealMenuOpen, setDealMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const dealDropdownRef = useRef<HTMLDivElement>(null);
  const dealOptions = ['Buy', 'Rent', 'Off-Plan'];

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileNavRef.current &&
        hamburgerRef.current &&
        !mobileNavRef.current.contains(event.target as Node) &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
        hamburgerRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1024 && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dealDropdownRef.current &&
        !dealDropdownRef.current.contains(event.target as Node)
      ) {
        setDealMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (hamburgerRef.current) {
      hamburgerRef.current.setAttribute('aria-expanded', String(mobileMenuOpen));
      hamburgerRef.current.setAttribute(
        'aria-label',
        mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
      );
    }
    if (mobileNavRef.current) {
      mobileNavRef.current.setAttribute('aria-hidden', String(!mobileMenuOpen));
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* ========== NAVBAR ========== */}
      <header className="treva-navbar" role="banner">
        <div className="treva-navbar__inner">
        <a href="#" className="treva-navbar__logo" aria-label="TREVA – Home">
          <TrevaNavbarLogo />
        </a>

        <nav className="treva-navbar__nav" aria-label="Primary navigation">
          <a href="#" className="treva-navbar__link">Projects</a>
          <a href="#" className="treva-navbar__link">About Us</a>
          <a href="#" className="treva-navbar__link">Contact Us</a>
          <a href="#" className="treva-navbar__link">Developers</a>
          <a href="#" className="treva-navbar__link">Brokers</a>
          <a href="#" className="treva-navbar__link">Off-Plan</a>
          <a href="#" className="treva-navbar__link">Resale</a>
          <a href="#" className="treva-navbar__link">Pulse</a>
        </nav>

        <div className="treva-navbar__controls">
        <div className="treva-navbar__actions">
          <PillButton className="treva-navbar__search-btn" aria-label="Open search">
            <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="5.8" cy="5.8" r="4.4" stroke="#ffffff" strokeWidth="1.4" />
              <line x1="9.2" y1="9.2" x2="13" y2="13" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="treva-navbar__search-text">Search</span>
          </PillButton>

          <button className="treva-navbar__lang" aria-label="Language: English" aria-haspopup="listbox">
            ENG
            <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <button
          ref={hamburgerRef}
          className="treva-navbar__hamburger"
          aria-label="Open navigation menu"
          aria-expanded="false"
          aria-controls="mobile-nav"
          onClick={toggleMobileMenu}
        >
          <span className="treva-navbar__hamburger__bar"></span>
          <span className="treva-navbar__hamburger__bar"></span>
          <span className="treva-navbar__hamburger__bar"></span>
        </button>
        </div>
        </div>
      </header>

      <nav
        ref={mobileNavRef}
        className={`treva-navbar__mobile ${mobileMenuOpen ? 'treva-navbar__mobile--open' : ''}`}
        id="mobile-nav"
        aria-label="Mobile navigation"
        aria-hidden="true"
      >
        <div className="treva-navbar__mobile__inner">
          <a href="#" className="treva-navbar__mobile__link">Projects</a>
          <a href="#" className="treva-navbar__mobile__link">About Us</a>
          <a href="#" className="treva-navbar__mobile__link">Contact Us</a>
          <a href="#" className="treva-navbar__mobile__link">Developers</a>
          <a href="#" className="treva-navbar__mobile__link">Brokers</a>
          <a href="#" className="treva-navbar__mobile__link">Off-Plan</a>
          <a href="#" className="treva-navbar__mobile__link">Resale</a>
          <a href="#" className="treva-navbar__mobile__link">Pulse</a>
          <div className="treva-navbar__mobile__footer">
            <PillButton className="treva-navbar__search-btn" aria-label="Open search">
              <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="5.8" cy="5.8" r="4.4" stroke="#ffffff" strokeWidth="1.4" />
                <line x1="9.2" y1="9.2" x2="13" y2="13" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Search
            </PillButton>
            <button className="treva-navbar__lang" aria-label="Language: English">
              ENG
              <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ========== HERO BÖLMƏSİ ========== */}
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
            Your Gateway To The <br />
            World's ExclusIve <br />
            PropertIes
          </h1>
          
          <p className="treva-hero-subtitle">
            Curated real estate investments and tailored lifestyle solutions.
          </p>

          <div className="treva-filter-bar">
            <div className="treva-filter-bar__input-group">
              <svg width="21" height="21" viewBox="0 0 23 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="treva-filter-bar__icon">
                <path d="M11.5 30C17.3333 22.1923 22 15.5 22 11.0385C22 8.3761 20.8938 5.82277 18.9246 3.9402C16.9555 2.05762 14.2848 1 11.5 1C8.71523 1 6.04451 2.05762 4.07538 3.9402C2.10625 5.82277 1 8.3761 1 11.0385C1 15.5 5.66667 22.1923 11.5 30Z" stroke="#ffffff" strokeWidth="2"/>
                <path d="M15 11.5C15 12.4283 14.6313 13.3185 13.9749 13.9749C13.3185 14.6313 12.4283 15 11.5 15C10.5717 15 9.6815 14.6313 9.02513 13.9749C8.36875 13.3185 8 12.4283 8 11.5C8 10.5717 8.36875 9.6815 9.02513 9.02513C9.6815 8.36875 10.5717 8 11.5 8C12.4283 8 13.3185 8.36875 13.9749 9.02513C14.6313 9.6815 15 10.5717 15 11.5Z" stroke="#ffffff" strokeWidth="2"/>
              </svg>
              <span className="treva-filter-bar__location-text">LOCATION</span>
            </div>

            <div className="treva-filter-bar__deal" ref={dealDropdownRef}>
              <PillButton
                className="treva-filter-bar__dropdown-btn"
                isPressed={dealMenuOpen}
                aria-haspopup="listbox"
                aria-expanded={dealMenuOpen}
                onClick={() => setDealMenuOpen((prev) => !prev)}
              >
                <span>{dealType}</span>
                <ChevronDown size={14} strokeWidth={2} />
              </PillButton>

              {dealMenuOpen && (
                <div className="treva-filter-bar__deal-menu" role="listbox">
                  {dealOptions.map((option) => (
                    <button
                      key={option}
                      className="treva-filter-bar__deal-option"
                      type="button"
                      role="option"
                      aria-selected={dealType === option}
                      onClick={() => {
                        setDealType(option);
                        setDealMenuOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <PillButton className="treva-filter-bar__home-btn" aria-label="Property type">
              <Home size={24} strokeWidth={2} />
            </PillButton>
          </div>
        </PageContainer>
      </div>
    </>
  );
}
