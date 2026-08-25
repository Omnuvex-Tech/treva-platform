import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import { projectCards } from "./data";

type Props = { locale: string; onNavigate?: () => void };

/**
 * "Projects" mega-menu — Figma 324:3876, a 1344x376 panel of 321x170 cards laid
 * out four across and two down.
 *
 * The last cell is not a project: it is the "see all" card, which is why the
 * grid is built from the project list plus one trailing tile rather than from a
 * uniform array.
 *
 * The design fills each card's second line with Lorem Ipsum. Rather than invent
 * marketing copy this renders the developer and the area range, which is real
 * data we already hold; a proper blurb should come from the CMS when the list
 * stops being seeded.
 */
export default function ProjectsMenuV2({ locale, onNavigate }: Props) {
  const dict = getDict(locale);

  return (
    <div className="hv2-mega">
      {projectCards.map((item) => (
        <Link
          key={item.slug}
          href={`/${locale}/projects/${item.slug}`}
          className="hv2-mega__card"
          onClick={onNavigate}
        >
          <span className="hv2-mega__head">
            <Image
              className="hv2-mega__thumb"
              src={`/images/thumbs/${item.slug}.jpg`}
              alt=""
              aria-hidden="true"
              width={60}
              height={60}
            />
            <span className="hv2-mega__title">{item.title}</span>
          </span>

          <span className="hv2-mega__desc">
            {item.developer} · {item.areaRange}
          </span>
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
