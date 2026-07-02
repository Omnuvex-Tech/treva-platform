"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from "next/navigation";
import './navbar.css';
import { IoMdClose, IoMdMenu } from 'react-icons/io';
import { ChevronDown } from 'lucide-react';
import { createPortal } from "react-dom";
import { getSavedCount, onSavedChange } from '@/lib/saved-properties';

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

const languageLabels = {
  az: "AZE",
  en: "ENG",
  ru: "RUS",
} as const;

const labelToLocale = {
  AZE: "az",
  ENG: "en",
  RUS: "ru",
} as const;

type NavItem = {
  name: string;
  href: string;
};

type NavDropdown = {
  name: string;
  children: NavItem[];
};

type NavEntry = NavItem | NavDropdown;

function isDropdown(item: NavEntry): item is NavDropdown {
  return 'children' in item;
}

const navDictionary: Record<'az' | 'en' | 'ru', NavEntry[]> = {
  az: [
    { name: "LAYİHƏLƏR", href: "/projects" },
    { name: "İNVENTAR", children: [
      { name: "Off-Plan", href: "/off-plan" },
      { name: "Resale", href: "/resale" },
    ]},
    { name: "TƏRƏFDAŞLIQ", children: [
      { name: "Developers", href: "/developers" },
      { name: "Brokers", href: "/brokers" },
    ]},
    { name: "PULSE", href: "/pulse" },
    { name: "ƏLAQƏ", href: "/contact" },
  ],
  en: [
    { name: "PROJECTS", href: "/projects" },
    { name: "INVENTORY", children: [
      { name: "Off-Plan", href: "/off-plan" },
      { name: "Resale", href: "/resale" },
    ]},
    { name: "PARTNERSHIP", children: [
      { name: "Developers", href: "/developers" },
      { name: "Brokers", href: "/brokers" },
    ]},
    { name: "PULSE", href: "/pulse" },
    { name: "CONTACT", href: "/contact" },
  ],
  ru: [
    { name: "ПРОЕКТЫ", href: "/projects" },
    { name: "ИНВЕНТАРЬ", children: [
      { name: "Off-Plan", href: "/off-plan" },
      { name: "Resale", href: "/resale" },
    ]},
    { name: "ПАРТНЁРСТВО", children: [
      { name: "Девелоперы", href: "/developers" },
      { name: "Брокеры", href: "/brokers" },
    ]},
    { name: "PULSE", href: "/pulse" },
    { name: "КОНТАКТ", href: "/contact" },
  ],
};

type NavbarProps = {
  locale?: string;
  variant?: 'overlay' | 'solid';
};

