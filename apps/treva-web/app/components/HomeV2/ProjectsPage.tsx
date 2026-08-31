import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import TopBackgroundV2, { type BgAnchor } from "./TopBackgroundV2";
import ProjectsMapV2 from "./ProjectsMapV2";
import ProjectsV2 from "./ProjectsV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";

/**
 * The tint splits through the map hero, the way the home page's splits through
 * its search card — the header floats on white above it, the grid and
 * everything below sit in the tint.
 */
const PROJECTS_ANCHORS: BgAnchor[] = [{ from: ".hv2-projmap" }];

type Props = { locale: string };

/**
 * Projects page — Figma 3164:5025 (desktop) and 3164:4957 (mobile).
 *
 * The frame is named "Contact" in the file, the same mislabel the credit page
 * carries; what it holds is the projects screen — map hero, the six-card grid,
 * the callback banner and the footer.
 *
 * Only the map is new. The grid is the home page's own `ProjectsV2` with its
 * default six cards, and the banner is `CallbackV2` unchanged — both are the
 * same Figma components this page instances, so they are reused rather than
 * rebuilt.
 */
export default function ProjectsPage({ locale }: Props) {
  return (
    <div className="page-wrapper projects-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <TopBackgroundV2 anchors={PROJECTS_ANCHORS} />
        <NavbarV2 locale={locale} />
        <ProjectsMapV2 locale={locale} />
        <ProjectsV2 locale={locale} />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
