import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import ContactV2 from "./ContactV2";
import TopBackgroundV2, { type BgAnchor } from "./TopBackgroundV2";
import FooterV2 from "./FooterV2";

/**
 * The tint splits through the two contact cards, the way the home page's
 * splits through its search card — so the page's own title and lead stay
 * above it on white, and the cards read as floating half in each.
 */
const CT_ANCHORS: BgAnchor[] = [{ from: ".hv2-ct__grid" }];

type Props = { locale: string };

/**
 * Contact page — Figma 622:1824 (desktop) and 622:1782 (mobile).
 *
 * Header, contact block, footer — no callback banner here. The design ends the
 * page on the office cards and goes straight to the footer, which reads as
 * deliberate: the page already is a contact form.
 */
export default function ContactPage({ locale }: Props) {
  return (
    <div className="page-wrapper contact-page--v2" data-locale={locale} data-design="v2">
      <div className="hv2-root">
        <TopBackgroundV2 anchors={CT_ANCHORS} />
        <NavbarV2 locale={locale} />
        <ContactV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
