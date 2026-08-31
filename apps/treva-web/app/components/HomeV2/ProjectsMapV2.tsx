import Image from "next/image";
import { getDict } from "./dictionary";

type Props = { locale: string };

/**
 * Projects map hero — Figma 3164:5692 ("Consultation"), 1344x568.
 *
 * One flat plate: the aerial site plan with every project's sign already drawn
 * into it. There is nothing to wire up — the pins are artwork, not markup, and
 * the frame holds no text, links or overlay of its own.
 *
 * The plate is taller than the frame it sits in (the design scales it to the
 * full width, giving 1344x752 against a 568 box) and pulls it up 64px. That is
 * reproduced as a share of the overflow rather than a fixed offset, so the
 * framing survives the card narrowing.
 */
export default function ProjectsMapV2({ locale }: Props) {
  const dict = getDict(locale);

  return (
    <section className="hv2-shell hv2-s-projmap">
      <div className="hv2-projmap">
        <Image
          src="/images/figma/projects-map.jpg"
          alt={dict.projects.mapAlt}
          fill
          sizes="(max-width: 1414px) 100vw, 1344px"
          priority
        />
      </div>
    </section>
  );
}
