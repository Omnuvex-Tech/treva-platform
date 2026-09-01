"use client";

import { useState } from "react";
import Image from "next/image";
import { getDict } from "./dictionary";

type Role = "Client" | "Developer" | "Broker";

type Props = {
  locale: string;
  /**
   * Which lead bucket the submission lands in — the `/callback` endpoint's
   * `role` field, the same one the old `CallbackForm` sent from its role
   * selector. This banner has no selector (Figma 865:27787 has none), so the
   * page picks: `Developer` on the developers page, `Client` everywhere else.
   */
  role?: Role;
};

const CMS_API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:10021";

/** Bare local number → +994 E.164; anything already prefixed is left alone. */
function normalizePhone(raw: string): string {
  const trimmed = raw.replace(/\s+/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  return `+994${trimmed.replace(/^0+/, "")}`;
}

/**
 * Callback banner — Figma 865:27787, 1344x444, the last block before the footer.
 *
 * Three layers inside one clipped 20-radius card: the oversized "V" watermark,
 * the family photo pinned to the right edge, and the form floating over both on
 * the left. The watermark and the photo are both anchored off the card's centre
 * the way the design places them, so they keep their relationship as the card
 * narrows instead of drifting apart.
 *
 * Submits `{ name, phone, role }` to `/callback` — the same payload the old
 * `CallbackForm` posts. On success the fields give way to a thank-you line; the
 * card, watermark and photo stay put.
 */
export default function CallbackV2({ locale, role = "Client" }: Props) {
  const dict = getDict(locale);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "sending" || !name.trim() || !phone.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch(`${CMS_API}/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: normalizePhone(phone), role }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("done");
      setName("");
      setPhone("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="hv2-shell hv2-section hv2-s-callback">
      <div className="hv2-cb">
        <div className="hv2-cb__watermark" aria-hidden="true">
          <Image src="/images/figma/callback-watermark.svg" alt="" width={831} height={444} unoptimized />
        </div>

        <div className="hv2-cb__photo" aria-hidden="true">
          <Image
            src="/images/figma/callback-photo.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 588px"
          />
        </div>

        <form className="hv2-cb__form" onSubmit={handleSubmit}>
          <div className="hv2-cb__text">
            <h2 className="hv2-cb__title">{dict.callback.title}</h2>
            <p className="hv2-cb__lead">
              {status === "done" ? (
                dict.callback.success
              ) : (
                <>
                  {dict.callback.lead[0]}
                  <br />
                  {dict.callback.lead[1]}
                </>
              )}
            </p>
          </div>

          {status === "done" ? null : (
            <>
              <label className="hv2-input-field">
                <span>{dict.callback.nameLabel}</span>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={dict.callback.namePlaceholder}
                  required
                />
              </label>

              <label className="hv2-input-field">
                <span>{dict.callback.phoneLabel}</span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={dict.callback.phonePlaceholder}
                  required
                />
              </label>

              {status === "error" ? (
                <p className="hv2-cb__error" role="alert">{dict.callback.error}</p>
              ) : null}

              <button
                type="submit"
                className="hv2-pill hv2-pill--dark hv2-pill--cta"
                disabled={status === "sending"}
              >
                {status === "sending" ? dict.callback.sending : dict.callback.cta}
                <Image
                  src="/images/icons/phone-light.svg"
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  unoptimized
                />
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
