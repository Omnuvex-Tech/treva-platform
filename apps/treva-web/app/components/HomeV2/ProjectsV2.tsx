import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import { projectCards, type ProjectCard } from "./data";
import ProjectCardV2 from "./ProjectCardV2";

type Props = {
  locale: string;
  /** Renders exactly this list instead of the seed — the credit page's
      three-card strip. Omit it for the full six-card home grid, which is
      deliberately static: the cards' copy, order, prices and hover clips are
      all the design's own (see `projectCards`), never the CMS's, so a plain
      `<ProjectsV2 locale={locale} />` needs no data wired to it. */
  items?: ProjectCard[];
  /** Overrides the section heading; the credit page gives it its own. */
  title?: string;
  /** The credit page drops the blurb — its head is a heading and nothing else. */
  showLead?: boolean;
};

export default function ProjectsV2({ locale, items, title, showLead = true }: Props) {
  const dict = getDict(locale);
  const list = items ?? projectCards;

  return (
    <section
      className={
        list.length > 3
          ? "hv2-shell hv2-section hv2-s-projects"
          : "hv2-shell hv2-section hv2-s-projects hv2-s-projects--single"
      }
    >
      <div className="hv2-section-head">
        <h2 className="hv2-h2">{title ?? dict.projects.title}</h2>
        {/* One paragraph wrapping inside a fixed 272px box — the design has no
            forced break here, and hard-coding one splits the Azerbaijani and
            Russian copy in the wrong place. */}
        {showLead ? <p className="hv2-lead">{dict.projects.lead.join(" ")}</p> : null}
      </div>

      <div className="hv2-grid-3">
        {list.map((item) => (
          <ProjectCardV2
            key={item.slug}
            item={item}
            locale={locale}
            startingFromLabel={dict.projects.startingFrom}
          />
        ))}
      </div>

      <div className="hv2-center">
        <Link
          href={`/${locale}/projects`}
          className="hv2-pill hv2-pill--dark hv2-pill--cta"
        >
          {dict.projects.seeAll}
          {/* Exported straight from the Button component; the lucide arrow it
              replaced sat at 14px against the design's 24. */}
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
    </section>
  );
}
