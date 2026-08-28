"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getDict } from "./dictionary";
import { getNavProjects, type NavProject } from "./projects-api";
import ProjectsMenuV2 from "./ProjectsMenuV2";
import { getSavedCount, onSavedChange } from "@/lib/saved-properties";
import { getComparedCount, onCompareChange } from "@/lib/compare-properties";

type Props = { locale: string };

/** The three locales the site ships, with the flag/name the switcher shows for each. */
const LANGUAGES = [
  { code: "az", name: "Azerbaijan", flag: "/images/flags/az.png" },
  { code: "en", name: "English", flag: "/images/flags/gb.png" },
  { code: "ru", name: "Russian", flag: "/images/flags/ru.png" },
] as const;

/**
 * Header — Figma 192:1637, a floating 1344x90 card.
 *
 * All four action glyphs are the file's own. `get_design_context` is no help
 * here: the buttons are instances of one component and it hands back that
 * component's default "chevron down" slot for every one of them, which is how a
 * caret ended up where the phone should be. `download_assets` on the header
 * returns the real set instead, and the compare mark is 23.05 rather than 24 —
 * hence the per-icon sizes below.
 */
const ACTIONS = [
  { key: "compare", src: "/images/icons/compare.svg", size: 23.0496, label: "Compare", href: "/compare" },
  { key: "saved", src: "/images/icons/heart.svg", size: 24, label: "Saved", href: "/wishlist" },
  { key: "language", src: "/images/icons/globe.svg", size: 24, label: "Language" },
];
/** The one nav entry that opens a mega-menu instead of navigating straight off. */
const MEGA_HREF = "/projects";
/** "Inventory" opens a small off-plan/resale popover the same way. */
const INVENTORY_HREF = "/off-plan";

