"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Scale, Heart, Globe, Menu, X } from "lucide-react";
import { getDict } from "./dictionary";

type Props = { locale: string };

export default function NavbarV2({ locale }: Props) {
  const dict = getDict(locale);
  const [open, setOpen] = useState(false);

  const href = (path: string) => `/${locale}${path}`;

  return (
    <header className="hv2-nav">
      <div className="hv2-shell">
        <div className="hv2-nav__inner">
        <Link href={`/${locale}`} className="hv2-nav__logo" aria-label="TREVA">
          {/* unoptimized: there is nothing for the image optimizer to do to an
              SVG, and it rejects them unless dangerouslyAllowSVG is enabled. */}
          <Image src="/Logo.svg" alt="TREVA" width={120} height={27} priority unoptimized />
        </Link>

        <nav className="hv2-nav__links">
          {dict.nav.map((item) => (
            <Link key={item.href} href={href(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hv2-nav__actions">
          <a className="hv2-pill hv2-nav__phone" href="tel:2662">
            <Phone size={14} strokeWidth={1.8} />
            *2662
          </a>

          <button type="button" className="hv2-icon-btn hv2-nav__opt" aria-label="Compare">
            <Scale size={16} strokeWidth={1.6} />
          </button>
          <Link href={href("/saved")} className="hv2-icon-btn hv2-nav__opt" aria-label="Saved">
            <Heart size={16} strokeWidth={1.6} />
          </Link>
          <button type="button" className="hv2-icon-btn hv2-nav__opt" aria-label="Language">
            <Globe size={16} strokeWidth={1.6} />
          </button>

          <a
            className="hv2-pill hv2-pill--dark"
            href="https://partner.treva.realestate/"
            target="_blank"
            rel="noreferrer"
          >
            {dict.cabinet}
          </a>

          <button
            type="button"
            className="hv2-icon-btn hv2-nav__burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
          </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="hv2-shell hv2-nav__mobile">
          <ul>
            {dict.nav.map((item) => (
              <li key={item.href}>
                <Link href={href(item.href)} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
