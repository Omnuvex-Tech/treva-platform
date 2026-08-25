import "./home-v2.css";
import NavbarV2 from "./NavbarV2";
import ContactV2 from "./ContactV2";
import FooterV2 from "./FooterV2";

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
        <NavbarV2 locale={locale} />
        <ContactV2 locale={locale} />
        <FooterV2 locale={locale} />
      </div>
    </div>
  );
}
