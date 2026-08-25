import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { NewsCard } from "./data";

type Props = { locale: string; items: NewsCard[] };

const COVER_FALLBACK = "/assets/webflow-placeholder.svg";
const CTA_ICON = "/images/icons/arrow-up-right.svg";
const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 432px";

/**
 * Treva Pulse — Figma 724:20855.
 *
 * Unlike the team card, this one does not overlay its footer: the cover takes
 * 335 of the card's 432 and the 96px footer follows it in flow, so the category
 * pill sits on a clean panel rather than on the photo.
 */
export default function PulseV2({ locale, items }: Props) {
  const dict = getDict(locale);

  if (items.length === 0) return null;

  return (
    <section className="hv2-shell hv2-section hv2-s-pulse">
      <div className="hv2-partners__head">
        <h2 className="hv2-h2">{dict.pulse.title}</h2>
        <p className="hv2-lead">
          {dict.pulse.lead[0]}
          <br />
          {dict.pulse.lead[1]}
        </p>
      </div>

      <div className="hv2-grid-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/${locale}/pulse/${item.slug}`}
            className="hv2-ucard hv2-ucard--news"
          >
            <div className="hv2-ucard__media">
              <Image
                src={item.image || COVER_FALLBACK}
                alt={item.title}
                fill
                sizes={CARD_SIZES}
              />
            </div>

            <div className="hv2-ucard__foot">
              <div className="hv2-ucard__info">
                <p className="hv2-ucard__title">{item.title}</p>
                <p className="hv2-ucard__meta">{item.date}</p>
              </div>

              {item.category ? <span className="hv2-ucard__tag">{item.category}</span> : null}
            </div>
          </Link>
        ))}
      </div>

      <div className="hv2-center">
        <Link href={`/${locale}/pulse`} className="hv2-pill hv2-pill--dark hv2-pill--cta">
          {dict.pulse.cta}
          <Image src={CTA_ICON} alt="" aria-hidden="true" width={24} height={24} unoptimized />
        </Link>
      </div>
    </section>
  );
}
