import Image from "next/image";
import { getDict } from "./dictionary";
import TeamGridV2 from "./TeamGridV2";
import VideoV2 from "./VideoV2";
import type { TeamMember } from "./data";

type Props = { locale: string; members?: TeamMember[] };

/** One glyph per advantage, in the order the design lists the cards. */
const ADVANTAGE_ICONS = [
  "/images/icons/megaphone.svg",
  "/images/icons/users.svg",
  "/images/icons/globe-outline.svg",
  "/images/icons/briefcase.svg",
];

/**
 * The hero footage. Figma 658:8865 ("Consultation") leaves this frame blank —
 * it is a video slot — so it runs its own clip. No poster: the design's own
 * hero still is a different scene, so the page read as loading one image and
 * then swapping it for the footage a beat later. `preload="auto"` fetches the
 * clip up front instead, so the first thing painted in the frame is the
 * video's own opening. muted + playsInline are what let it autoplay on mobile.
 */
const HERO_VIDEO = "/videos/about-hero.mp4";

/**
 * About — Figma 627:17513: a full-bleed hero, the four advantage cards, then
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
          <VideoV2 src={HERO_VIDEO} />
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

          <TeamGridV2 locale={locale} members={members} />
        </section>
      ) : null}
    </>
  );
}
