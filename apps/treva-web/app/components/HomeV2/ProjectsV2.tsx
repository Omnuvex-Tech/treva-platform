import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import { projectCards, type ProjectCard } from "./data";
import ProjectCardV2 from "./ProjectCardV2";

type Props = { locale: string; items?: ProjectCard[] };

export default function ProjectsV2({ locale, items = projectCards }: Props) {
  const dict = getDict(locale);

  return (
    <section className="hv2-shell hv2-section hv2-s-projects">
      <div className="hv2-section-head">
        <h2 className="hv2-h2">{dict.projects.title}</h2>
        {/* One paragraph wrapping inside a fixed 272px box — the design has no
            forced break here, and hard-coding one splits the Azerbaijani and
            Russian copy in the wrong place. */}
        <p className="hv2-lead">{dict.projects.lead.join(" ")}</p>
      </div>

      <div className="hv2-grid-3">
        {items.map((item) => (
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
