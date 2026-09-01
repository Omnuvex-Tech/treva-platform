"use client";

import Link from "next/link";
import Image from "next/image";
import CardImage from "./CardImage";
import "./HomeV2/home-v2.css";

/** The developer glyph the home strip puts in front of the brand name. */
const DEV_ICON = "/images/features-pro/icons/dreamfest-arena.svg";

type Props = {
  href: string;
  image?: string;
  alt: string;
  /** The card's headline — the price, as on the home page. */
  price: string;
  developer?: string;
  /** Bulleted row under the brand: project, rooms, area, floor… */
  specs: Array<string | undefined | null>;
  /** Omit the pair to render a card without the heart/compare buttons. */
  saved?: boolean;
  compared?: boolean;
  onSave?: () => void;
  onCompare?: () => void;
  labels?: { save: string; saved: string; compare: string; compared: string };
  sizes?: string;
};

/**
 * The unit card the home page's Inventory strip introduced (Figma 635-21025),
 * used for every off-plan and resale card on the site so the two never drift
 * apart again.
 *
 * `.hv2-root` rides along on the wrapper: the card's own rules live in
 * home-v2.css and read `--hv2-*` tokens that are declared on that class, and
 * the listing pages it now serves are V1 pages with no such ancestor.
 */
export default function UnitCardV2({
  href,
  image,
  alt,
  price,
  developer,
  specs,
  saved,
  compared,
  onSave,
  onCompare,
  labels,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 432px",
}: Props) {
  const items = specs.filter((spec): spec is string => Boolean(spec && spec.trim()));

  return (
    <div className="hv2-root hv2-ucard-wrap">
      <Link href={href} className="hv2-ucard hv2-ucard--unit">
        <div className="hv2-ucard__media">
          <div className="hv2-ucard__plan">
            {image ? (
              <CardImage src={image} alt={alt} fill sizes={sizes} style={{ objectFit: "cover" }} />
            ) : null}
          </div>
        </div>

        <div className="hv2-ucard__foot">
          <div className="hv2-ucard__info">
            <p className="hv2-ucard__title">{price}</p>

            {developer ? (
              <p className="hv2-ucard__meta hv2-ucard__dev">
                <Image
                  className="hv2-ucard__dev-icon"
                  src={DEV_ICON}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  unoptimized
                />
                {developer}
              </p>
            ) : null}

            {items.length > 0 ? (
              <p className="hv2-ucard__meta hv2-ucard__specs">
                {items.map((spec) => (
                  <span key={spec}>{spec}</span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Outside the link: a <button> cannot nest inside an <a>. */}
      {onSave && onCompare && labels ? (
        <div className="hv2-ucard__actions">
          <button
            type="button"
            className={`hv2-ucard__action-btn${compared ? " active" : ""}`}
            aria-label={compared ? labels.compared : labels.compare}
            onClick={onCompare}
          >
            <Image src="/images/icons/compare.svg" alt="" aria-hidden="true" width={20} height={20} unoptimized />
          </button>
          <button
            type="button"
            className={`hv2-ucard__action-btn${saved ? " active" : ""}`}
            aria-label={saved ? labels.saved : labels.save}
            onClick={onSave}
          >
            <Image src="/images/icons/heart.svg" alt="" aria-hidden="true" width={20} height={20} unoptimized />
          </button>
        </div>
      ) : null}
    </div>
  );
}
