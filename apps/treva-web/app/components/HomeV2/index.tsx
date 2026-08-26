import "./home-v2.css";
import TopBackgroundV2 from "./TopBackgroundV2";
import NavbarV2 from "./NavbarV2";
import HeroV2 from "./HeroV2";
import SearchPanelV2 from "./SearchPanelV2";
import ProjectsV2 from "./ProjectsV2";
import PartnersV2 from "./PartnersV2";
import InventoryV2 from "./InventoryV2";
import TeamV2 from "./TeamV2";
import PulseV2 from "./PulseV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";
import type { InventoryCard, NewsCard, TeamMember } from "./data";

type HomeV2Props = {
  locale: string;
  inventory?: InventoryCard[];
  resaleInventory?: InventoryCard[];
  team?: TeamMember[];
  news?: NewsCard[];
};

/**
 * Home V2 — the redesign served at `?v=2`.
 *
 * Every section is V2-native: nothing is shared with the V1 home page, which
 * keeps its own navbar, footer and callback form. The whole tree sits inside
 * `.hv2-root` so the V2 typography reset (see home-v2.css) applies once.
 */
export default function HomeV2({
  locale,
  inventory,
  resaleInventory,
  team = [],
  news = [],
}: HomeV2Props) {
  return (
    <div className="page-wrapper home-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <TopBackgroundV2 />
        <NavbarV2 locale={locale} />
        <HeroV2 locale={locale} />
        <SearchPanelV2 locale={locale} />
        <ProjectsV2 locale={locale} />
        <InventoryV2 locale={locale} items={inventory} resaleItems={resaleInventory} />
        <PartnersV2 locale={locale} />
        <TeamV2 locale={locale} members={team} />
        <PulseV2 locale={locale} items={news} />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