export default function NavbarV2({ locale }: Props) {
  const dict = getDict(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [inv, setInv] = useState(false);
  const [lang, setLang] = useState(false);
  const [sub, setSub] = useState(false);
  const [subInv, setSubInv] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const langRefMobile = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const invItemRef = useRef<HTMLDivElement>(null);
  // 22px is only the fallback for the first paint, before the effect below
  // has measured anything — see that effect for why a fixed number can't be
  // trusted on its own.
  const [invOffset, setInvOffset] = useState(22);
  const [langOffset, setLangOffset] = useState(22);
  const [navProjects, setNavProjects] = useState<NavProject[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [comparedCount, setComparedCount] = useState(0);

  // The header renders on every page, so the CMS list is fetched once on
  // mount rather than threaded down as a prop through every page shell.
  useEffect(() => {
    let cancelled = false;
    getNavProjects(locale).then((items) => {
      if (!cancelled && items.length > 0) setNavProjects(items);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    setSavedCount(getSavedCount());
    return onSavedChange(setSavedCount);
  }, []);

  useEffect(() => {
    setComparedCount(getComparedCount());
    return onCompareChange(setComparedCount);
  }, []);

  // 10px matches kristal.az's own threshold, the reference for this effect:
  // the card should still be transparent for a couple of wheel ticks, not
  // flip on the very first pixel.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click-to-open, so it needs its own outside-click close instead of the
  // hover-based header onMouseLeave the other two menus use.
  useEffect(() => {
    if (!lang) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langRef.current?.contains(target)) return;
      if (langRefMobile.current?.contains(target)) return;
      setLang(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [lang]);

  // The Inventory and Language items sit in two different rows (nav links vs.
  // action buttons), each centered by the browser according to real font
  // metrics — a hardcoded "gap to the header border" guess drifts by a few
  // px between fonts/browsers. Measuring the actual boxes instead makes both
  // popovers land flush every time, the same way the Projects mega-menu is
  // flush by construction (it's positioned off the header itself, not a link).
  useEffect(() => {
    if (!inv && !lang) return;
    const measure = () => {
      const barBottom = barRef.current?.getBoundingClientRect().bottom;
      if (barBottom == null) return;
      if (inv && invItemRef.current) {
        setInvOffset(barBottom - invItemRef.current.getBoundingClientRect().bottom);
      }
      if (lang && langRef.current) {
        setLangOffset(barBottom - langRef.current.getBoundingClientRect().bottom);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [inv, lang]);

  const href = (path: string) => `/${locale}${path}`;

  /** Swaps just the locale segment, keeping whatever page the switch was opened on. */
  const langHref = (code: string) => {
    const segments = (pathname ?? `/${locale}`).split("/").filter(Boolean);
    segments[0] = code;
    return `/${segments.join("/")}`;
  };

  const otherLanguages = LANGUAGES.filter((l) => l.code !== locale);

  return (
    /* The mega-menu closes on leaving the whole header, not the link, so the
       pointer can travel from "Projects" down into the panel without it
       vanishing on the way. */
    <header
      className={`hv2-nav${scrolled ? " hv2-nav--scrolled" : ""}${open ? " hv2-nav--menu" : ""}`}
      onMouseLeave={() => {
        setMega(false);
        setInv(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMega(false);
          setInv(false);
          setLang(false);
        }
      }}
    >
      <div className="hv2-nav__bar" ref={barRef}>
        <div className="hv2-shell">
        <div className="hv2-nav__inner">
          <Link href={`/${locale}`} className="hv2-nav__logo" aria-label="TREVA">
            {/* unoptimized: there is nothing for the image optimizer to do to an
                SVG, and it rejects them unless dangerouslyAllowSVG is enabled. */}
            <Image src="/Logo.svg" alt="TREVA" width={120} height={27} priority unoptimized />
          </Link>

          <nav className="hv2-nav__links">
            {dict.nav.map((item) => {
              const isMega = item.href === MEGA_HREF;
              const isInventory = item.href === INVENTORY_HREF;
              const hasDropdown = isMega || isInventory;

              return (
                <div
                  key={item.href}
                  className={isInventory ? "hv2-nav__item" : undefined}
                  ref={isInventory ? invItemRef : undefined}
                >
                  <Link
                    href={href(item.href)}
                    className={hasDropdown ? "hv2-nav__link--dropdown" : undefined}
                    aria-expanded={isMega ? mega : isInventory ? inv : undefined}
                    onMouseEnter={() => {
                      setMega(isMega);
                      setInv(isInventory);
                      setLang(false);
                    }}
                    onFocus={() => {
                      setMega(isMega);
                      setInv(isInventory);
                      setLang(false);
                    }}
                  >
                    {item.label}
                    {hasDropdown ? (
                      <span className="hv2-nav__chev hv2-nav__chev--nav" aria-hidden="true">
                        <Image
                          src="/images/icons/chevron-down.svg"
                          alt=""
                          width={12}
                          height={6}
                          style={{ width: "11.5px", height: "5.5px" }}
                          unoptimized
                        />
                      </span>
                    ) : null}
                  </Link>

                  {/* Off-Plan first, Resale second — the order the request asked for. */}
                  {isInventory && inv ? (
                    <div className="hv2-nav__popover" style={{ top: `calc(100% + ${invOffset}px)` }}>
                      <Link href={href("/off-plan")} onClick={() => setInv(false)}>
                        {dict.search.offPlan}
                      </Link>
                      <Link href={href("/resale")} onClick={() => setInv(false)}>
                        {dict.search.resale}
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="hv2-nav__actions">
            <a className="hv2-nav__btn hv2-nav__phone" href="tel:2662">
              <Image
                src="/images/icons/phone.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                unoptimized
              />
              *2662
            </a>

            {ACTIONS.map(({ key, src, size, label, href: to }) => {
              const glyph = (
                <Image
                  src={src}
                  alt=""
                  aria-hidden="true"
                  width={Math.round(size)}
                  height={Math.round(size)}
                  style={{ width: `${size}px`, height: `${size}px` }}
                  unoptimized
                />
              );

              if (key === "language") {
                return (
                  <div key={key} className="hv2-nav__item" ref={langRef}>
                    <button
                      type="button"
                      className="hv2-nav__btn hv2-nav__btn--icon"
                      aria-label={label}
                      aria-haspopup="listbox"
                      aria-expanded={lang}
                      onClick={() => {
                        setMega(false);
                        setInv(false);
                        setLang((v) => !v);
                      }}
                    >
                      {glyph}
                    </button>

                    {lang ? (
                      <div
                        className="hv2-nav__popover hv2-nav__popover--lang"
                        role="listbox"
                        style={{ top: `calc(100% + ${langOffset}px)` }}
                      >
                        {otherLanguages.map((l) => (
                          <Link key={l.code} href={langHref(l.code)} onClick={() => setLang(false)} role="option">
                            <span className="hv2-nav__lang-flag" aria-hidden="true">
                              <Image src={l.flag} alt="" width={32} height={32} unoptimized />
                            </span>
                            {l.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const count = key === "saved" ? savedCount : key === "compare" ? comparedCount : 0;

              return to ? (
                <Link key={key} href={href(to)} className="hv2-nav__btn hv2-nav__btn--icon" aria-label={`${label} (${count})`}>
                  {glyph}
                  {count > 0 ? <span className="hv2-nav__badge">{count}</span> : null}
                </Link>
              ) : (
                <button key={key} type="button" className="hv2-nav__btn hv2-nav__btn--icon" aria-label={label}>
                  {glyph}
                </button>
              );
            })}

            <a
              className="hv2-nav__btn hv2-nav__btn--brand"
              href="https://partner.treva.realestate/"
              target="_blank"
              rel="noreferrer"
            >
              {dict.cabinet}
            </a>

            <button
              type="button"
              className="hv2-nav__btn hv2-nav__btn--icon hv2-nav__burger"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
        </div>
      </div>

      {mega ? (
        <div className="hv2-shell hv2-nav__mega">
          <ProjectsMenuV2 locale={locale} items={navProjects} onNavigate={() => setMega(false)} />
        </div>
      ) : null}

      {/* The open menu is a fixed full-screen sheet, not a card in the flow —
          position: fixed keeps the hero exactly where it is underneath
          instead of pushing it down, and the panel applies the page gutter
          itself instead of sitting inside a second `.hv2-shell` inset. */}
      {open ? (
        <div className="hv2-nav__mobile">
          <ul>
            {dict.nav.map((item) => {
              const isMega = item.href === MEGA_HREF;
              const isInventory = item.href === INVENTORY_HREF;

              /* Figma 783:23806 — on mobile "Projects" is a disclosure, not a
                 link: tapping it unfolds the project list in place. Inventory
                 is one too, carrying the same Off-Plan/Resale pair its header
                 popover holds, so the two widths offer the same entry points
                 (the Figma frame lists those two as top-level rows instead —
                 the dropdown is the requested change). */
              if (isMega || isInventory) {
                const expanded = isMega ? sub : subInv;
                const toggle = isMega ? setSub : setSubInv;

                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      className="hv2-nav__disclosure"
                      aria-expanded={expanded}
                      onClick={() => toggle((v) => !v)}
                    >
                      {item.label}
                      <span className="hv2-nav__chev" aria-hidden="true">
                        <Image
                          src="/images/icons/chevron-down.svg"
                          alt=""
                          width={8}
                          height={4}
                          style={{ width: "7.67px", height: "3.67px" }}
                          unoptimized
                        />
                      </span>
                    </button>

                    {expanded && isMega ? (
                      <ul className="hv2-nav__sublist">
                        {navProjects.map((project) => (
                          <li key={project.slug}>
                            <Link
                              href={`/${locale}/projects/${project.slug}`}
                              onClick={() => setOpen(false)}
                            >
                              {project.image ? (
                                <Image
                                  className="hv2-nav__subthumb"
                                  src={project.image}
                                  alt=""
                                  aria-hidden="true"
                                  width={24}
                                  height={24}
                                />
                              ) : null}
                              {project.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {/* Off-Plan first, Resale second — the order the header
                        popover uses. No thumbnails to pair these with, so the
                        rows carry the card chrome on their own. */}
                    {expanded && isInventory ? (
                      <ul className="hv2-nav__sublist hv2-nav__sublist--text">
                        <li>
                          <Link href={href("/off-plan")} onClick={() => setOpen(false)}>
                            {dict.search.offPlan}
                          </Link>
                        </li>
                        <li>
                          <Link href={href("/resale")} onClick={() => setOpen(false)}>
                            {dict.search.resale}
                          </Link>
                        </li>
                      </ul>
                    ) : null}
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link href={href(item.href)} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hv2-nav__mobile-actions">
            <a className="hv2-nav__btn hv2-nav__phone" href="tel:2662">
              <Image
                src="/images/icons/phone.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                unoptimized
              />
              *2662
            </a>

            {ACTIONS.map(({ key, src, size, label, href: to }) => {
              const glyph = (
                <Image
                  src={src}
                  alt=""
                  aria-hidden="true"
                  width={Math.round(size)}
                  height={Math.round(size)}
                  style={{ width: `${size}px`, height: `${size}px` }}
                  unoptimized
                />
              );

              if (key === "language") {
                return (
                  <div key={key} className="hv2-nav__item" ref={langRefMobile}>
                    <button
                      type="button"
                      className="hv2-nav__btn hv2-nav__btn--icon"
                      aria-label={label}
                      aria-haspopup="listbox"
                      aria-expanded={lang}
                      onClick={() => setLang((v) => !v)}
                    >
                      {glyph}
                    </button>

                    {lang ? (
                      <div className="hv2-nav__popover hv2-nav__popover--lang" role="listbox">
                        {otherLanguages.map((l) => (
                          <Link
                            key={l.code}
                            href={langHref(l.code)}
                            role="option"
                            onClick={() => {
                              setLang(false);
                              setOpen(false);
                            }}
                          >
                            <span className="hv2-nav__lang-flag" aria-hidden="true">
                              <Image src={l.flag} alt="" width={24} height={24} unoptimized />
                            </span>
                            {l.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              const count = key === "saved" ? savedCount : key === "compare" ? comparedCount : 0;

              return to ? (
                <Link
                  key={key}
                  href={href(to)}
                  className="hv2-nav__btn hv2-nav__btn--icon"
                  aria-label={`${label} (${count})`}
                  onClick={() => setOpen(false)}
                >
                  {glyph}
                  {count > 0 ? <span className="hv2-nav__badge">{count}</span> : null}
                </Link>
              ) : (
                <button
                  key={key}
                  type="button"
                  className="hv2-nav__btn hv2-nav__btn--icon"
                  aria-label={label}
                >
                  {glyph}
                </button>
              );
            })}

            <a
              className="hv2-nav__btn hv2-nav__btn--brand hv2-nav__btn--cabinet"
              href="https://partner.treva.realestate/"
              target="_blank"
              rel="noreferrer"
            >
              {dict.cabinet}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