export default function Navbar({ locale = 'az', variant = 'overlay' }: NavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isInventarOpen, setIsInventarOpen] = useState(false);
  const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [solidBgReady, setSolidBgReady] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  
  const router = useRouter();
  const pathname = usePathname();
  
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const inventarDropdownRef = useRef<HTMLDivElement>(null);
  const partnershipDropdownRef = useRef<HTMLDivElement>(null);
  const mobileLangDropdownRef = useRef<HTMLDivElement>(null);

  const detectedLocale = pathname?.split("/")[1];
  const activeLocale = (detectedLocale && detectedLocale in languageLabels) 
    ? detectedLocale 
    : (locale in languageLabels ? locale : "az");

  const currentLang = languageLabels[activeLocale as keyof typeof languageLabels];
  const languages = ["AZE", "ENG", "RUS"] as const;

  const routeHref = (path: string) => `/${activeLocale}${path}`;
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const shouldShowScrolled = isScrolled || mobileMenuOpen || (variant === "solid" && solidBgReady);

  const handleLangChange = (lang: typeof languages[number]) => {
    const nextLocale = labelToLocale[lang];
    if (!nextLocale) return;

    const segments = pathname ? pathname.split("/").filter(Boolean) : [];
    if (segments.length === 0) {
      router.push(`/${nextLocale}`);
      return;
    }

    segments[0] = nextLocale;
    router.push(`/${segments.join("/")}`);
  };

  useEffect(() => {
    setPortalTarget(document.getElementById("treva-navbar-layer"));
  }, []);

  useEffect(() => {
    setSavedCount(getSavedCount());
    const unsubscribe = onSavedChange((count) => setSavedCount(count));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (variant !== "solid") {
      setSolidBgReady(false);
      return;
    }

    const id = window.requestAnimationFrame(() => setSolidBgReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [variant]);

  useEffect(() => {
    const onScroll = () => {
      const top =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setIsScrolled(top > 16);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
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

      const target = event.target as Node;
      const clickedInsideDesktop = langDropdownRef.current?.contains(target);
      const clickedInsideMobile = mobileLangDropdownRef.current?.contains(target);
      const clickedInsideInventar = inventarDropdownRef.current?.contains(target);
      const clickedInsidePartnership = partnershipDropdownRef.current?.contains(target);

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsLangOpen(false);
      }
      if (!clickedInsideInventar) {
        setIsInventarOpen(false);
      }
      if (!clickedInsidePartnership) {
        setIsPartnershipOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          closeMobileMenu();
          hamburgerRef.current?.focus();
        }
        setIsLangOpen(false);
        setIsInventarOpen(false);
        setIsPartnershipOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1024 && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    window.addEventListener('resize', handleResize);

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

  if (!portalTarget) return null;

  return createPortal(
    <>
      {/* ========== NAVBAR ========== */}
      <header
        className={`treva-navbar${variant === 'solid' ? ' treva-navbar--solid' : ''}${shouldShowScrolled ? ' treva-navbar--scrolled' : ''}`}
        role="banner"
      >
        <div className="treva-navbar__inner">
          <a href={`/${activeLocale}`} className="treva-navbar__logo" aria-label="TREVA - Home">
            <TrevaNavbarLogo />
          </a>

          <nav className="treva-navbar__nav" aria-label="Primary navigation">
            {(navDictionary[activeLocale as 'az' | 'en' | 'ru'] ?? navDictionary.az).map((item) => {
              if (isDropdown(item)) {
                const isOpen = item.name === "İNVENTAR" || item.name === "INVENTORY" || item.name === "ИНВЕНТАРЬ"
                  ? isInventarOpen
                  : isPartnershipOpen;
                const setIsOpen = item.name === "İNVENTAR" || item.name === "INVENTORY" || item.name === "ИНВЕНТАРЬ"
                  ? setIsInventarOpen
                  : setIsPartnershipOpen;
                const ref = item.name === "İNVENTAR" || item.name === "INVENTORY" || item.name === "ИНВЕНТАРЬ"
                  ? inventarDropdownRef
                  : partnershipDropdownRef;

                return (
                  <div key={item.name} className="treva-navbar__dropdown-container" ref={ref}>
                    <button
                      className={`treva-navbar__dropdown-trigger ${isOpen ? 'treva-navbar__dropdown-trigger--open' : ''}`}
                      onClick={() => setIsOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isOpen}
                      type="button"
                      suppressHydrationWarning
                    >
                      {item.name}
                      <ChevronDown size={14} strokeWidth={2} />
                    </button>
                    {isOpen && (
                      <div className="treva-navbar__dropdown-list" role="listbox">
                        {item.children.map((child) => (
                          <a
                            key={child.href}
                            href={routeHref(child.href)}
                            className="treva-navbar__dropdown-item"
                            role="option"
                            onClick={() => setIsOpen(false)}
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a key={item.href} href={routeHref(item.href)} className="treva-navbar__link">
                  {item.name}
                </a>
              );
            })}
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

              <a
                href={routeHref('/saved')}
                className="treva-navbar__saved-btn"
                aria-label={`Saved properties (${savedCount})`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {savedCount > 0 && (
                  <span className="treva-navbar__saved-badge">{savedCount}</span>
                )}
              </a>

              {/* Desktop Language Switcher */}
              <div className="treva-navbar__lang-container" ref={langDropdownRef}>
                <button 
                  className={`treva-navbar__lang ${isLangOpen ? 'treva-navbar__lang--open' : ''}`} 
                  onClick={() => setIsLangOpen((prev) => !prev)}
                  aria-label={`Language switcher. Current: ${currentLang}`} 
                  aria-haspopup="listbox"
                  aria-expanded={isLangOpen}
                  type="button"
                  suppressHydrationWarning
                >
                  {currentLang}
                  <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isLangOpen && (
                  <div className="treva-navbar__lang-list" role="listbox">
                    {languages
                      .filter((lang) => lang !== currentLang)
                      .map((lang) => (
                        <button
                          key={lang}
                          className="treva-navbar__lang-item"
                          role="option"
                          aria-selected={false}
                          onClick={() => {
                            handleLangChange(lang);
                            setIsLangOpen(false);
                          }}
                          type="button"
                        >
                          {lang}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <a
                href="https://partner.treva.realestate/"
                className="treva-pill-button treva-navbar__login-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Login
              </a>
            </div>

            {/* ✅ DÜZƏLİŞ: React-icons ilə Dinamik Menyu Düyməsi */}
            <button
              ref={hamburgerRef}
              className={`treva-navbar__hamburger ${mobileMenuOpen ? 'treva-navbar__hamburger--open' : ''}`}
              aria-controls="mobile-nav"
              onClick={toggleMobileMenu}
              suppressHydrationWarning
              type="button"
            >
              {mobileMenuOpen ? (
                <IoMdClose className="treva-navbar__hamburger-icon" />
              ) : (
                <IoMdMenu className="treva-navbar__hamburger-icon" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========== MOBILE MENU ========== */}
      <nav
        ref={mobileNavRef}
        className={`treva-navbar__mobile ${mobileMenuOpen ? 'treva-navbar__mobile--open' : ''}`}
        id="mobile-nav"
        aria-label="Mobile navigation"
        aria-hidden="true"
      >
        <div className="treva-navbar__mobile__inner">
          {(navDictionary[activeLocale as 'az' | 'en' | 'ru'] ?? navDictionary.az).map((item) => {
            if (isDropdown(item)) {
              const isOpen = openMobileGroup === item.name;
              return (
                <div key={item.name} className="treva-navbar__mobile__group">
                  <button
                    className="treva-navbar__mobile__link treva-navbar__mobile__group-toggle"
                    onClick={() => setOpenMobileGroup(isOpen ? null : item.name)}
                    type="button"
                    suppressHydrationWarning
                  >
                    {item.name}
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className={`treva-navbar__mobile__chevron ${isOpen ? 'treva-navbar__mobile__chevron--open' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="treva-navbar__mobile__sub">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={routeHref(child.href)}
                          className="treva-navbar__mobile__link treva-navbar__mobile__sub-link"
                          onClick={closeMobileMenu}
                        >
                          {child.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <a
                key={item.href}
                href={routeHref(item.href)}
                className="treva-navbar__mobile__link"
                onClick={closeMobileMenu}
              >
                {item.name}
              </a>
            );
          })}
        </div>
      </nav>
    </>,
    portalTarget
  );
}
