import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { TeamMember } from "./data";

type Props = { locale: string; members?: TeamMember[] };

const AVATAR_FALLBACK = "/assets/webflow-placeholder.svg";
const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 432px";

/** One glyph per advantage, in the order the design lists the cards. */
const ADVANTAGE_ICONS = [
  "/images/icons/megaphone.svg",
  "/images/icons/users.svg",
  "/images/icons/globe-outline.svg",
  "/images/icons/briefcase.svg",
];

/**
 * About — Figma 627:17513: a full-bleed photo, the four advantage cards, then
 * the team grid.
 *
 * The advantage cards are the one place in the file that reaches for Poppins
 * and a separate `Font/*` size scale instead of the Oak Sans typography tokens
 * every other block uses. Their sizes are honoured exactly (18/24 and 14/20)
 * but on the site's own faces — pulling in a third family for four cards would
 * cost a webfont and leave the page reading in two different voices.
 */
export default function AboutV2({ locale, members = [] }: Props) {
  const dict = getDict(locale);

  return (
    <>
      <section className="hv2-shell hv2-s-abouthero">
        <div className="hv2-about__hero">
          <Image
            src="/images/figma/about-hero.jpg"
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 1600px) 100vw, 1344px"
            priority
          />
        </div>
      </section>

      <section className="hv2-shell hv2-section hv2-s-advantages">
        <div className="hv2-about__head">
          <h1 className="hv2-about__title">{dict.about.advantagesTitle}</h1>
          <p className="hv2-about__lead">{dict.about.advantagesLead}</p>
        </div>

        <div className="hv2-about__cards">
          {dict.about.cards.map((card, index) => (
            <article key={card.title} className="hv2-adv">
              <span className="hv2-adv__icon">
                <Image
                  src={ADVANTAGE_ICONS[index] ?? ADVANTAGE_ICONS[0]!}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  unoptimized
                />
              </span>

              <div className="hv2-adv__text">
                <h2 className="hv2-adv__title">{card.title}</h2>
                <p className="hv2-adv__desc">{card.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {members.length > 0 ? (
        <section className="hv2-shell hv2-section hv2-s-teamgrid">
          <div className="hv2-about__head">
            <h2 className="hv2-about__title">{dict.about.teamTitle}</h2>
            <p className="hv2-about__lead">{dict.about.teamLead}</p>
          </div>

          <div className="hv2-grid-3 hv2-about__team">
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

          <div className="hv2-center">
            <Link href={`/${locale}/authors`} className="hv2-pill hv2-pill--dark hv2-pill--cta">
              {dict.about.teamCta}
              <Image
                src="/images/icons/arrow-up-right.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                unoptimized
              />
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
