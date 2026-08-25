import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import CalculatorV2 from "./CalculatorV2";
import ProjectsV2 from "./ProjectsV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";
import { getDict } from "./dictionary";
import { projectCards } from "./data";

type Props = { locale: string };

/**
 * Credit calculator page — Figma 635:21099 (desktop) and 635:21026 (mobile).
 *
 * The frame is named "Contact" in the file, but it holds a credit calculator, a
 * result panel and a three-card project strip — the actual contact form lives
 * in a different frame of the same name (622:1824). Only the calculator hero is
 * new here; the projects strip is the home component with its own heading and
 * no blurb, and the banner and footer are shared.
 */
export default function CreditPage({ locale }: Props) {
  const dict = getDict(locale);

  return (
    <div className="page-wrapper credit-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <NavbarV2 locale={locale} />
        <CalculatorV2 locale={locale} />
        <ProjectsV2
          locale={locale}
          items={projectCards.slice(0, 3)}
          title={dict.credit.projectsTitle}
          showLead={false}
        />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
