import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { TeamMember } from "./data";

type Props = { locale: string; members: TeamMember[] };

const AVATAR_FALLBACK = "/assets/webflow-placeholder.svg";
const CTA_ICON = "/images/features-pro/icons/arrow-up-right.svg";
const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 432px";

/**
 * "Meet our Team" — Figma 583:11353.
 *
 * The intro takes the first cell of the same 3-column grid the member cards sit
 * in, so the two rows stay aligned at every width. Inside it the stat box grows
 * to fill the leftover height and pushes its button to the bottom, which is what
 * makes the intro end level with the 432px cards beside it.
 */
export default function TeamV2({ locale, members }: Props) {
  const dict = getDict(locale);

  if (members.length === 0) return null;

  return (
    <section className="hv2-shell hv2-section hv2-s-team">
      <div className="hv2-grid-3">
        <div className="hv2-team__intro">
          <h2 className="hv2-team__title">{dict.team.title}</h2>

          <div className="hv2-team__stat">
            <div className="hv2-team__details">
              <p className="hv2-team__count">{dict.team.count}</p>
              <p className="hv2-team__lead">{dict.team.lead}</p>
            </div>

            <Link href={`/${locale}/about-us`} className="hv2-pill hv2-pill--dark hv2-pill--cta">
              {dict.team.cta}
              <Image src={CTA_ICON} alt="" aria-hidden="true" width={24} height={24} unoptimized />
            </Link>
          </div>
        </div>

        {members.map((member) => (
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
    </section>
  );
}
