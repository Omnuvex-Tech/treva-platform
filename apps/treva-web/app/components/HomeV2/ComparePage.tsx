import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import ComparisonV2 from "./ComparisonV2";
import TopBackgroundV2, { type BgAnchor } from "./TopBackgroundV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";

/**
 * The tint splits through the first compared unit's card, the way the home
 * page's splits through its search card. With nothing compared there is no
 * card, so it falls back to the callback banner — the next real block on the
 * page — and splits through that instead.
 */
const CMP_ANCHORS: BgAnchor[] = [{ from: ".hv2-cmp__card" }, { from: ".hv2-cb" }];

type Props = { locale: string };

/**
 * Comparison page — Figma 638:26919 (desktop) and 638:26916 (mobile).
 *
 * Three of its four blocks already exist: the header, the callback banner and
 * the footer are the same components the V2 home page renders, so only the
 * comparison table itself is new. The whole tree sits inside `.hv2-root` for the
 * same reason the home page does — that is where the V2 reset lives.
 *
 * `ComparisonV2` reads the actual selection from `compare-properties.ts`
 * (localStorage) itself, so this shell has nothing server-side left to fetch.
 */
export default function ComparePage({ locale }: Props) {
  return (
    <div className="page-wrapper compare-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <TopBackgroundV2 anchors={CMP_ANCHORS} />
        <NavbarV2 locale={locale} />
        <ComparisonV2 locale={locale} />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
