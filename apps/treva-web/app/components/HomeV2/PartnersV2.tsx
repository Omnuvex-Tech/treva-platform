import Image from "next/image";
import { getDict } from "./dictionary";
import { partnerLogos } from "./data";

type Props = { locale: string };

/**
 * Partner logos as a continuously scrolling strip.
 *
 * The strip is deliberately not held by the page container: in the design it is
 * a 2504px run bled past both gutters of the 1440 canvas, so here it spans the
 * viewport and the heading above it stays inside the shell. See the
 * `.hv2-partners__bleed` rule for how that break-out is done.
 *
 * The list is rendered twice into one track. The track slides exactly half its
 * width and then snaps back, so the second copy lands where the first started
 * and the loop has no visible seam. The duplicate is hidden from assistive tech
 * — it carries no information the first pass did not already announce.
 */
export default function PartnersV2({ locale }: Props) {
  const dict = getDict(locale);

  return (
    <section className="hv2-shell hv2-section hv2-s-partners">
      <div className="hv2-partners__head">
        <h2 className="hv2-h2">{dict.partners.title}</h2>
        <p className="hv2-lead">
          {dict.partners.lead[0]}
          <br />
          {dict.partners.lead[1]}
        </p>
      </div>

      <div className="hv2-partners__bleed">
        <div className="hv2-partners__track">
          {[0, 1].map((pass) => (
            <div
              key={pass}
              className="hv2-partners__row"
              aria-hidden={pass === 1 ? "true" : undefined}
            >
              {partnerLogos.map((logo) => (
                <div key={logo.alt} className="hv2-partner">
                  <Image
                    className="hv2-partner__logo"
                    src={logo.src}
                    alt={pass === 0 ? logo.alt : ""}
                    width={logo.width}
                    height={logo.height}
                    style={{ objectFit: logo.fit ?? "contain" }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
