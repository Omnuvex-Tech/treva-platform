import Link from "next/link";
import { Calculator, Handshake } from "lucide-react";
import { getDict } from "./dictionary";
import VideoV2 from "./VideoV2";

type Props = { locale: string };

const HERO_VIDEO = "/videos/hero.mp4";

export default function HeroV2({ locale }: Props) {
  const dict = getDict(locale);

  return (
    <section className="hv2-shell">
      <div className="hv2-hero">
        {/* Internal Credit Calculator — va.svg is the card artwork (see home-v2.css). */}
        <div className="hv2-calc">
          <h2 className="hv2-calc__title">{dict.calculator.title}</h2>
          <p className="hv2-calc__subtitle">{dict.calculator.subtitle}</p>

          {/* The calculator card's own CTA goes to the calculator page, not the
              contact form — the consultation pill below is the one that asks
              for a person. */}
          <Link href={`/${locale}/credit`} className="hv2-pill hv2-pill--dark hv2-calc__cta">
            {dict.calculator.cta}
            {/* Figma 228:3184 — a calculator glyph on the credit CTA, a
                handshake on the consultation pill: two different icons. */}
            <Calculator size={18} strokeWidth={1.6} />
          </Link>
        </div>

        {/* Hero visual. The caption sits in a light bar under the footage rather
            than over it — the frame keeps the two apart.
            muted + playsInline are what let the video autoplay on mobile. The
            poster is a frame from the clip itself (see VideoV2), so it paints
            the hero instantly while the file streams. */}
        <div className="hv2-heroimg">
          <div className="hv2-heroimg__media">
            <VideoV2 src={HERO_VIDEO} poster="/images/figma/hero-poster.jpg" />
          </div>

          <div className="hv2-heroimg__bar">
            <p className="hv2-heroimg__scroll">
              {dict.heroScroll[0]}
              <br />
              {dict.heroScroll[1]}
            </p>

            <Link href={`/${locale}/contact`} className="hv2-pill hv2-heroimg__cta">
              {dict.consultation}
              <Handshake size={20} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
