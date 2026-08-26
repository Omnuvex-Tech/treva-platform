import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { TeamMember } from "./data";

type Props = { locale: string; members: TeamMember[] };

const AVATAR_FALLBACK = "/assets/webflow-placeholder.svg";
const CTA_ICON = "/images/icons/arrow-up-right.svg";
const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 432px";

/**
 * "Meet our Team" — Figma 1000:5542.
 *
 * A teaser, not the roster: the heading and blurb sit in their own row like
 * Projects and Search, the grid holds nothing but the first three members —
 * everything (photo, name, role) is CMS-fed via `getAuthors`, this component
 * only owns the layout — and "Explore Our Team" links out to the full list
 * at /about-us.
 */
export default function TeamV2({ locale, members }: Props) {
  const dict = getDict(locale);
  const list = members.slice(0, 3);

  if (list.length === 0) return null;

  return (
    <section className="hv2-shell hv2-section hv2-s-team">
      <div className="hv2-section-head">
        <h2 className="hv2-h2">{dict.team.title}</h2>
        <p className="hv2-lead">{dict.team.lead}</p>
      </div>

      <div className="hv2-grid-3">
        {list.map((member) => (
          <Link key={member.id} href={member.href} className="hv2-ucard hv2-ucard--person">
            <div className="hv2-ucard__media">
              <Image
                src={member.avatar || AVATAR_FALLBACK}
                alt={member.name}
                fill
                sizes={CARD_SIZES}
              />
            </div>

            <div className="hv2-ucard__foot">
              <div className="hv2-ucard__info">
                <p className="hv2-ucard__title">{member.name}</p>
                {member.role ? <p className="hv2-ucard__meta">{member.role}</p> : null}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hv2-center">
        <Link href={`/${locale}/about-us`} className="hv2-pill hv2-pill--dark hv2-pill--cta">
          {dict.team.cta}
          <Image src={CTA_ICON} alt="" aria-hidden="true" width={24} height={24} unoptimized />
        </Link>
      </div>
    </section>
  );
}
