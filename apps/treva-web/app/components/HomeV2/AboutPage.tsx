import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import AboutV2 from "./AboutV2";
import TopBackgroundV2, { type BgAnchor } from "./TopBackgroundV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";
import type { TeamMember } from "./data";

/**
 * The tint splits through the hero photo, the way the home page's splits
 * through its search card — the header floats on white above it, everything
 * from the advantages down sits in the tint.
 */
const ABOUT_ANCHORS: BgAnchor[] = [{ from: ".hv2-about__hero" }];

type Props = { locale: string; members?: TeamMember[] };

/**
 * About page — Figma 627:17513 (desktop) and 673:15809 (mobile).
 *
 * Header, hero photo, advantages, team, callback banner, footer. The Figma
 * frame ends the team section straight into the footer, but the callback
 * banner is the site-wide CTA now — every page carries it above the footer.
 */
export default function AboutPage({ locale, members }: Props) {
  return (
    <div className="page-wrapper about-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <TopBackgroundV2 anchors={ABOUT_ANCHORS} />
        <NavbarV2 locale={locale} />
        <AboutV2 locale={locale} members={members} />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
