import Link from "next/link";
import Image from "next/image";
// lucide-react dropped brand marks in v1, so the social icons come from react-icons.
import { FaLinkedinIn, FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa6";
import { getDict } from "./dictionary";

type Props = { locale: string };

/** Same destinations the V1 footer links to. */
const SOCIALS = [
  { label: "Linkedin", href: "https://www.linkedin.com/company/trevarealestate", Icon: FaLinkedinIn },
  {
    label: "Instagram",
    href: "https://www.instagram.com/treva.realestate?igsh=cDY3OTh0b3JyOGZy",
    Icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Trevarealestate/61576234409540/",
    Icon: FaFacebookF,
  },
  { label: "Youtube", href: "https://youtube.com/@trevarealestate?si=zN8KQjIc7UJA7mlY", Icon: FaYoutube },
  {
    label: "Tiktok",
    href: "https://www.tiktok.com/@treva.realestate?_t=ZS-8y85uLU6heS&_r=1",
    Icon: FaTiktok,
  },
];

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "az", label: "AZ" },
];

export default function FooterV2({ locale }: Props) {
  const dict = getDict(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="hv2-shell hv2-section hv2-footer-wrap">
      <div className="hv2-footer">
        <div className="hv2-footer__top">
          <Link href={`/${locale}`} className="hv2-nav__logo" aria-label="TREVA">
            <Image src="/Logo.svg" alt="TREVA" width={120} height={27} unoptimized />
          </Link>

          <nav className="hv2-footer__nav">
            {dict.nav.map((item) => (
              <Link key={item.href} href={`/${locale}${item.href}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hv2-footer__mid">
          <p className="hv2-footer__about">{dict.footer.about}</p>

          <div className="hv2-footer__col">
            <h3 className="hv2-footer__col-title">{dict.footer.contactTitle}</h3>
            <a href="tel:2662">*2662</a>
            <a href="tel:+994502772662">050-277-2662</a>
            <a href="mailto:info@treva.realestate">info@treva.realestate</a>
          </div>

          <div className="hv2-footer__col">
            <h3 className="hv2-footer__col-title">{dict.footer.locationTitle}</h3>
            <p>{dict.footer.addressLine1}</p>
            <p>{dict.footer.addressLine2}</p>
          </div>
        </div>

        <div className="hv2-footer__bottom">
          <div className="hv2-footer__socials">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="hv2-footer__social"
              >
                <Icon size={13} />
              </a>
            ))}
          </div>

          <p className="hv2-footer__legal">
            <span>{dict.footer.rights}</span>
            <span>
              &copy; {year} — {dict.footer.copyright}
            </span>
          </p>

          <div className="hv2-footer__langs">
            <span className="hv2-footer__langs-label">{dict.footer.languages}</span>
            <div className="hv2-footer__langs-row">
              {LANGUAGES.map((language) => (
                <Link
                  key={language.code}
                  href={`/${language.code}?v=2`}
                  aria-current={language.code === locale ? "true" : undefined}
                >
                  {language.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
