"use client";

import React, { useEffect, useRef, useState } from 'react';
import './navbar.css';

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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header
        className={`treva-navbar ${isScrolled || mobileMenuOpen ? 'treva-navbar--scrolled' : ''}`}
        role="banner"
      >
        <div className="treva-navbar__inner">
        <a href="#" className="treva-navbar__logo" aria-label="TREVA - Home">
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
    </>
  );
}
