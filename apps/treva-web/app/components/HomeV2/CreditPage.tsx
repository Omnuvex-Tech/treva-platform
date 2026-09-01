import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import CalculatorV2 from "./CalculatorV2";
import TopBackgroundV2, { type BgAnchor } from "./TopBackgroundV2";
import ProjectsV2 from "./ProjectsV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";
import { getDict } from "./dictionary";
import { getCreditUnits } from "./inventory-api";

/**
 * The tint splits through the calculator card, the way the home page's splits
 * through its search card — the page's own heading sits inside that card, so
 * everything above the split stays on white.
 */
const CREDIT_ANCHORS: BgAnchor[] = [{ from: ".hv2-credit" }];

type Props = { locale: string };

/**
 * Credit calculator page — Figma 635:21099 (desktop) and 635:21026 (mobile).
 *
 * The frame is named "Contact" in the file, but it holds a credit calculator, a
 * result panel and a project strip — the actual contact form lives in a
 * different frame of the same name (622:1824). Only the calculator hero is new
 * here; the projects strip is the home component's own six-card grid (Figma
 * 457:10745), just with its own heading and no blurb — the banner and footer
 * are shared too.
 */
export default async function CreditPage({ locale }: Props) {
  const dict = getDict(locale);
  const units = await getCreditUnits();

  return (
    <div className="page-wrapper credit-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <TopBackgroundV2 anchors={CREDIT_ANCHORS} />
        <NavbarV2 locale={locale} />
        <CalculatorV2 locale={locale} units={units} />
        <ProjectsV2
          locale={locale}
          title={dict.credit.projectsTitle}
          showLead={false}
          limit={6}
        />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
