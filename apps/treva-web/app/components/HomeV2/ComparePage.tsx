import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import ComparisonV2 from "./ComparisonV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";
import type { InventoryCard } from "./data";

type Props = { locale: string; items?: InventoryCard[] };

/**
 * Comparison page — Figma 638:26919 (desktop) and 638:26916 (mobile).
 *
 * Three of its four blocks already exist: the header, the callback banner and
 * the footer are the same components the V2 home page renders, so only the
 * comparison table itself is new. The whole tree sits inside `.hv2-root` for the
 * same reason the home page does — that is where the V2 reset lives.
 */
export default function ComparePage({ locale, items }: Props) {
  return (
    <div className="page-wrapper compare-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <NavbarV2 locale={locale} />
        <ComparisonV2 locale={locale} items={items} />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
