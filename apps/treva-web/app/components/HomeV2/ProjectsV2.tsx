import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { ProjectCard } from "./data";
import { getProjectCards } from "./projects-api";
import ProjectCardV2 from "./ProjectCardV2";

type Props = {
  locale: string;
  /** Skips the CMS fetch and renders exactly this list — the credit page's
      three-card strip, static and unenriched. Omit it for the full,
      CMS-enriched six-card home grid: a plain `<ProjectsV2 locale={locale} />`
      is a complete, self-fetching section, so any future page can drop it in
      without wiring its own data. */
  items?: ProjectCard[];
  /** Overrides the section heading; the credit page gives it its own. */
  title?: string;
  /** The credit page drops the blurb — its head is a heading and nothing else. */
  showLead?: boolean;
};

export default async function ProjectsV2({ locale, items, title, showLead = true }: Props) {
  const dict = getDict(locale);
  const list = items ?? (await getProjectCards(locale));

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
