"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { getDict } from "./dictionary";
import { projectCards } from "./data";
import ProjectsMenuV2 from "./ProjectsMenuV2";

type Props = { locale: string };

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
  { key: "compare", src: "/images/icons/compare.svg", size: 23.0496, label: "Compare" },
  { key: "saved", src: "/images/icons/heart.svg", size: 24, label: "Saved", href: "/saved" },
  { key: "language", src: "/images/icons/globe.svg", size: 24, label: "Language" },
];
/** The one nav entry that opens a mega-menu instead of navigating straight off. */
const MEGA_HREF = "/projects";

export default function NavbarV2({ locale }: Props) {
  const dict = getDict(locale);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [sub, setSub] = useState(false);

  const href = (path: string) => `/${locale}${path}`;

  return (
    /* The mega-menu closes on leaving the whole header, not the link, so the
       pointer can travel from "Projects" down into the panel without it
       vanishing on the way. */
    <header
      className="hv2-nav"
      onMouseLeave={() => setMega(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setMega(false);
      }}
    >
      <div className="hv2-shell">
        <div className="hv2-nav__inner">
          <Link href={`/${locale}`} className="hv2-nav__logo" aria-label="TREVA">
            {/* unoptimized: there is nothing for the image optimizer to do to an
                SVG, and it rejects them unless dangerouslyAllowSVG is enabled. */}
            <Image src="/Logo.svg" alt="TREVA" width={120} height={27} priority unoptimized />
          </Link>

          <nav className="hv2-nav__links">
            {dict.nav.map((item) => (
              <Link
                key={item.href}
                href={href(item.href)}
                aria-expanded={item.href === MEGA_HREF ? mega : undefined}
                onMouseEnter={() => setMega(item.href === MEGA_HREF)}
                onFocus={() => setMega(item.href === MEGA_HREF)}
              >
                {item.label}
              </Link>
            ))}
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

              return to ? (
                <Link key={key} href={href(to)} className="hv2-nav__btn hv2-nav__btn--icon" aria-label={label}>
                  {glyph}
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

      {mega ? (
        <div className="hv2-shell hv2-nav__mega">
          <ProjectsMenuV2 locale={locale} onNavigate={() => setMega(false)} />
        </div>
      ) : null}

      {/* Figma 783:23754 — the open menu is a white 24-radius card holding the
          nav as Body 2 rows, with the phone, the three icon buttons and Cabinet
          repeated along its foot. Those are the same controls the header drops
          at this width, which is where the design puts them instead. */}
      {open ? (
        <div className="hv2-shell">
          <div className="hv2-nav__mobile">
            <ul>
              {dict.nav.map((item) =>
                item.href === MEGA_HREF ? (
                  /* Figma 783:23806 — on mobile "Projects" is a disclosure, not
                     a link: tapping it unfolds the project list in place. */
                  <li key={item.href}>
                    <button
                      type="button"
                      className="hv2-nav__disclosure"
                      aria-expanded={sub}
                      onClick={() => setSub((v) => !v)}
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

                    {sub ? (
                      <ul className="hv2-nav__sublist">
                        {projectCards.map((project) => (
                          <li key={project.slug}>
                            <Link
                              href={`/${locale}/projects/${project.slug}`}
                              onClick={() => setOpen(false)}
                            >
                              <Image
                                className="hv2-nav__subthumb"
                                src={`/images/thumbs/${project.slug}.jpg`}
                                alt=""
                                aria-hidden="true"
                                width={24}
                                height={24}
                              />
                              {project.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link href={href(item.href)} onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                  </li>
                )
              )}
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

                return to ? (
                  <Link
                    key={key}
                    href={href(to)}
                    className="hv2-nav__btn hv2-nav__btn--icon"
                    aria-label={label}
                    onClick={() => setOpen(false)}
                  >
                    {glyph}
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
        </div>
      ) : null}
    </header>
  );
}
