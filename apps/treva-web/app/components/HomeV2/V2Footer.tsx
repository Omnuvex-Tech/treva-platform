import "./home-v2.css";
import FooterV2 from "./FooterV2";

type Props = { locale: string };

/**
 * The V2 footer (`FooterV2`) for pages whose body is still V1. Exported as
 * `HomeFooter` so it drops in for the old footer with only an import-path
 * change. See `V2Nav` for what the `.hv2-root .hv2-chrome` wrapper does.
 */
export function HomeFooter({ locale }: Props) {
    return (
        <div className="hv2-root hv2-chrome">
            <FooterV2 locale={locale} />
        </div>
    );
}

export default HomeFooter;
