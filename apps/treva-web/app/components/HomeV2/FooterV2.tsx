"use client";

import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";

type Props = { locale: string };

/**
 * Social marks, exported from the Figma footer rather than drawn by an icon
 * font. Each carries its own leaf size: four sit in a 16 square, but the
 * Facebook "f" is a narrow 8.83x13.5 glyph and stretching it to 16 would
 * distort it, so the box and the leaf are tracked separately.
 */
const SOCIALS = [
  {
    label: "Linkedin",
    href: "https://www.linkedin.com/company/trevarealestate",
    src: "/images/icons/linkedin.svg",
    w: 16,
    h: 16,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/treva.realestate?igsh=cDY3OTh0b3JyOGZy",
    src: "/images/icons/instagram.svg",
    w: 16,
    h: 16,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Trevarealestate/61576234409540/",
    src: "/images/icons/facebook.svg",
    w: 8.83,
    h: 13.5,
  },
  {
    label: "Youtube",
    href: "https://youtube.com/@trevarealestate?si=zN8KQjIc7UJA7mlY",
    src: "/images/icons/youtube.svg",
    w: 16,
    h: 16,
  },
  {
    label: "Tiktok",
    href: "https://www.tiktok.com/@treva.realestate?_t=ZS-8y85uLU6heS&_r=1",
    src: "/images/icons/tiktok.svg",
    w: 16,
    h: 16,
  },
];

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "az", label: "AZ" },
];

/**
 * Footer — Figma 724:19591, a 1344x479 card on the same translucent panel and
 * 24 radius as the header.
 *
 * Two 580 columns, each a full-height flex column that pushes its last row to
 * the bottom: that is what lines the socials up with the copyright and the
 * "All Rights reserved" line up with the language switch, without any of the
 * four knowing the others' heights.
 *
 * On mobile the design runs a different order entirely — brand, nav, contact,
 * location, languages, copyright, rights, then socials beside the scroll-top
 * button. Rather than duplicate the markup, the wrappers go `display: contents`
 * there and the leaves are ordered into a single grid column; that is why every
 * block below carries its own modifier class.
 *
 * Nav labels stay on the dictionary rather than the design. The frame is
 * English-only and spells two of them "Inventroy" and "Pluse"; this footer
 * renders in three languages, so the localised copy wins over the mockup.
 */
export default function FooterV2({ locale }: Props) {
  const dict = getDict(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="hv2-section hv2-footer-wrap">
      <div className="hv2-shell hv2-footer">
        <div className="hv2-footer__col">
          <div className="hv2-footer__brand">
            <Link href={`/${locale}`} className="hv2-nav__logo" aria-label="TREVA">
              <Image src="/Logo.svg" alt="TREVA" width={120} height={27} unoptimized />
            </Link>
            <p className="hv2-footer__about">{dict.footer.about}</p>
          </div>

          <div className="hv2-footer__row">
            <div className="hv2-footer__socials">
              {SOCIALS.map(({ label, href, src, w, h }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="hv2-footer__social"
                >
                  <Image
                    src={src}
                    alt=""
                    aria-hidden="true"
                    width={Math.round(w)}
                    height={Math.round(h)}
                    style={{ width: `${w}px`, height: `${h}px` }}
                    unoptimized
                  />
                </a>
              ))}
            </div>

            <p className="hv2-footer__caption hv2-footer__caption--rights">{dict.footer.rights}</p>
          </div>
        </div>

        <div className="hv2-footer__col">
          <div className="hv2-footer__stack">
            <nav className="hv2-footer__nav">
              {dict.nav.map((item) => (
                <Link key={item.href} href={`/${locale}${item.href}`}>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hv2-footer__row hv2-footer__row--top">
              <div className="hv2-footer__group hv2-footer__group--contact">
                <h3 className="hv2-footer__col-title">{dict.footer.contactTitle}</h3>
                <div className="hv2-footer__list">
                  <a href="tel:2662">*2662</a>
                  <a href="tel:+994502772662">050-277-2662</a>
                  <a href="mailto:info@treva.realestate">info@treva.realestate</a>
                </div>
              </div>

              <div className="hv2-footer__group hv2-footer__group--location">
                <h3 className="hv2-footer__col-title">{dict.footer.locationTitle}</h3>
                <div className="hv2-footer__list">
                  <p>{dict.footer.addressLine1}</p>
                  <p>{dict.footer.addressLine2}</p>
                </div>
              </div>

              <button
                type="button"
                className="hv2-footer__totop"
                aria-label={dict.footer.backToTop}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <Image
                  src="/images/icons/scroll-top.svg"
                  alt=""
                  aria-hidden="true"
                  width={28}
                  height={28}
                  unoptimized
                />
              </button>
            </div>
          </div>

          <div className="hv2-footer__row">
            <p className="hv2-footer__caption hv2-footer__caption--copy">
              &copy; {year} — {dict.footer.copyright}
            </p>

            <div className="hv2-footer__langs">
              <span className="hv2-footer__langs-label">{dict.footer.languages}</span>
              <div className="hv2-footer__langs-row">
                {LANGUAGES.map((language) => (
                  <Link
                    key={language.code}
                    href={`/${language.code}?v=2`}
                    aria-current={language.code === locale ? "true" : undefined}
                  >
                    {language.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
