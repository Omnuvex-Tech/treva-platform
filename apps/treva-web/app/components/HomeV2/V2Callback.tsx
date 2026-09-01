import "./home-v2.css";
import CallbackV2 from "./CallbackV2";

type Role = "Client" | "Developer" | "Broker";

/**
 * The V2 callback banner for pages whose body is still V1. `CallbackV2` styles
 * itself entirely from the `--hv2-*` tokens, which only exist on `.hv2-root`;
 * `.hv2-chrome` keeps that wrapper to `display: contents` so the banner drops
 * into the page flow exactly where it was without a stray box — same trick as
 * `V2Nav` / `V2Footer`.
 */
export default function V2Callback({ locale, role }: { locale: string; role?: Role }) {
    return (
        <div className="hv2-root hv2-chrome">
            <CallbackV2 locale={locale} role={role} />
        </div>
    );
}
