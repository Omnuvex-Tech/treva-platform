import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import AboutV2 from "./AboutV2";
import FooterV2 from "./FooterV2";
import type { TeamMember } from "./data";

type Props = { locale: string; members?: TeamMember[] };

/**
 * About page — Figma 627:17513 (desktop) and 673:15809 (mobile).
 *
 * Header, hero photo, advantages, team, footer. No callback banner: the design
 * ends on the team's "see the whole team" button and goes straight to the
 * footer.
 */
export default function AboutPage({ locale, members }: Props) {
  return (
    <div className="page-wrapper about-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <NavbarV2 locale={locale} />
        <AboutV2 locale={locale} members={members} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
