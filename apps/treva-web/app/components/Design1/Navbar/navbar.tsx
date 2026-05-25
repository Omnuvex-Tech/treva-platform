"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./navbar.css";

import { ButtonText } from '@/app/components/ButtonText';
const TrevaLogoSvg = ({ light = false }: { light?: boolean }) => (
  <svg
    width="100%"
    height="auto"
    viewBox="0 0 112 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g clipPath="url(#clip0_598_2239)">
      <path
        d="M85.1527 0.458984L79.8945 19.2893H78.3652L73.1025 0.458984H67.9434L74.9692 24.0438H83.223L90.2534 0.458984H85.1527Z"
        fill={light ? "#FFFFFF" : "#111212"}
      />
      <path
        d="M106.476 24.0438H111.496L103.908 0.458984H96.2162L88.6641 24.0438H93.5579L99.2478 5.1822H100.71L106.476 24.0438Z"
        fill={light ? "#FFFFFF" : "#111212"}
      />
      <path
        d="M18.8967 4.54827H11.9428V24.6376H7.28285V4.54827H0.292969V0.458984H18.8967V4.54827Z"
        fill={light ? "#FFFFFF" : "#111212"}
      />
      <path
        d="M26.7537 24.6381H22.0938V0.455078H33.1633C34.4093 0.455078 35.5472 0.660436 36.5818 1.06669C37.6163 1.47294 38.4979 2.04883 39.2311 2.78544C39.9643 3.52204 40.5355 4.40597 40.9493 5.4283C41.3586 6.45062 41.5656 7.57115 41.5656 8.78097C41.5656 10.6113 41.1023 12.2051 40.1802 13.5712C39.2581 14.9372 38.0301 15.9149 36.4963 16.5131C38.5429 19.2006 40.567 21.9104 42.5641 24.6381H37.0046C36.033 23.3837 35.0795 22.1158 34.1529 20.839C33.2218 19.5622 32.2952 18.2631 31.3641 16.9417H26.7537V24.6381ZM26.7537 12.8479H33.1543C33.5726 12.8479 34.0134 12.7631 34.4632 12.5979C34.9175 12.4328 35.3178 12.1783 35.6732 11.839C36.0285 11.4997 36.3209 11.0756 36.5548 10.5667C36.7887 10.0622 36.9011 9.46401 36.9011 8.78097C36.9011 8.42829 36.8562 8.01312 36.7662 7.52651C36.6762 7.0399 36.5008 6.58008 36.2354 6.13812C35.9701 5.69615 35.5922 5.32115 35.1064 5.01312C34.6207 4.70508 33.9684 4.54883 33.1498 4.54883H26.7492V12.8479H26.7537Z"
        fill={light ? "#FFFFFF" : "#111212"}
      />
      <path
        d="M50.7205 4.54827V10.6018H62.5007V14.7938H50.7205V20.4724H64.003V24.6376H46.0605V0.458984H64.003V4.54827H50.7205Z"
        fill={light ? "#FFFFFF" : "#111212"}
      />
    </g>
    <defs>
      <clipPath id="clip0_598_2239">
        <rect width="112" height="25" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="#2E3139"
    viewBox="0 0 256 256"
    aria-hidden="true"
  >
    <path d="M222,128a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,128ZM40,70H216a6,6,0,0,0,0-12H40a6,6,0,0,0,0,12ZM216,186H40a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="18"
    height="15"
    viewBox="0 0 18 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M0.486023 7.01437L6.80495 0.695439C6.93387 0.566524 7.10871 0.494102 7.29103 0.494102C7.47334 0.494102 7.64818 0.566525 7.7771 0.695439C7.90601 0.824353 7.97844 0.999199 7.97844 1.18151C7.97844 1.36382 7.90601 1.53867 7.7771 1.66758L2.63142 6.81326L16.5264 6.81265C16.7088 6.81265 16.8837 6.88511 17.0127 7.0141C17.1417 7.14308 17.2142 7.31803 17.2142 7.50044C17.2142 7.68285 17.1417 7.8578 17.0127 7.98678C16.8837 8.11577 16.7088 8.18823 16.5264 8.18823L2.63142 8.18763L7.7771 13.3333C7.90601 13.4622 7.97844 13.6371 7.97844 13.8194C7.97844 14.0017 7.90601 14.1765 7.7771 14.3054C7.64818 14.4344 7.47334 14.5068 7.29103 14.5068C7.10871 14.5068 6.93387 14.4344 6.80496 14.3054L0.486023 7.98651C0.357109 7.8576 0.284687 7.68275 0.284687 7.50044C0.284687 7.31813 0.357109 7.14328 0.486023 7.01437Z"
      fill="white"
    />
  </svg>
);

const ChevronDown = () => (
  <svg
    width="12"
    height="7"
    viewBox="0 0 12 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11.354 1.35403L6.35403 6.35403C6.30759 6.40052 6.25245 6.4374 6.19175 6.46256C6.13105 6.48772 6.06599 6.50067 6.00028 6.50067C5.93457 6.50067 5.86951 6.48772 5.80881 6.46256C5.74811 6.4374 5.69297 6.40052 5.64653 6.35403L0.646528 1.35403C0.552708 1.26021 0.5 1.13296 0.5 1.00028C0.5 0.867596 0.552708 0.740348 0.646528 0.646528C0.740348 0.552707 0.867596 0.5 1.00028 0.5C1.13296 0.5 1.26021 0.552707 1.35403 0.646528L6.00028 5.2934L10.6465 0.646528C10.693 0.600073 10.7481 0.563222 10.8088 0.538081C10.8695 0.51294 10.9346 0.5 11.0003 0.5C11.066 0.5 11.131 0.51294 11.1917 0.538081C11.2524 0.563222 11.3076 0.600073 11.354 0.646528C11.4005 0.692983 11.4373 0.748133 11.4625 0.80883C11.4876 0.869526 11.5006 0.934581 11.5006 1.00028C11.5006 1.06598 11.4876 1.13103 11.4625 1.19173C11.4373 1.25242 11.4005 1.30757 11.354 1.35403Z"
      fill="currentColor"
    />
  </svg>
);

const RedDot = () => (
  <span className="red-dot" aria-hidden="true">
    <span className="red-dot__ping" />
    <span className="red-dot__core" />
  </span>
);

const languageLabels = {
  az: "AZE",
  en: "ENG",
  ru: "RUS",
} as const;

const navDictionary = {
  az: [
    { name: "LAYİHƏLƏR", href: "/projects", hasDot: false },
    { name: "DEVELOPERLƏR", href: "/developers", hasDot: false },
    { name: "BROKERLƏR", href: "/brokers", hasDot: false },
    { name: "PULSE", href: "/pulse", hasDot: true },
    { name: "ƏLAQƏ", href: "/contact", hasDot: false },
  ],
  en: [
    { name: "Projects", href: "/projects", hasDot: false },
    { name: "Developers", href: "/developers", hasDot: false },
    { name: "Brokers", href: "/brokers", hasDot: false },
    { name: "Pulse", href: "/pulse", hasDot: true },
    { name: "Contact", href: "/contact", hasDot: false },
  ],
  ru: [
    { name: "Проекты", href: "/projects", hasDot: false },
    { name: "Девелоперы", href: "/developers", hasDot: false },
    { name: "Брокеры", href: "/brokers", hasDot: false },
    { name: "Pulse", href: "/pulse", hasDot: true },
    { name: "Контакт", href: "/contact", hasDot: false },
  ],
} as const;

const secondaryDictionary = {
  az: {
    login: "Login",
    partnerHref: "https://partner.treva.realestate/",
    mail: "info@treva.realestate",
    phone: "050-277-2662",
    shortPhone: "*2662",
    homeLabel: "home",
    realEstate: "REAL ESTATE",
  },
  en: {
    login: "Login",
    partnerHref: "https://partner.treva.realestate/",
    mail: "info@treva.realestate",
    phone: "050-277-2662",
    shortPhone: "*2662",
    homeLabel: "home",
    realEstate: "REAL ESTATE",
  },
  ru: {
    login: "Login",
    partnerHref: "https://partner.treva.realestate/",
    mail: "info@treva.realestate",
    phone: "050-277-2662",
    shortPhone: "*2662",
    homeLabel: "home",
    realEstate: "REAL ESTATE",
  },
} as const;

function LanguageDropdown({
  currentLang,
  onLangChange,
}: {
  currentLang: string;
  onLangChange: (lang: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languages = ["AZE", "ENG", "RUS"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="nav_lang-dropdown" ref={dropdownRef}>
      <button
        className={`nav_lang-toggle ${isOpen ? "w--open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        aria-expanded={isOpen}
        aria-label="Language switcher"
      >
        <span>{currentLang}</span>
        <span className="nav_lang-icon">
          <ChevronDown />
        </span>
      </button>

      {isOpen && (
        <div className="nav_lang-list w--open">
          {languages
            .filter((lang) => lang !== currentLang)
            .map((lang) => (
              <button
                key={lang}
                className="nav_lang-link"
                onClick={() => {
                  onLangChange(lang);
                  setIsOpen(false);
                }}
                type="button"
              >
                {lang}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

const labelToLocale = {
  AZE: "az",
  ENG: "en",
  RUS: "ru",
} as const;

export default function Navbar({ locale }: { locale: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale =
    locale in navDictionary ? (locale as keyof typeof navDictionary) : "az";
  const navLinks = navDictionary[currentLocale];
  const secondary = secondaryDictionary[currentLocale];
  const currentLang = languageLabels[currentLocale];

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const homeHref = `/${currentLocale}`;

  const localizedLinks = useMemo(() => {
    return navLinks.map((link) => ({
      ...link,
      href: link.href.startsWith("#")
        ? `${homeHref}${link.href}`
        : `/${currentLocale}${link.href}`,
    }));
  }, [currentLocale, homeHref, navLinks]);

  const handleLangChange = (lang: string) => {
    const nextLocale = labelToLocale[lang as keyof typeof labelToLocale];

    if (!nextLocale) {
      return;
    }

    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      router.push(`/${nextLocale}`);
      return;
    }

    segments[0] = nextLocale;
    router.push(`/${segments.join("/")}`);
  };

  return (
    <>
      <header className="header">
        <div className="nav">
          <div className="global-padding">
            <div className="nav_container">
              <Link
                href={homeHref}
                className="nav_logo"
                aria-label={secondary.homeLabel}
              >
                <TrevaLogoSvg />
              </Link>

                <nav className="nav_menu" aria-label="Primary navigation">
                  {localizedLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="nav_link">
                      {link.hasDot && <RedDot />}
                      <span className="nav_link-mask">
                        <span className="nav_link-content">
                          <span className="nav_link-text">{link.name}</span>
                          <span className="nav_link-text">{link.name}</span>
                        </span>
                      </span>
                    </Link>
                  ))}
                </nav>

                <div className="nav_cta-wrap">
                  <LanguageDropdown
                    currentLang={currentLang}
                    onLangChange={handleLangChange}
                  />

                  <a
                    href={secondary.partnerHref}
                    target="_blank"
                    className="button"
                    rel="noreferrer"
                  >
                    <UserIcon />
                    <ButtonText as="span" textAs="span">{secondary.login}</ButtonText>
                  </a>

                  <button
                    className="nav_menu-btn"
                    onClick={() => setIsMenuOpen(true)}
                    type="button"
                    aria-label="Open menu"
                  >
                    <MenuIcon />
                  </button>
                </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`nav_burger-menu ${isMenuOpen ? "is-open" : ""}`}>
        <button
          className="nav_burger-overlay"
          onClick={() => setIsMenuOpen(false)}
          type="button"
          aria-label="Close menu"
        />

        <aside className="nav_burger-side">
          <div className="nav_burger-content-wrap">
            <div className="nav_burger-top">
              <Link
                href={homeHref}
                className="nav_burger-logo"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrevaLogoSvg light />
                <span>{secondary.realEstate}</span>
              </Link>

              <button
                className="nav_burger-close"
                onClick={() => setIsMenuOpen(false)}
                type="button"
                aria-label="Close menu"
              >
                <ArrowLeftIcon />
              </button>
            </div>

            <nav className="nav_burger-body" aria-label="Mobile navigation">
              {localizedLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="nav_burger-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{link.name}</span>
                  {link.hasDot && <RedDot />}
                </Link>
              ))}

              <div className="nav_burger-contact-wrap">
                <a
                  href={`mailto:${secondary.mail}`}
                  className="nav_burger-sec-link"
                >
                  {secondary.mail}
                </a>
                <a
                  href={`tel:${secondary.phone.replace(/-/g, "")}`}
                  className="nav_burger-sec-link"
                >
                  {secondary.phone}
                </a>
                <a href="tel:2662" className="nav_burger-sec-link">
                  {secondary.shortPhone}
                </a>
              </div>
            </nav>

            <a
              href={secondary.partnerHref}
              target="_blank"
              className="nav_burger-login"
              rel="noreferrer"
            >
              <UserIcon />
              <span>{secondary.login}</span>
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
