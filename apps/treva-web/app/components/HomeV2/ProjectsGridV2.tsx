"use client";

import "./home-v2.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import { projectCards, type ProjectCard } from "./data";
import { getProjectCards } from "./projects-api";
import ProjectCardV2 from "./ProjectCardV2";

type Props = {
  locale: string;
  /** How many cards to show; the home strip and this one both pass 6. */
  limit?: number;
  /** Overrides the section heading. */
  title?: string;
  /** The blurb under the heading — on by default, same as the home strip. */
  showLead?: boolean;
  /** The trailing "see all projects" pill — on by default. */
  showSeeAll?: boolean;
};

/**
 * Client twin of `ProjectsV2` — same CMS-fed 6-card grid, same `ProjectCardV2`,
 * but it fetches on mount instead of `await`-ing on the server, so it can drop
 * into a `"use client"` page (the developers page's featured-projects strip).
 *
 * Wrapped in `.hv2-root .hv2-chrome` so the `--hv2-*` tokens resolve on a page
 * whose body is still V1 — same pattern as `V2Nav` / `V2Callback`.
 */
export default function ProjectsGridV2({
  locale,
  limit = 6,
  title,
  showLead = true,
  showSeeAll = true,
}: Props) {
  const dict = getDict(locale);
  const [cards, setCards] = useState<ProjectCard[]>(projectCards);

  useEffect(() => {
    let cancelled = false;
    getProjectCards(locale).then((list) => {
      if (!cancelled && list.length > 0) setCards(list);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const list = limit ? cards.slice(0, limit) : cards;

  return (
    <div className="hv2-root hv2-chrome">
      <section
        className={
          list.length > 3
            ? "hv2-shell hv2-section hv2-s-projects"
            : "hv2-shell hv2-section hv2-s-projects hv2-s-projects--single"
        }
      >
        <div className="hv2-section-head">
          <h2 className="hv2-h2">{title ?? dict.projects.title}</h2>
          {showLead ? <p className="hv2-lead">{dict.projects.lead.join(" ")}</p> : null}
        </div>

        <div className="hv2-grid-3">
          {list.map((item) => (
            <ProjectCardV2
              key={item.slug}
              item={item}
              locale={locale}
              startingFromLabel={dict.projects.startingFrom}
              soldOutLabel={dict.projects.soldOut}
            />
          ))}
        </div>

        {showSeeAll ? (
          <div className="hv2-center">
            <Link
              href={`/${locale}/projects`}
              className="hv2-pill hv2-pill--dark hv2-pill--cta"
            >
              {dict.projects.seeAll}
              <Image
                src="/images/icons/arrow-down.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                unoptimized
              />
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
