"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { TeamMember } from "./data";

type Props = { locale: string; members: TeamMember[] };

/** How many cards the grid opens with, and how many each click adds or removes. */
const STEP = 6;

const AVATAR_FALLBACK = "/assets/webflow-placeholder.svg";
const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 432px";

/**
 * The about page's team grid — the one part of that page that needs state, so
 * it is split out as its own client component and the heading above it stays
 * on the server, the same split the V1 team grid uses.
 *
 * The list does not open all at once: each "more" adds six cards, and the
 * button drops away once the whole team is on screen. There is no way back —
 * collapsing a list the reader has already scrolled past moves the ground
 * under them.
 */
export default function TeamGridV2({ locale, members }: Props) {
  const dict = getDict(locale);
  const [count, setCount] = useState(STEP);

  const visible = members.slice(0, count);
  const canShowMore = count < members.length;

  return (
    <>
      <div className="hv2-grid-3 hv2-about__team">
        {visible.map((member) => (
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

      {canShowMore ? (
        <div className="hv2-center">
          <button
            type="button"
            className="hv2-pill hv2-pill--dark hv2-pill--cta"
            onClick={() => setCount((c) => c + STEP)}
          >
            {dict.about.teamMore}
          </button>
        </div>
      ) : null}
    </>
  );
}
