import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import WishlistV2 from "./WishlistV2";
import TopBackgroundV2, { type BgAnchor } from "./TopBackgroundV2";
import CallbackV2 from "./CallbackV2";
import FooterV2 from "./FooterV2";

/**
 * Müqayisə səhifəsindəki kimi: rəng keçidi ilk kartın içindən keçir, kart
 * yoxdursa (siyahı boşdur) növbəti real blokdan — callback bannerindən.
 */
const WISH_ANCHORS: BgAnchor[] = [{ from: ".hv2-cmp__card" }, { from: ".hv2-cb" }];

type Props = { locale: string };

/**
 * Seçilmişlər səhifəsi — müqayisə səhifəsi (Figma 638:26919) ilə eyni qabıq.
 *
 * Header, callback banneri və footer V2 ana səhifəsinin komponentləridir;
 * siyahının özü `WishlistV2`-dədir və seçimi localStorage-dan
 * (`saved-properties.ts`) oxuyur, ona görə burada serverdən çəkiləsi bir şey
 * yoxdur.
 */
export default function WishlistPage({ locale }: Props) {
  return (
    <div className="page-wrapper wishlist-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <TopBackgroundV2 anchors={WISH_ANCHORS} />
        <NavbarV2 locale={locale} />
        <WishlistV2 locale={locale} />
        <CallbackV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
