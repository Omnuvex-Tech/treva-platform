import "./home-v2.css";
import NavbarV2 from "./NavbarV2";

type Props = {
    locale: string;
    /** Accepted for drop-in parity with the old `Navbar`; V2 has one look. */
    variant?: string;
};

/**
 * The V2 header (`NavbarV2`) for pages whose body is still V1.
 *
 * `.hv2-root` carries the `--hv2-*` tokens the header needs; `.hv2-chrome` turns
 * that wrapper into `display: contents` so the sticky header lays out against
 * the page itself, not this box. The page in between is untouched — see the
 * `.hv2-chrome` / `body:has(.hv2-nav)` notes in home-v2.css.
 */
export default function V2Nav({ locale }: Props) {
    return (
        <div className="hv2-root hv2-chrome">
            <NavbarV2 locale={locale} />
        </div>
    );
}
