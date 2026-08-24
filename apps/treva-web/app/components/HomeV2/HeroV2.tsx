import Link from "next/link";
import { CreditCard, Command } from "lucide-react";
import { getDict } from "./dictionary";

type Props = { locale: string };

const HERO_VIDEO = "/6825d64025f8005ef1ddfc4c_68ca8e5a67ef60d728ebc041_video-transcode.mp4";

export default function HeroV2({ locale }: Props) {
  const dict = getDict(locale);

  return (
    <section className="hv2-shell">
      <div className="hv2-hero">
        {/* Internal Credit Calculator — va.svg is the card artwork (see home-v2.css). */}
        <div className="hv2-calc">
          <h2 className="hv2-calc__title">{dict.calculator.title}</h2>
          <p className="hv2-calc__subtitle">{dict.calculator.subtitle}</p>

          <Link href={`/${locale}/contact`} className="hv2-pill hv2-pill--dark hv2-calc__cta">
            {dict.calculator.cta}
            <CreditCard size={15} strokeWidth={1.6} />
          </Link>
        </div>

        {/* Hero visual. The caption sits in a light bar under the footage rather
            than over it — the frame keeps the two apart.
            muted + playsInline are what let the video autoplay on mobile; the
            poster covers the gap before the first frame decodes. */}
        <div className="hv2-heroimg">
          <div className="hv2-heroimg__media">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/treva-hero-bg.jpg"
              aria-hidden="true"
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
          </div>

          <div className="hv2-heroimg__bar">
            <p className="hv2-heroimg__scroll">
              {dict.heroScroll[0]}
              <br />
              {dict.heroScroll[1]}
            </p>

            <Link href={`/${locale}/contact`} className="hv2-pill hv2-heroimg__cta">
              {dict.consultation}
              <Command size={14} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
