import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { NavProject } from "./projects-api";

type Props = { locale: string; items: NavProject[]; onNavigate?: () => void };

/**
 * "Projects" mega-menu — Figma 324:3876, a 1344x376 panel of 321x170 cards laid
 * out four across and two down.
 *
 * The last cell is not a project: it is the "see all" card, which is why the
 * grid is built from the project list plus one trailing tile rather than from a
 * uniform array.
 *
 * The design fills each card's second line with Lorem Ipsum; the real line is
 * the CMS description, clamped to two lines in CSS (`.hv2-mega__desc`) rather
 * than cut off mid-word.
 */
export default function ProjectsMenuV2({ locale, items, onNavigate }: Props) {
  const dict = getDict(locale);

  return (
    <div className="hv2-mega">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/${locale}/projects/${item.slug}`}
          className="hv2-mega__card"
          onClick={onNavigate}
        >
          <span className="hv2-mega__head">
            {item.image ? (
              <Image
                className="hv2-mega__thumb"
                src={item.image}
                alt=""
                aria-hidden="true"
                width={60}
                height={60}
              />
            ) : null}
            <span className="hv2-mega__title">{item.title}</span>
          </span>

          <span className="hv2-mega__desc">{item.desc}</span>
        </Link>
      ))}

      <Link
        href={`/${locale}/projects`}
        className="hv2-mega__card hv2-mega__card--all"
        onClick={onNavigate}
      >
        <span className="hv2-mega__head">
          <span className="hv2-mega__title">{dict.projects.seeAll}</span>
          <span className="hv2-mega__go" aria-hidden="true">
            <Image
              src="/images/icons/arrow-up-right-dark.svg"
              alt=""
              width={24}
              height={24}
              unoptimized
            />
          </span>
        </span>

        <span className="hv2-mega__desc">{dict.projects.lead.join(" ")}</span>
      </Link>
    </div>
  );
}
